const express = require('express');
const shortid = require('shortid');
const Url = require('./model');
const redis = require('./redis');
const urlQueue = require('./queue');
const authenticate = require('./middleware');

const router = express.Router();

router.post('/shorten', authenticate, async (req, res) => {
    try {
        const { originalUrl, customCode, expiryDays } = req.body;
        if (!originalUrl) {
            return res.status(400).json({ error: 'URL is required' });
        }

        if (customCode) {
            const existing = await Url.findOne({ shortCode: customCode });
            if (existing) {
                return res.status(400).json({ error: 'Custom Code already taken' });
            }
        }

        const shortCode = customCode || shortid.generate();

        let expiresAt = null;
        if (expiryDays !== undefined && expiryDays !== null) {
            expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + parseInt(expiryDays));
        }

        try {
            await urlQueue.add({
                originalUrl,
                shortCode,
                expiresAt,
                userId: req.userId
            });
        } catch (queueError) {
            console.log('Queue failed, saving directly:', queueError.message);
            const url = new Url({
                originalUrl,
                shortCode,
                expiresAt,
                userId: req.userId
            });
            await url.save();
        }

        if (expiresAt) {
            const ttl = Math.floor((expiresAt - new Date()) / 1000);
            await redis.setex(`url:${shortCode}`, ttl, originalUrl);
        } else {
            await redis.set(`url:${shortCode}`, originalUrl);
        }

        res.json({
            message: 'URL is being processed',
            shortCode,
            shortUrl: `${req.protocol}://${req.get('host')}/${shortCode}`,
            expiresAt: expiresAt || 'never'
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ← all specific routes ABOVE /:shortCode

router.get('/analytics/:shortCode', async (req, res) => {
    try {
        const { shortCode } = req.params;
        const url = await Url.findOne({ shortCode });

        if (!url) {
            return res.status(404).json({ error: 'URL not found' });
        }

        res.json({
            originalUrl: url.originalUrl,
            shortCode: url.shortCode,
            clicks: url.clicks,
            expiresAt: url.expiresAt || 'never',
            createdAt: url.createdAt
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/my-urls', authenticate, async (req, res) => {
    try {
        const urls = await Url.find({ userId: req.userId })
            .sort({ createdAt: -1 });
        res.json(urls);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.delete('/url/:shortCode', authenticate, async (req, res) => {
    try {
        const { shortCode } = req.params;
        const url = await Url.findOne({ shortCode });

        if (!url) {
            return res.status(404).json({ error: 'URL not found' });
        }

        if (url.userId.toString() !== req.userId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        await Url.deleteOne({ shortCode });
        await redis.del(`url:${shortCode}`);

        res.json({ message: 'URL deleted successfully' });

    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// ← /:shortCode always LAST
router.get('/:shortCode', async (req, res) => {
    try {
        const { shortCode } = req.params;

        const cachedUrl = await redis.get(`url:${shortCode}`);
        if (cachedUrl) {
            console.log('Redis HIT for', shortCode);
            await Url.findOneAndUpdate(
                { shortCode },
                { $inc: { clicks: 1 } }
            );
            return res.redirect(cachedUrl);
        }

        console.log('Redis MISS for', shortCode);

        const url = await Url.findOne({ shortCode });
        if (!url) {
            return res.status(404).json({ error: 'URL not found' });
        }

        if (url.expiresAt && url.expiresAt < new Date()) {
            await redis.del(`url:${shortCode}`);
            return res.status(410).json({ error: 'URL has expired' });
        }

        if (url.expiresAt) {
            const ttl = Math.floor((url.expiresAt - new Date()) / 1000);
            await redis.setex(`url:${shortCode}`, ttl, url.originalUrl);
        } else {
            await redis.set(`url:${shortCode}`, url.originalUrl);
        }

        url.clicks += 1;
        await url.save();
        res.redirect(url.originalUrl);

    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;

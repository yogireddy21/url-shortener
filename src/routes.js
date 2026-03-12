const express = require('express');
const shortid = require('shortid');
const Url = require('./model');
const redis = require('./redis');
const urlQueue = require('./queue');
const authenticate = require('./middleware');

const router = express.Router();

router.post('/shorten',authenticate, async (req, res) => {
    try {
        const { originalUrl, customCode, expiryDays } = req.body;
        if (!originalUrl) {
            return res.status(400).json({ error: 'URL is required' });
        }


        if (customCode) {
            const exsisitng = await Url.findOne({ shortCode: customCode });
            if (exsisitng) {
                return res.status(400).json({ error: 'Custom Code already token' });
            }
        }

        const shortCode = customCode || shortid.generate();

        let expiresAt = null;
        if (expiryDays !== undefined && expiryDays !== null) {
            expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + parseInt(expiryDays));
        }
        // add to queue instead of saving directly to MongoDB
        await urlQueue.add({
            originalUrl,
            shortCode,
            expiresAt,
            userId : req.userId
        });

        res.json({
            message: 'URL is being processed',
            shortCode,
            shortUrl: `http://localhost:3000/${shortCode}`,
            expiresAt: expiresAt || 'never'
        });

    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

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


router.get('/:shortCode', async (req, res) => {
    try {
        const { shortCode } = req.params;

        const cachedUrl = await redis.get(`url:${shortCode}`);
        if (cachedUrl) {
            console.log("Redis Hit for", shortCode);
            await Url.findOneAndUpdate(
                { shortCode },
                { $inc: { clicks: 1 } }
            );

            return res.redirect(cachedUrl);
        }

        console.log('Reddis MISS for', shortCode);

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
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
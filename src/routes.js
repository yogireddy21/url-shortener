const express = require('express');
const shortid = require('shortid');
const Url = require('./model');

const router = express.Router();

router.post('/shorten', async (req, res) => {
    try {
        const { originalUrl, customCode } = req.body;
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

        const url = new Url({
            originalUrl,
            shortCode
        });

        await url.save();

        res.json({
            originalUrl,
            shortCode,
            shortUrl: `http://localhost:3000/${shortCode}`
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
            createdAt: url.createdAt
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }

});


router.get('/:shortCode', async (req, res) => {
    try {
        const { shortCode } = req.params;
        const url = await Url.findOne({ shortCode });
        if (!url) {
            return res.status(404).json({ error: 'URL not found' });
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
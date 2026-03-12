const express = require('express');
const shortid = require('shortid');
const Url = require('./model');

const router = express.Router();

router.post('/shorten', async (req, res) => {
    try {
        const { originalUrl } = req.body;
        if (!originalUrl) {
            return res.status(400).json({ error: 'URL is required' });
        }

        const shortCode = shortid.generate();
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


router.get('/:shortCode', async (req, res) => {
    try {
        const { shortCode } = req.params;
        const url = await Url.findOne({ shortCode });
        if (!url) {
            return res.status(404).json({ error: 'URL not found' });
        }
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
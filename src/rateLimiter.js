const redis = require('./redis');

const rateLimiter = async (req, res, next) => {
    try {
        // only rate limit POST requests
        if (req.method !== 'POST') {
            return next();
        }

        const ip = req.ip;
        const key = `ratelimit:${ip}`;
        const limit = 10;
        const window = 60;

        const requests = await redis.incr(key);

        if (requests === 1) {
            await redis.expire(key, window);
        }

        if (requests > limit) {
            return res.status(429).json({
                error: 'Too many requests, please try again after a minute'
            });
        }

        next();

    } catch (error) {
        next();
    }
};

module.exports = rateLimiter;
const Bull = require('bull');
const Url = require('./model');

let urlQueue;

try {
    urlQueue = new Bull('url-queue', process.env.REDIS_URL || 'redis://localhost:6379');

    urlQueue.process(async (job) => {
        const { originalUrl, shortCode, expiresAt, userId } = job.data;
        const url = new Url({
            originalUrl,
            shortCode,
            expiresAt,
            userId
        });
        await url.save();
        console.log(`Processed job for ${shortCode}`);
    });

    urlQueue.on('completed', (job) => {
        console.log(`Job ${job.id} completed`);
    });

    urlQueue.on('failed', (job, error) => {
        console.log(`Job ${job.id} failed`, error.message);
    });

    console.log('Queue initialized');

} catch (error) {
    console.log('Queue initialization failed:', error.message);
}

module.exports = urlQueue;
const Bull = require('bull');
const Url = require('./model');

const urlQueue = new Bull('url-queue', {
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
    }
});


urlQueue.process(async (job) => {
    const { originalUrl, shortCode, expiresAt , userId} = job.data;
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
    console.log(`Job ${job.id} failed`, error);
});



module.exports = urlQueue;
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./db');
const routes = require('./routes');
const rateLimiter = require('./rateLimiter');

dotenv.config();
const app = express();
app.use(express.json());
app.use(rateLimiter);
connectDB();
app.use('/', routes);
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servering is running on port ${PORT}`);
});

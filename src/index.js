const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = require('./db');
const routes = require('./routes');
const rateLimiter = require('./rateLimiter');
const authRoutes = require('./auth');
const cors = require('cors');

const app = express();

app.use(cors({
    origin: '*',
    credentials: false
}));

app.use(express.json());

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.get('/', (req, res) => {
    res.json({
        message: 'URL Shortener API',
        endpoints: {
            signup: 'POST /auth/signup',
            login: 'POST /auth/login',
            shorten: 'POST /shorten',
            redirect: 'GET /:shortCode',
            analytics: 'GET /analytics/:shortCode'
        }
    });
});

app.use(rateLimiter);
app.use('/auth', authRoutes);
app.use('/', routes);

app.use((err, req, res, next) => {
    console.log('ERROR:', err.message);
    res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    connectDB();
});

process.on('unhandledRejection', (error) => {
    console.log('Unhandled Rejection:', error.message);
});

process.on('uncaughtException', (error) => {
    console.log('Uncaught Exception:', error.message);
});
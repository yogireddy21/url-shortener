const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./db');
const routes = require('./routes');
const rateLimiter = require('./rateLimiter');
const authRoutes = require('./auth');
const cors = require('cors');

dotenv.config();
const app = express();

app.use(cors({
    origin: '*',
    credentials: false
}));

app.use(express.json());
app.use(rateLimiter);
connectDB();
app.use('/auth', authRoutes);
app.use('/', routes);

// catch all errors
app.use((err, req, res, next) => {
    console.log('ERROR:', err.message);
    res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servering is running on port ${PORT}`);
});

process.on('unhandledRejection', (error) => {
    console.log('Unhandled Rejection:', error.message);
});
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const paypalPayoutRouter = require('./api/paypal-payout');

const app = express();

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'], // Add your React app URL
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Routes
app.use('/api/paypal', paypalPayoutRouter);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Baguio PineLodge PayPal Payout API',
        status: 'running',
        endpoints: {
            health: '/api/paypal/health',
            payout: 'POST /api/paypal/payout',
            checkStatus: 'GET /api/paypal/payout/:payoutBatchId'
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: err.message
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log('🚀 Baguio PineLodge PayPal Payout Server');
    console.log(`📡 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.PAYPAL_MODE || 'sandbox'}`);
    console.log(`⏰ Started at: ${new Date().toISOString()}`);
});

module.exports = app;

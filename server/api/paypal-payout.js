const express = require('express');
const router = express.Router();
const paypal = require('@paypal/payouts-sdk');

// PayPal environment setup
const clientId = process.env.PAYPAL_CLIENT_ID;
const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
const mode = process.env.PAYPAL_MODE || 'sandbox';

// Use SandboxEnvironment for testing, LiveEnvironment for production
const environment = mode === 'live' 
    ? new paypal.core.LiveEnvironment(clientId, clientSecret)
    : new paypal.core.SandboxEnvironment(clientId, clientSecret);

const client = new paypal.core.PayPalHttpClient(environment);

// Payout endpoint
router.post('/payout', async (req, res) => {
    try {
        const { recipientEmail, amount, currency, bookingId, note } = req.body;

        // Validate input
        if (!recipientEmail || !amount || !bookingId) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: recipientEmail, amount, and bookingId are required'
            });
        }

        // Validate amount
        if (isNaN(amount) || amount <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid amount. Must be a positive number.'
            });
        }

        // Create payout request
        const requestBody = {
            sender_batch_header: {
                sender_batch_id: `booking_${bookingId}_${Date.now()}`,
                email_subject: 'You have received a payment from Baguio PineLodge',
                email_message: 'You have received a payout for a confirmed booking. Thank you for hosting with Baguio PineLodge!'
            },
            items: [{
                recipient_type: 'EMAIL',
                amount: {
                    value: parseFloat(amount).toFixed(2),
                    currency: currency || 'PHP'
                },
                note: note || `Payment for booking ${bookingId}`,
                sender_item_id: `item_${bookingId}_${Date.now()}`,
                receiver: recipientEmail
            }]
        };

        const request = new paypal.payouts.PayoutsPostRequest();
        request.requestBody(requestBody);

        // Execute payout
        const response = await client.execute(request);

        // Log successful payout
        console.log('✅ Payout created successfully:', {
            batchId: response.result.batch_header.payout_batch_id,
            status: response.result.batch_header.batch_status,
            recipient: recipientEmail,
            amount: amount,
            bookingId: bookingId
        });

        res.json({
            success: true,
            payoutId: response.result.batch_header.payout_batch_id,
            status: response.result.batch_header.batch_status,
            message: 'Payout processed successfully',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ PayPal payout error:', error);
        
        // Handle specific PayPal errors
        let errorMessage = 'Payout processing failed';
        if (error.statusCode === 401) {
            errorMessage = 'PayPal authentication failed. Check your credentials.';
        } else if (error.statusCode === 403) {
            errorMessage = 'PayPal Payouts feature not enabled for this account.';
        } else if (error.message) {
            errorMessage = error.message;
        }

        res.status(error.statusCode || 500).json({
            success: false,
            error: errorMessage,
            details: error.response?.body || null
        });
    }
});

// Check payout status endpoint
router.get('/payout/:payoutBatchId', async (req, res) => {
    try {
        const request = new paypal.payouts.PayoutsGetRequest(req.params.payoutBatchId);
        const response = await client.execute(request);

        console.log('📊 Payout status checked:', {
            batchId: req.params.payoutBatchId,
            status: response.result.batch_header.batch_status
        });

        res.json({
            success: true,
            status: response.result.batch_header.batch_status,
            details: response.result
        });
    } catch (error) {
        console.error('❌ Error checking payout status:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to check payout status'
        });
    }
});

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        mode: mode,
        timestamp: new Date().toISOString()
    });
});

module.exports = router;

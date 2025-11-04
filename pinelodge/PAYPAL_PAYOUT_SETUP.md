# PayPal Payout Integration Guide

## Overview
This guide explains how to implement automatic PayPal payouts from the admin's PayPal account to hosts' PayPal accounts when bookings are confirmed.

## Prerequisites

1. **PayPal Business Account** (Admin/Platform account)
2. **PayPal REST API Credentials**
   - Client ID
   - Secret Key
3. **PayPal Payouts API Access** (requires approval from PayPal)
4. **Backend Server** (Node.js/Express recommended)

## Step 1: Apply for PayPal Payouts API Access

1. Log into your PayPal Business account
2. Go to Dashboard → Developer → My Apps & Credentials
3. Create a REST API app
4. Request Payouts feature approval (takes 1-3 business days)

## Step 2: Backend API Setup (Node.js/Express Example)

### Install Dependencies
```bash
npm install express @paypal/payouts-sdk dotenv
```

### Create Backend API Endpoint

Create a file: `server/api/paypal-payout.js`

```javascript
const express = require('express');
const router = express.Router();
const paypal = require('@paypal/payouts-sdk');

// PayPal environment setup
const clientId = process.env.PAYPAL_CLIENT_ID;
const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

// Use SandboxEnvironment for testing, LiveEnvironment for production
const environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
// For production: const environment = new paypal.core.LiveEnvironment(clientId, clientSecret);

const client = new paypal.core.PayPalHttpClient(environment);

// Payout endpoint
router.post('/payout', async (req, res) => {
    try {
        const { recipientEmail, amount, currency, bookingId, note } = req.body;

        // Validate input
        if (!recipientEmail || !amount || !bookingId) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        // Create payout request
        const requestBody = {
            sender_batch_header: {
                sender_batch_id: `booking_${bookingId}_${Date.now()}`,
                email_subject: 'You have received a payment from Baguio PineLodge',
                email_message: 'You have received a payout for a confirmed booking.'
            },
            items: [{
                recipient_type: 'EMAIL',
                amount: {
                    value: amount.toString(),
                    currency: currency || 'PHP'
                },
                note: note || `Payment for booking ${bookingId}`,
                sender_item_id: `item_${bookingId}`,
                receiver: recipientEmail
            }]
        };

        const request = new paypal.payouts.PayoutsPostRequest();
        request.requestBody(requestBody);

        // Execute payout
        const response = await client.execute(request);

        // Log successful payout
        console.log('Payout created:', response.result);

        res.json({
            success: true,
            payoutId: response.result.batch_header.payout_batch_id,
            status: response.result.batch_header.batch_status,
            message: 'Payout processed successfully'
        });

    } catch (error) {
        console.error('PayPal payout error:', error);
        
        res.status(500).json({
            success: false,
            error: error.message || 'Payout processing failed',
            details: error.response?.body || null
        });
    }
});

// Check payout status endpoint
router.get('/payout/:payoutBatchId', async (req, res) => {
    try {
        const request = new paypal.payouts.PayoutsGetRequest(req.params.payoutBatchId);
        const response = await client.execute(request);

        res.json({
            success: true,
            status: response.result.batch_header.batch_status,
            details: response.result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
```

### Create Environment File

Create `.env` file in your backend root:

```env
PAYPAL_CLIENT_ID=your_client_id_here
PAYPAL_CLIENT_SECRET=your_client_secret_here
PAYPAL_MODE=sandbox  # Change to 'live' for production
PORT=5000
```

### Main Server File

Create `server/index.js`:

```javascript
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const paypalPayoutRouter = require('./api/paypal-payout');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/paypal', paypalPayoutRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
```

## Step 3: Update Frontend Code

Update the `processPayPalPayout` function in `ManageBookings.js`:

```javascript
const processPayPalPayout = async (payoutData) => {
    try {
        // Replace with your actual backend URL
        const response = await fetch('http://localhost:5000/api/paypal/payout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payoutData),
        });
        
        const result = await response.json();
        return result;

    } catch (error) {
        console.error("PayPal payout error:", error);
        return {
            success: false,
            error: error.message || "Payout processing failed"
        };
    }
};
```

## Step 4: Host PayPal Email Storage

Hosts need to provide their PayPal email. Add this to host profile:

### In ProfileSettings or GetStarted component:

```javascript
// Add PayPal email field
<TextField
    label="PayPal Email (for receiving payments)"
    type="email"
    value={paypalEmail}
    onChange={(e) => setPaypalEmail(e.target.value)}
    helperText="Enter the email associated with your PayPal account"
    required
/>

// Save to Firestore
await updateDoc(doc(db, "users", user.uid), {
    paypalEmail: paypalEmail
});
```

## Step 5: Testing

### Sandbox Testing
1. Create test accounts at developer.paypal.com
2. Use sandbox credentials
3. Test payouts with test emails

### Checklist Before Production
- [ ] PayPal Payouts API approved
- [ ] Live credentials configured
- [ ] SSL certificate on backend
- [ ] Error handling implemented
- [ ] Transaction logging enabled
- [ ] Host PayPal emails verified

## Important Notes

### Security
- **NEVER** expose PayPal credentials in frontend code
- Always use backend API for PayPal operations
- Use HTTPS for all API calls
- Implement authentication/authorization for API endpoints

### Fees
- PayPal charges fees for payouts (varies by country)
- Review PayPal's fee structure
- Consider who pays the fee (platform or host)

### Currency
- Ensure currency matches (PHP/USD/etc.)
- Handle currency conversions if needed
- Check PayPal's supported currencies

### Error Handling
- Insufficient funds in admin account
- Invalid host PayPal email
- PayPal API downtime
- Transaction limits

## Alternative: Manual Payout Process

If automatic payouts are not immediately feasible:

1. **Batch Processing**: Collect confirmed bookings weekly
2. **Manual Transfer**: Admin transfers via PayPal dashboard
3. **Record Keeping**: Update `paymentTransferred` field manually
4. **Notification**: Email hosts when payment sent

## Support Resources

- [PayPal Payouts API Documentation](https://developer.paypal.com/docs/payouts/)
- [PayPal Node.js SDK](https://github.com/paypal/Payouts-NodeJS-SDK)
- PayPal Developer Support: developer.paypal.com/support

## Current Implementation Status

✅ Frontend UI for confirm/reject bookings
✅ Database status updates (payoutStatus, paymentTransferred)
✅ Basic payout function structure
⚠️ Backend API endpoint (needs implementation)
⚠️ PayPal SDK integration (needs credentials)
⚠️ Host PayPal email collection (needs UI)

---

**Note**: The current code has a placeholder payout function that simulates success. Replace it with actual backend API calls before production deployment.

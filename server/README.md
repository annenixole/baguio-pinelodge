# Baguio PineLodge PayPal Payout Server

Backend API server for handling PayPal payout transactions when hosts confirm bookings.

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
# Copy example environment file
copy .env.example .env

# Edit .env and add your PayPal credentials
```

### 3. Start Server
```bash
npm start
```

Or use the startup script:
```bash
start-server.bat
```

## API Endpoints

### POST /api/paypal/payout
Process a payout to host's PayPal account

**Request Body:**
```json
{
  "recipientEmail": "host@example.com",
  "amount": 1000,
  "currency": "PHP",
  "bookingId": "booking123",
  "note": "Payment for booking"
}
```

**Response:**
```json
{
  "success": true,
  "payoutId": "PAYOUT-XXXXX",
  "status": "SUCCESS",
  "message": "Payout processed successfully"
}
```

### GET /api/paypal/payout/:payoutBatchId
Check status of a payout

**Response:**
```json
{
  "success": true,
  "status": "SUCCESS",
  "details": { ... }
}
```

### GET /api/paypal/health
Health check endpoint

**Response:**
```json
{
  "status": "ok",
  "mode": "sandbox",
  "timestamp": "2025-11-04T..."
}
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PAYPAL_CLIENT_ID` | PayPal API Client ID | Yes |
| `PAYPAL_CLIENT_SECRET` | PayPal API Secret | Yes |
| `PAYPAL_MODE` | `sandbox` or `live` | No (default: sandbox) |
| `PORT` | Server port | No (default: 5000) |

## Development

```bash
# Install dev dependencies
npm install --save-dev nodemon

# Run with auto-reload
npm run dev
```

## Testing

Test the health endpoint:
```bash
curl http://localhost:5000/api/paypal/health
```

Test payout endpoint:
```bash
curl -X POST http://localhost:5000/api/paypal/payout \
  -H "Content-Type: application/json" \
  -d '{
    "recipientEmail": "sb-test@personal.example.com",
    "amount": 100,
    "currency": "PHP",
    "bookingId": "test123",
    "note": "Test payout"
  }'
```

## Production Deployment

1. Change `PAYPAL_MODE=live` in `.env`
2. Use production PayPal credentials
3. Enable HTTPS/SSL
4. Set up proper authentication
5. Configure firewall rules
6. Set up monitoring and logging

## Troubleshooting

**"Authentication failed"**
- Check PayPal credentials in `.env`
- Verify credentials are for correct mode (sandbox/live)

**"Payouts feature not enabled"**
- Wait for PayPal approval (1-3 business days)
- Check app status in PayPal Developer Dashboard

**Port already in use**
- Change `PORT` in `.env`
- Or kill process using port 5000

## Security Notes

- Never commit `.env` file
- Keep PayPal credentials secure
- Use HTTPS in production
- Implement rate limiting
- Add authentication middleware

## Support

For issues or questions:
- Check IMPLEMENTATION_COMPLETE.md
- PayPal Docs: https://developer.paypal.com/docs/payouts/
- PayPal Support: developer.paypal.com/support

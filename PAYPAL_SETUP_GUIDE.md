# 🚀 PayPal Payout Setup Guide

## ✅ What's Already Done

1. ✅ Frontend code integrated in `ManageBookings.js`
2. ✅ Backend server created in `/server` folder
3. ✅ PayPal SDK installed
4. ✅ Host PayPal email field in Profile Settings
5. ✅ Booking confirmation with payment transfer

---

## 📋 Setup Steps

### Step 1: Get PayPal API Credentials

1. **Go to PayPal Developer Portal**
   - Visit: https://developer.paypal.com/
   - Sign in with your PayPal account

2. **Create a Sandbox Account (for testing)**
   - Go to "Dashboard" → "Sandbox" → "Accounts"
   - Create TWO accounts:
     - **Business Account** (This will be the admin/main account)
     - **Personal Account** (For testing as a host)
   - Note down the emails for both accounts

3. **Get API Credentials**
   - Go to "Dashboard" → "My Apps & Credentials"
   - Under "Sandbox", click "Create App"
   - App Name: "Baguio Pine Lodge Payouts"
   - Select the Business sandbox account
   - Click "Create App"
   - Copy the **Client ID** and **Secret** (click "Show" to reveal)

---

### Step 2: Configure Backend Server

1. **Create .env file in `/server` folder**
   ```bash
   cd server
   copy .env.example .env
   ```

2. **Edit the .env file** with your credentials:
   ```bash
   # PayPal Configuration
   PAYPAL_CLIENT_ID=YOUR_CLIENT_ID_HERE
   PAYPAL_CLIENT_SECRET=YOUR_CLIENT_SECRET_HERE
   PAYPAL_MODE=sandbox

   # Server Configuration
   PORT=5000

   # CORS
   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
   ```

3. **For Production (when ready)**:
   - Change `PAYPAL_MODE=live`
   - Get live credentials from PayPal dashboard
   - Update `ALLOWED_ORIGINS` with your production URL

---

### Step 3: Start the Backend Server

**Option A: Using the batch file (Recommended)**
```bash
cd server
start-server.bat
```

**Option B: Using npm directly**
```bash
cd server
npm start
```

The server should start on **http://localhost:5000**

You should see:
```
🚀 Server running on port 5000
✅ PayPal configured in sandbox mode
```

---

### Step 4: Test the System

1. **Add PayPal Email to Host Profile**
   - Login as a host
   - Go to Profile Settings
   - Add your **test PayPal business email** (from sandbox account)
   - Save

2. **Create a Test Booking**
   - Login as a guest
   - Book an accommodation/service
   - Complete the booking

3. **Confirm the Booking as Host**
   - Login as the host
   - Go to Bookings management
   - Click "Confirm" on a pending booking
   - The system will:
     - ✅ Confirm the booking
     - 💸 Transfer payment to host's PayPal
     - 📧 Show success message with batch ID

4. **Verify Payment in PayPal**
   - Login to PayPal sandbox
   - Check the host's account
   - You should see the payment received

---

## 🔍 Troubleshooting

### Server Won't Start
```bash
# Make sure dependencies are installed
cd server
npm install

# Check if port 5000 is available
netstat -ano | findstr :5000
```

### PayPal API Errors

**Error: "Authentication failed"**
- ✅ Check Client ID and Secret are correct
- ✅ Make sure there are no extra spaces in .env file
- ✅ Restart the server after changing .env

**Error: "Receiver email is not verified"**
- ✅ Use PayPal sandbox accounts only for testing
- ✅ Make sure the receiver is a Business or Premier account
- ✅ For production, hosts must have verified PayPal accounts

**Error: "Insufficient funds"**
- In sandbox: Add test funds to the admin account
- Go to Sandbox Accounts → Click on email → Add/Withdraw Money

### Frontend Errors

**Error: "Failed to fetch"**
- ✅ Make sure backend server is running (http://localhost:5000)
- ✅ Check CORS settings in server/.env
- ✅ Verify REACT_APP_PAYPAL_API_URL in pinelodge/.env.local

**Error: "PayPal Email Required"**
- ✅ Host must add PayPal email in Profile Settings
- ✅ Email must be valid PayPal account

---

## 🎯 Testing Checklist

- [ ] Backend server starts successfully
- [ ] Host can add PayPal email in profile
- [ ] Booking confirmation triggers payout
- [ ] Success message shows batch ID
- [ ] Payment appears in PayPal sandbox account
- [ ] Booking status updates correctly
- [ ] Error handling works (try with invalid email)

---

## 🚀 Production Deployment

### Backend Server
1. Deploy to a hosting service (Heroku, Railway, DigitalOcean, etc.)
2. Set environment variables on hosting platform
3. Change `PAYPAL_MODE=live`
4. Update `ALLOWED_ORIGINS` with production domain
5. Use live PayPal credentials

### Frontend
1. Update `.env.local` with production API URL:
   ```bash
   REACT_APP_PAYPAL_API_URL=https://your-api-domain.com
   ```
2. Rebuild and deploy React app

### PayPal
1. Request Payouts API approval from PayPal
   - Go to developer.paypal.com
   - Submit request for Payouts approval
   - Wait 1-3 business days
2. Get live API credentials
3. Test with small amounts first

---

## 📊 How It Works

```
1. Guest books accommodation → Payment stored in admin account
2. Host confirms booking → Triggers payout process
3. Backend server calls PayPal API → Transfer money
4. PayPal processes payout → Money sent to host
5. System updates booking status → Shows confirmation
```

---

## 💡 Important Notes

- **Sandbox Mode**: For testing only, uses fake money
- **Live Mode**: Real transactions with real money
- **PayPal Fees**: PayPal charges fees for payouts (usually 2%)
- **Batch ID**: Unique identifier for tracking payouts
- **Security**: Never commit .env files to Git
- **Approval**: Payouts API requires PayPal approval for production

---

## 📞 Need Help?

- PayPal Developer Docs: https://developer.paypal.com/docs/payouts/
- PayPal Sandbox Guide: https://developer.paypal.com/tools/sandbox/
- Test with sandbox accounts first before going live

---

## 🎉 You're All Set!

Once you complete the setup:
1. Start the backend server
2. Add PayPal credentials
3. Test with sandbox accounts
4. Deploy to production when ready

**Good luck with your Pine Lodge booking system! 🏡**

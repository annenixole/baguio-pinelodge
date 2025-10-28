# Email Verification Template Setup Guide

## Overview
This guide explains how to customize the email verification email that users receive when signing up for Baguio Pinelodge.

## Files Created
- `email-verification-template.html` - Custom HTML email template

## Setup Instructions

### Step 1: Access Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **baguio-pinelodge**
3. Navigate to **Authentication** in the left sidebar
4. Click on the **Templates** tab at the top

### Step 2: Customize Email Template
1. Find and click on **Email address verification** template
2. Click the **Edit** (pencil icon) button
3. You'll see three sections to customize:

#### A. Sender Name
- Set to: `Baguio Pinelodge` or `Baguio Pinelodge Team`

#### B. Subject
- Set to: `Verify your email for Baguio Pinelodge`

#### C. Email Body
- Copy the entire content from `email-verification-template.html`
- Paste it into the email body field
- Firebase will automatically replace these placeholders:
  - `%DISPLAY_NAME%` - User's display name
  - `%EMAIL%` - User's email address
  - `%LINK%` - Verification link

### Step 3: Customize Action URL (Optional)
1. In the same template editor, find **Customize action URL**
2. By default it uses: `https://baguio-pinelodge.firebaseapp.com/__/auth/action`
3. If you want users to land on your custom verification page, you can change it

### Step 4: Save and Test
1. Click **Save** button
2. Test by creating a new user account
3. Check the email in your inbox

## Template Features

### Design Elements
✅ **Brand Colors**: Uses Baguio Pinelodge colors (#30410D, #DE7001)
✅ **Responsive**: Works on all devices and email clients
✅ **Professional Layout**: Clean, modern design
✅ **Clear CTA**: Prominent "Verify Email Address" button
✅ **Alternative Link**: Fallback URL for users who can't click buttons
✅ **Info Box**: Highlights important information (24-hour expiry)
✅ **Footer**: Contact information and branding

### Email Structure
```
┌─────────────────────────────────┐
│    Header (Green gradient)      │
│    BAGUIO PINELODGE             │
├─────────────────────────────────┤
│    Welcome Message              │
│    Verification Button          │
│    Alternative Link             │
│    Info Box (Expiry notice)     │
├─────────────────────────────────┤
│    Footer (Contact info)        │
├─────────────────────────────────┤
│    Copyright (Dark green)       │
└─────────────────────────────────┘
```

## Alternative: Custom Email Service

If you need more control over emails, you can use a third-party email service:

### Option 1: SendGrid
- Free tier: 100 emails/day
- Professional templates
- Analytics and tracking

### Option 2: Mailgun
- Free tier: 5,000 emails/month
- Email validation
- Real-time tracking

### Option 3: AWS SES
- Very low cost
- High deliverability
- Requires AWS account

## Troubleshooting

### Email goes to Spam
- Ensure sender name is set correctly
- Add SPF and DKIM records (Firebase handles this automatically)
- Ask users to whitelist `baguiopinelodge@gmail.com`

### Template not showing correctly
- Some email clients strip CSS
- The provided template uses inline styles for maximum compatibility
- Test in multiple email clients (Gmail, Outlook, Yahoo, etc.)

### Users not receiving emails
- Check Firebase quotas
- Verify email is not in spam folder
- Check if email address is valid
- Review Firebase Authentication logs

## Support
For issues or questions, contact: baguiopinelodge@gmail.com

---
**Last Updated**: October 27, 2025

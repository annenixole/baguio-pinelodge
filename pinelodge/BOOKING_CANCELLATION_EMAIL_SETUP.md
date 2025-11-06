# Booking Cancellation Email Setup Guide

## Step 1: Create Template in EmailJS Dashboard

1. **Login to EmailJS**: https://dashboard.emailjs.com/
2. **Go to Email Templates** (left sidebar)
3. **Click "Create New Template"**

## Step 2: Configure Template Settings

- **Template Name**: `Booking Cancellation Notification`
- **Template ID**: Copy this ID (e.g., `template_abc123`)

## Step 3: Paste HTML Content

In the **"Content"** tab, paste the following HTML:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        /* Mobile Responsive Styles */
        @media only screen and (max-width: 600px) {
            .email-container {
                width: 100% !important;
                max-width: 100% !important;
            }
            .content-padding {
                padding: 30px 20px !important;
            }
            .header-padding {
                padding: 20px 15px !important;
            }
            .footer-padding {
                padding: 20px 20px !important;
            }
            .logo-img {
                width: 60px !important;
                height: 60px !important;
            }
            .heading {
                font-size: 20px !important;
            }
            .text-body {
                font-size: 14px !important;
            }
            .footer-text {
                font-size: 11px !important;
            }
            .details-table td {
                font-size: 14px !important;
            }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 10px;">
        <tr>
            <td align="center">
                <table class="email-container" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                    
                    <!-- Header with Logo -->
                    <tr>
                        <td class="header-padding" style="padding: 20px 20px; text-align: center;">
                            <img class="logo-img" src="https://i.imgur.com/eHhopoN.png" 
                                 alt="Baguio Pinelodge Logo" 
                                 style="height: 40px; margin-bottom: 15px; display: block; margin-left: auto; margin-right: auto;" />
                            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 0;"/>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td class="content-padding" style="padding: 40px 30px;">
                            <h2 class="heading" style="margin: 0 0 20px 0; color: #30410D; font-size: 24px; font-weight: 700; text-align:center">Booking Cancelled</h2>
                            
                            <p class="text-body" style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                                Hello <strong>{{username}}</strong>,
                            </p>
                            
                            <p class="text-body" style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                                This is to confirm that your booking at <strong style="color: #30410D;">{{booking_title}}</strong> has been successfully cancelled as per your request.
                            </p>
                            
                            <p class="text-body" style="margin: 0 0 25px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                                Don't worry — your payment will be refunded within 24 hours. If you haven't received your refund after that time, please contact us at 
                                <a href="mailto:pinelodgebaguio@gmail.com" style="color: #70873F; text-decoration: none;">pinelodgebaguio@gmail.com</a>.
                            </p>

                            <p class="text-body" style="margin: 25px 0 0 0; color: #666666; text-align: center; font-size: 14px; line-height: 1.5;">
                                We hope to host you another time soon. Thank you for considering Baguio Pinelodge!
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td class="footer-padding" style="padding: 25px 30px; background-color: #fafafa; border-top: 1px solid #e0e0e0;">
                            <p class="footer-text" style="margin: 0 0 10px 0; color: #999999; font-size: 13px; line-height: 1.5;">
                                Best regards,<br><strong style="color: #30410D;">The Baguio Pinelodge Team</strong>
                            </p>
                            <p class="footer-text" style="margin: 10px 0 0 0; color: #999999; font-size: 12px; line-height: 1.5;">
                                This email was sent to <strong style="color: #30410D;">{{email}}</strong>
                            </p>
                            <p class="footer-text" style="margin: 10px 0 0 0; color: #999999; font-size: 12px; line-height: 1.5;">
                                Contact: <a href="mailto:pinelodgebaguio@gmail.com" style="color: #70873F; text-decoration: none;">pinelodgebaguio@gmail.com</a>
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Copyright -->
                    <tr>
                        <td style="background-color: #30410D; padding: 20px 15px; text-align: center;">
                            <p class="footer-text" style="margin: 0; color: #ffffff; font-size: 11px; line-height: 1.4;">© 2025 Baguio Pinelodge. All rights reserved.</p>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
```

## Step 4: Configure Email Settings

In the **"Settings"** tab:
- **Subject**: `Booking Cancellation - {{booking_title}}`
- **From Name**: `Baguio Pinelodge`
- **Reply To**: `pinelodgebaguio@gmail.com`

## Step 5: Update Your Code

After creating the template, copy the **Template ID** and update it in `emailConfig.js`:

```javascript
bookingCancellationTemplateId: "template_YOUR_ID_HERE"
```

Replace `"template_XXXXX"` with your actual template ID.

## Step 6: How to Use

In your cancellation logic (e.g., MyBookings.js), import and use:

```javascript
import { sendBookingCancellationEmail } from '../emailConfig';

// When cancelling a booking:
const result = await sendBookingCancellationEmail(
  guestEmail,     // e.g., "user@example.com"
  guestName,      // e.g., "John Doe"
  bookingTitle    // e.g., "Cozy Mountain Cabin"
);

if (result.success) {
  console.log('Cancellation email sent!');
} else {
  console.error('Failed to send email:', result.error);
}
```

## Template Variables

The template uses these variables:
- `{{username}}` - Guest's name
- `{{booking_title}}` - Name of the accommodation
- `{{email}}` - Guest's email address

These are automatically replaced when you send the email.

## Notes

- EmailJS **requires** templates - you cannot send raw HTML
- The HTML must be created in the EmailJS dashboard
- Variables use double curly braces: `{{variable_name}}`
- Test the template using EmailJS's "Test it" feature before going live

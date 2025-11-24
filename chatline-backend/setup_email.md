# Email Configuration Setup Guide
  
 ## Gmail SMTP Configuration
 
 To send OTP verification emails, you need to configure Gmail SMTP settings. Follow these steps:
 
 ### 1. Enable 2-Factor Authentication
 1. Go to your Google Account settings
 2. Navigate to "Security" → "2-Step Verification"
 3. Enable 2-factor authentication for your account
 
 ### 2. Generate App Password
 1. After enabling 2FA, go to "App passwords" in Google Security settings
 2. Select "Mail" as the app
 3. Select "Other (custom name)" as the device
 4. Enter "ChatterWave" as the custom name
 5. Copy the generated 16-character password
 
 ### 3. Create .env file
 Copy `.env.example` to `.env` and fill in your credentials:
 
 ```bash
 cp .env.example .env
 ```
 
 Edit the `.env` file:
 
 ```env
 # Database Configuration
 DATABASE_URL="mysql://username:password@localhost:3306/chatterwave_db"
 
 # JWT Secret (Generate a secure random string)
 JWT_SECRET="your-super-secret-jwt-key-here"
 
 # Email Configuration (Gmail SMTP)
 SENDER_EMAIL="your-email@gmail.com"
 SENDER_PASSWORD="your-16-character-app-password"
 SENDER_NAME="ChatterWave"
 
 # Server Configuration
 PORT=8000
 NODE_ENV="development"
 
 # Frontend URLs (for CORS)
 FRONTEND_URL="http://localhost:5173"
 FRONTEND_PROD_URL="https://your-production-domain.com"
 ```
 
 ### 4. Test Email Configuration
 
 To test if your email configuration is working, you can create a simple test script:
 
 ```typescript
 // test-email.js
 import nodemailer from 'nodemailer';
 
 const transporter = nodemailer.createTransporter({
   host: "smtp.gmail.com",
   port: 587,
   secure: false,
   auth: {
     user: process.env.SENDER_EMAIL,
     pass: process.env.SENDER_PASSWORD,
   },
 });
 
 const testEmail = async () => {
   try {
     const result = await transporter.sendMail({
       from: `"${process.env.SENDER_NAME}" <${process.env.SENDER_EMAIL}>`,
       to: "test-recipient@example.com", // Replace with your test email
       subject: "Test Email from ChatterWave",
       html: `
         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
           <h1 style="color: #333; text-align: center;">ChatterWave Test Email</h1>
           <p>This is a test email to verify your SMTP configuration is working correctly.</p>
           <p>If you received this email, your email configuration is working!</p>
         </div>
       `,
     });
     console.log("Test email sent successfully:", result.response);
   } catch (error) {
     console.error("Error sending test email:", error);
   }
 };
 
 testEmail();
 ```
 
 Run this test to verify your email configuration works before testing the full OTP system.
 
 ### 5. Troubleshooting
 
 **Common Issues:**
 
 1. **"Authentication failed" error**
    - Make sure you're using an App Password, not your regular Gmail password
    - Verify 2FA is enabled on your account
 
 2. **"Account not allowed to send emails" error**
    - Gmail may block the app initially
    - Try sending a test email manually from your Gmail account first
    - Check Gmail security settings
 
 3. **"Invalid credentials" error**
    - Double-check your email and app password
    - Make sure there are no extra spaces
 
 4. **Email not received**
    - Check spam/junk folder
    - Verify the recipient email address is correct
    - Gmail may delay delivery for new senders
 
 ### 6. Production Considerations
 
 For production deployment:
 
 1. **Use a professional email service** (like SendGrid, AWS SES, or similar) instead of Gmail
 2. **Set up SPF, DKIM, and DMARC** records for your domain
 3. **Monitor email deliverability** and handle bounces
 4. **Consider using email templates** for better user experience
 
 ### 7. Testing the Full OTP Flow
 
 1. Start your backend server
 2. Register a new user through your frontend
 3. Check that an email is sent to the registered email address
 4. Use the OTP from the email to verify the account
 5. If the email isn't received, check:
    - Server logs for email sending errors
    - Your email's spam folder
    - Gmail security settings
 
 ### 8. Environment Variables Reference
 
 | Variable | Description | Example |
 |----------|-------------|---------|
 | `SENDER_EMAIL` | Your Gmail address | `your-email@gmail.com` |
 | `SENDER_PASSWORD` | Gmail App Password (16 characters) | `abcd-efgh-ijkl-mnop` |
 | `SENDER_NAME` | Display name in emails | `ChatterWave` |
 | `JWT_SECRET` | Secret for JWT token generation | `your-secret-key` |
 | `DATABASE_URL` | MySQL connection string | `mysql://user:pass@localhost/db` |
 
 Make sure all environment variables are properly set before starting your application.
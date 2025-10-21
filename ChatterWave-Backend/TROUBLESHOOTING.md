# Troubleshooting Guide for ChatterWave OTP Verification

## Issues Fixed

### 1. **Fixed: `nodemailer.createTransporter` Error**
- **Problem**: `TypeError: nodemailer.createTransporter is not a function`
- **Solution**: Changed `createTransporter` to `createTransport` (correct nodemailer method)
- **Files Fixed**: `helpers/auth.helpers.ts` and `test-email.js`

### 2. **JWT_SECRET Configuration**
- **Problem**: User doesn't know what to put for JWT_SECRET
- **Solution**: JWT_SECRET is a secret key used to sign authentication tokens

## Complete Setup Guide

### Step 1: Generate JWT_SECRET

Run this command to generate a secure JWT secret:

```bash
npm run generate-secret
```

Or manually generate one:

```bash
node -e "console.log('JWT_SECRET=\"' + require('crypto').randomBytes(64).toString('hex') + '\"')"
```

### Step 2: Set Up Gmail App Password

1. **Enable 2-Factor Authentication**:
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Enable "2-Step Verification"

2. **Generate App Password**:
   - In Google Security settings, go to "App passwords"
   - Select "Mail" as the app
   - Select "Other (custom name)" as the device
   - Enter "ChatterWave" and click "Generate"
   - Copy the 16-character password

3. **Create .env file**:
   ```bash
   cp .env.example .env
   ```

4. **Edit .env file**:
   ```env
   # Database Configuration
   DATABASE_URL="mysql://username:password@localhost:3306/chatterwave_db"

   # JWT Secret (Generate using: npm run generate-secret)
   JWT_SECRET="your-generated-secret-key-here"

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

### Step 3: Test Email Configuration

```bash
npm run test-email
```

**Expected Output**:
```
📧 Testing email configuration...
📧 Sender: your-email@gmail.com
✅ Test email sent successfully!
📧 Message ID: [some-id]@gmail.com
📧 Response: 250 2.0.0 OK [timestamp]

🎉 Email configuration is working correctly!
📬 Check your inbox/spam folder to confirm receipt.
```

### Step 4: Test the Full OTP Flow

1. **Start the backend server**:
   ```bash
   npm run dev
   ```

2. **Register a new user** through your frontend

3. **Check server logs** for email sending confirmation

4. **Verify the email** was received in your inbox

5. **Use the OTP** to complete verification

## Common Issues & Solutions

### **Error: "Authentication failed"**
```bash
❌ Error sending test email:
Error details: Invalid login: 535-5.7.8 Username and Password not accepted
```
**Solutions**:
1. Make sure you're using an **App Password**, not your regular Gmail password
2. Verify 2-Factor Authentication is enabled
3. Generate a new App Password if needed
4. Check if "Less secure app access" is disabled in Gmail settings

### **Error: "Account not allowed to send emails"**
**Solutions**:
1. Gmail may block the app initially - try sending manually first
2. Check Gmail security settings
3. Wait a few minutes and try again

### **Error: "Invalid credentials"**
**Solutions**:
1. Double-check your email and app password
2. Ensure there are no extra spaces in your `.env` file
3. Regenerate the app password

### **Email not received**
**Solutions**:
1. Check spam/junk folder
2. Verify the recipient email address is correct
3. Gmail may delay delivery for new senders

### **Database Connection Issues**
**Solutions**:
1. Make sure MySQL is running
2. Update the `DATABASE_URL` in your `.env` file
3. Check database credentials

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `JWT_SECRET` | Secret key for JWT token signing | `a8f5e2...` (64+ characters) |
| `SENDER_EMAIL` | Your Gmail address | `your-email@gmail.com` |
| `SENDER_PASSWORD` | Gmail App Password | `abcd-efgh-ijkl-mnop` |
| `SENDER_NAME` | Display name in emails | `ChatterWave` |
| `DATABASE_URL` | MySQL connection string | `mysql://user:pass@localhost/db` |
| `PORT` | Server port | `8000` |
| `NODE_ENV` | Environment mode | `development` |

## Production Deployment

For production:

1. **Use environment-specific `.env` files** (`.env.production`, `.env.development`)
2. **Never commit `.env` files** to version control
3. **Use a professional email service** (SendGrid, AWS SES) instead of Gmail
4. **Set up SPF, DKIM, and DMARC** records for your domain
5. **Monitor email deliverability** and handle bounces

## Quick Test Commands

```bash
# Generate JWT secret
npm run generate-secret

# Test email configuration
npm run test-email

# Start development server
npm run dev

# Install dependencies (if needed)
npm install
```

## Next Steps

1. ✅ Set up your `.env` file with correct credentials
2. ✅ Test email sending with `npm run test-email`
3. ✅ Start your backend server with `npm run dev`
4. ✅ Test user registration and OTP verification
5. ✅ Deploy to production with proper environment variables

If you encounter any issues, check the server logs and refer to the troubleshooting section above! 🚀
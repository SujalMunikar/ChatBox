import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const transporter = nodemailer.createTransport({
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
    // Check if environment variables are loaded
    if (!process.env.SENDER_EMAIL || !process.env.SENDER_PASSWORD) {
      console.error('❌ Environment variables not set!');
      console.log('Please make sure SENDER_EMAIL and SENDER_PASSWORD are set in your .env file');
      return;
    }

    console.log('📧 Testing email configuration...');
    console.log('📧 Sender:', process.env.SENDER_EMAIL);

    const result = await transporter.sendMail({
      from: `"${process.env.SENDER_NAME || 'ChatterWave'}" <${process.env.SENDER_EMAIL}>`,
      to: process.env.SENDER_EMAIL, // Send to yourself for testing
      subject: "ChatterWave Email Test",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; text-align: center;">✅ ChatterWave Email Test</h1>
          <div style="background-color: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #0066cc; margin-top: 0;">Email Configuration Test</h2>
            <p style="color: #333;">This is a test email to verify your SMTP configuration is working correctly.</p>
            <p style="color: #333;"><strong>If you received this email, your email configuration is working!</strong></p>
          </div>
          <div style="background-color: #fff3cd; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <p style="margin: 0;"><strong>Configuration Details:</strong></p>
            <p style="margin: 5px 0;">Sender Email: ${process.env.SENDER_EMAIL}</p>
            <p style="margin: 5px 0;">SMTP Host: smtp.gmail.com</p>
            <p style="margin: 5px 0;">Port: 587</p>
          </div>
          <p style="color: #666; font-size: 12px; text-align: center;">
            This is a test email. If you didn't expect this, please ignore it.
          </p>
        </div>
      `,
    });

    console.log('✅ Test email sent successfully!');
    console.log('📧 Message ID:', result.messageId);
    console.log('📧 Response:', result.response);
    console.log('\n🎉 Email configuration is working correctly!');
    console.log('📬 Check your inbox/spam folder to confirm receipt.');

  } catch (error) {
    console.error('❌ Error sending test email:');
    console.error('Error details:', error.message);

    if (error.code === 'EAUTH') {
      console.log('\n🔧 Troubleshooting suggestions:');
      console.log('1. Make sure you\'re using an App Password, not your regular Gmail password');
      console.log('2. Verify 2-Factor Authentication is enabled on your Google account');
      console.log('3. Generate a new App Password if the current one doesn\'t work');
      console.log('4. Check if "Less secure app access" is disabled in Gmail settings');
    }
  }
};

// Run the test
testEmail();
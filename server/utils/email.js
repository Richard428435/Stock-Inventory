const nodemailer = require('nodemailer');

const sendWelcomeEmail = async (userEmail, userName, password) => {
  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: `"Sacred Steward Admin" <${process.env.SMTP_USER}>`,
    to: userEmail,
    subject: 'Welcome to Sacred Steward - Your Account is Ready',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #333;">Welcome, ${userName}!</h2>
        <p>Your administrative account for the Church Inventory System has been successfully created.</p>
        <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Username (Email):</strong> ${userEmail}</p>
          <p style="margin: 10px 0 0 0;"><strong>Temporary Password:</strong> ${password}</p>
        </div>
        <p>Please login and change your password as soon as possible for security reasons.</p>
        <p style="color: #888; font-size: 0.8em; margin-top: 30px;">This is an automated message. Please do not reply directly to this email.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent:', info.messageId);
    return true;
  } catch (err) {
    console.error('❌ Error sending welcome email:', err.message);
    return false;
  }
};

module.exports = { sendWelcomeEmail };

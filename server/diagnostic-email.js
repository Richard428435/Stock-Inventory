require('dotenv').config();
const nodemailer = require('nodemailer');

const test = async () => {
  console.log('--- Email Diagnostic ---');
  console.log('Host:', process.env.SMTP_HOST);
  console.log('Port:', process.env.SMTP_PORT);
  console.log('User:', process.env.SMTP_USER);
  console.log('Pass:', process.env.SMTP_PASS ? '********' : 'MISSING');

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT == 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    debug: true, // Show debug output
    logger: true // Log information to console
  });

  try {
    console.log('\nVerifying transporter connection...');
    await transporter.verify();
    console.log('✅ Connection verified successfully!');

    console.log('\nSending test email...');
    const info = await transporter.sendMail({
      from: `"Diagnostic Test" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER, // Send to self
      subject: 'Sacred Steward - SMTP Diagnostic Test',
      text: 'If you are reading this, your SMTP settings are correct!',
      html: '<b>If you are reading this, your SMTP settings are correct!</b>'
    });
    console.log('✅ Test email sent:', info.messageId);
  } catch (err) {
    console.error('\n❌ DIAGNOSTIC FAILED');
    console.error('Error Name:', err.name);
    console.error('Error Message:', err.message);
    console.error('Error Code:', err.code);
    console.error('Error Command:', err.command);
  }
};

test();

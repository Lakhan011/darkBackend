const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const logger = require('../utils/logger');

// Create a single shared OAuth2 client
const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'https://developers.google.com/oauthplayground'
);

oAuth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN
});

// Dynamically create a fresh transporter with a valid access token
const createTransporter = async () => {
  const accessToken = await oAuth2Client.getAccessToken();

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.EMAIL_USER,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
      accessToken: accessToken.token // Always fresh
    }
  });
};

// Core send function
const sendEmail = async (to, subject, html, text = '') => {
  try {
    const transporter = await createTransporter();
    const info = await transporter.sendMail({
      from: `"${process.env.APP_NAME || 'DarkStore'}" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html
    });
    logger.info(`Email sent to ${to}: ${info.messageId}`);
    return true;
  } catch (error) {
    logger.error(`Error sending email to ${to}: ${error.message}`);
    return false;
  }
};

// ─────────────────────────────────────────────
// DarkStore Email Functions
// ─────────────────────────────────────────────

exports.sendOTPEmail = async (to, otp) => {
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; background:#f9f9f9;">
      <div style="max-width:500px; margin:auto; background:#fff; border-radius:10px; padding:30px;">
        <h2 style="color:#333;">Your OTP Code</h2>
        <p>Use the OTP below to verify your account. It expires in <b>5 minutes</b>.</p>
        <h1 style="color:#6c63ff; letter-spacing:10px; text-align:center;">${otp}</h1>
        <p style="color:red; font-size:13px;">Do not share this OTP with anyone.</p>
        <br/>
        <p>Best regards,<br/><b>${process.env.APP_NAME || 'DarkStore'} Team</b></p>
      </div>
    </div>
  `;
  return sendEmail(to, `Your OTP Code - ${process.env.APP_NAME || 'DarkStore'}`, html);
};

exports.sendWelcomeEmail = async (to, name) => {
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; background:#f9f9f9;">
      <div style="max-width:500px; margin:auto; background:#fff; border-radius:10px; padding:30px;">
        <h2 style="color:#333;">Welcome to ${process.env.APP_NAME || 'DarkStore'}, ${name}! 🎉</h2>
        <p>We're thrilled to have you on board. Start exploring thousands of products across top brands.</p>
        <a href="${process.env.CLIENT_URL || 'http://localhost:4200'}" 
           style="display:inline-block; margin-top:15px; padding:12px 24px; background:#6c63ff; color:#fff; border-radius:6px; text-decoration:none;">
          Start Shopping
        </a>
        <br/><br/>
        <p>Best regards,<br/><b>${process.env.APP_NAME || 'DarkStore'} Team</b></p>
      </div>
    </div>
  `;
  return sendEmail(to, `Welcome to ${process.env.APP_NAME || 'DarkStore'}!`, html);
};

exports.sendPasswordResetEmail = async (to, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:4200'}/auth/reset-password/${resetToken}`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; background:#f9f9f9;">
      <div style="max-width:500px; margin:auto; background:#fff; border-radius:10px; padding:30px;">
        <h2 style="color:#333;">Password Reset Request</h2>
        <p>We received a request to reset your password. Click the button below. This link expires in <b>10 minutes</b>.</p>
        <a href="${resetUrl}" 
           style="display:inline-block; margin-top:15px; padding:12px 24px; background:#e53e3e; color:#fff; border-radius:6px; text-decoration:none;">
          Reset Password
        </a>
        <p style="margin-top:15px; color:#666; font-size:13px;">If you did not request this, please ignore this email.</p>
        <br/>
        <p>Best regards,<br/><b>${process.env.APP_NAME || 'DarkStore'} Team</b></p>
      </div>
    </div>
  `;
  return sendEmail(to, `Password Reset - ${process.env.APP_NAME || 'DarkStore'}`, html);
};

exports.sendOrderConfirmationEmail = async (to, orderData) => {
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; background:#f9f9f9;">
      <div style="max-width:500px; margin:auto; background:#fff; border-radius:10px; padding:30px;">
        <h2 style="color:#38a169;">Order Confirmed! ✅</h2>
        <p>Your order <b>#${orderData.orderId}</b> has been placed successfully.</p>
        <p><b>Total Amount:</b> ₹${orderData.totalAmount}</p>
        <p><b>Payment Method:</b> ${orderData.paymentMethod}</p>
        <br/>
        <p>Best regards,<br/><b>${process.env.APP_NAME || 'DarkStore'} Team</b></p>
      </div>
    </div>
  `;
  return sendEmail(to, `Order Confirmed #${orderData.orderId} - ${process.env.APP_NAME || 'DarkStore'}`, html);
};

exports.sendOrderStatusEmail = async (to, orderData, status) => {
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; background:#f9f9f9;">
      <div style="max-width:500px; margin:auto; background:#fff; border-radius:10px; padding:30px;">
        <h2 style="color:#333;">Order Status Update 📦</h2>
        <p>Your order <b>#${orderData.orderId}</b> status has been updated to:</p>
        <h3 style="color:#6c63ff;">${status}</h3>
        <br/>
        <p>Best regards,<br/><b>${process.env.APP_NAME || 'DarkStore'} Team</b></p>
      </div>
    </div>
  `;
  return sendEmail(to, `Order Update #${orderData.orderId} - ${process.env.APP_NAME || 'DarkStore'}`, html);
};

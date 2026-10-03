const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // or other service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send a generic email
 */
exports.sendEmail = async (to, subject, html, text = '') => {
  try {
    const mailOptions = {
      from: `"Urban Farming Assistant" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email error:', error);
    throw error;
  }
};

/**
 * Send welcome email
 */
exports.sendWelcomeEmail = async (user) => {
  const html = `
    <h1>Welcome to Urban Farming Assistant, ${user.name}!</h1>
    <p>We're excited to help you grow your urban garden.</p>
    <p>Get started by adding your first garden and plants.</p>
    <a href="${process.env.FRONTEND_URL}/dashboard">Go to Dashboard</a>
  `;
  return exports.sendEmail(user.email, 'Welcome to Urban Farming Assistant', html);
};

/**
 * Send password reset email
 */
exports.sendPasswordResetEmail = async (userEmail, resetUrl) => {
  const subject = 'UrbanFarm - Reset Your Password';
  const text = `Hello,

You are receiving this email because you requested a password reset for your UrbanFarm account.

Please click on the following link or paste it into your browser to complete the process:
${resetUrl}

If you did not request a password reset, please ignore this email and your password will remain unchanged.

Best regards,
UrbanFarm Team`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 550px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #2e7d32; margin-top: 0;">UrbanFarm Password Reset</h2>
      <p>Hello,</p>
      <p>You requested a password reset for your UrbanFarm account. Click the button below to set a new password:</p>
      <div style="margin: 25px 0;">
        <a href="${resetUrl}" style="background-color: #27ae60; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
      </div>
      <p style="font-size: 0.9rem; color: #555;">Or copy and paste this link into your browser:</p>
      <p style="font-size: 0.85rem; word-break: break-all; color: #27ae60;">${resetUrl}</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 0.8rem; color: #888;">If you did not request this, please ignore this email.</p>
    </div>
  `;

  return exports.sendEmail(userEmail, subject, html, text);
};
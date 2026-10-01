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
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
exports.sendEmail = async (to, subject, html, text = '', attachments = []) => {
  try {
    const mailOptions = {
      from: `"UrbanFarm Assistant" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
      attachments,
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
 * Send congratulations email with badge image when a badge is unlocked
 */
exports.sendBadgeUnlockedEmail = async (user, badge) => {
  const fs = require('fs');
  const path = require('path');
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  // Always send to baraiyavishalbhai32@gmail.com for testing/notification as requested
  const targetTestEmail = 'baraiyavishalbhai32@gmail.com';
  const recipients = user?.email && user.email !== targetTestEmail
    ? `${user.email}, ${targetTestEmail}`
    : targetTestEmail;

  const subject = `🏆 Congratulations ${user?.name || 'Gardener'}! You've unlocked the ${badge.name} badge!`;

  const profileUrl = `${frontendUrl}/profile`;
  const shareMsg = `🌱 I just unlocked the "${badge.name}" (${badge.tier}) achievement on UrbanFarm! Check it out:`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareMsg} ${profileUrl}`)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`;
  const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMsg)}&url=${encodeURIComponent(profileUrl)}`;
  const instagramUrl = `https://www.instagram.com/`;

  const text = `Congratulations, ${user?.name || 'Urban Grower'}! 🎉

You have unlocked a new achievement badge on UrbanFarm:

🏆 ${badge.name} (${badge.tier})
${badge.description}

Keep up the fantastic work nurturing your plants and urban sanctuary!
View your achievements at: ${profileUrl}

Share your achievement with fellow gardeners:
- WhatsApp: ${whatsappUrl}
- LinkedIn: ${linkedinUrl}
- X (Twitter): ${xUrl}
- Instagram: ${instagramUrl}

Happy Gardening,
UrbanFarm Team 🌱`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Congratulations! New Badge Unlocked</title>
    </head>
    <body style="margin: 0; padding: 24px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f0fdf4; color: #1f2937;">
      <div style="max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 18px; overflow: hidden; border: 1px solid #dcfce7; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.02);">
        
        <!-- Header Banner -->
        <div style="background: linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
          <div style="font-size: 38px; line-height: 1; margin-bottom: 10px;">🎉</div>
          <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: -0.02em;">Congratulations, ${user?.name || 'Urban Grower'}!</h1>
          <p style="margin: 8px 0 0; font-size: 14px; color: #d8f3dc; opacity: 0.95;">You've unlocked a new achievement milestone on UrbanFarm</p>
        </div>

        <!-- Main Content -->
        <div style="padding: 32px 24px; text-align: center;">
          
          <!-- Badge Image Container -->
          <div style="margin: 0 auto 20px; width: 140px; height: 140px; border-radius: 50%; display: table; background: #ffffff; border: 3px solid ${badge.themeColor || '#2d6a4f'}; box-shadow: 0 8px 24px ${badge.themeColor || '#2d6a4f'}25;">
            <div style="display: table-cell; vertical-align: middle; text-align: center;">
              <img 
                src="${badge.imageUrl || 'cid:badge_img'}" 
                alt="${badge.name}" 
                width="120" 
                height="120" 
                style="display: block; margin: 0 auto; max-width: 120px; height: auto;" 
              />
            </div>
          </div>

          <!-- Badge Name & Tier -->
          <div style="margin-bottom: 22px;">
            <span style="display: inline-block; padding: 5px 14px; background: ${badge.themeColor || '#2d6a4f'}18; color: ${badge.themeColor || '#2d6a4f'}; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; border-radius: 20px; border: 1px solid ${badge.themeColor || '#2d6a4f'}35;">
              ${badge.tier}
            </span>
            <h2 style="margin: 12px 0 8px; font-size: 24px; font-weight: 700; color: #111827;">${badge.name}</h2>
            <p style="margin: 0 auto; max-width: 380px; font-size: 14px; line-height: 1.5; color: #4b5563;">
              ${badge.description}
            </p>
          </div>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />

          <p style="font-size: 14px; color: #6b7280; line-height: 1.6; margin: 0 0 20px;">
            Your dedication to caring for your plants and urban garden has earned you this badge! Keep up the inspiring work.
          </p>

          <!-- Action Button -->
          <div style="margin-bottom: 26px;">
            <a href="${profileUrl}" style="display: inline-block; background: #2d6a4f; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 24px; font-size: 14px; font-weight: 600; box-shadow: 0 4px 12px rgba(45, 106, 79, 0.3);">
              View Badges in Profile →
            </a>
          </div>

          <!-- Social Share Section with LinkedIn, WhatsApp, X, and Instagram -->
          <div style="margin: 10px 0 6px; padding: 20px 14px; background: #f8fafc; border-radius: 14px; border: 1px dashed #cbd5e1; text-align: center;">
            <p style="margin: 0 0 14px; font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.06em;">
              📢 Share Your Badge On Social Media
            </p>
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style="margin: 0 auto;">
              <tr>
                <!-- WhatsApp -->
                <td align="center" style="padding: 0 8px;">
                  <a href="${whatsappUrl}" target="_blank" title="Share on WhatsApp" style="display: inline-block; width: 42px; height: 42px; line-height: 42px; background-color: #25D366; border-radius: 50%; text-align: center; text-decoration: none; box-shadow: 0 3px 8px rgba(37, 211, 102, 0.35);">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="42" height="42" style="border-collapse: collapse;">
                      <tr>
                        <td align="center" valign="middle" style="width: 42px; height: 42px; text-align: center; vertical-align: middle; padding: 0;">
                          <img src="https://res.cloudinary.com/af0rejiv/image/upload/v1791057479/urbanfarm_badges/social/whatsapp.png" alt="WhatsApp" width="22" height="22" style="display: block; margin: 0 auto; border: 0;" />
                        </td>
                      </tr>
                    </table>
                  </a>
                </td>

                <!-- LinkedIn -->
                <td align="center" style="padding: 0 8px;">
                  <a href="${linkedinUrl}" target="_blank" title="Share on LinkedIn" style="display: inline-block; width: 42px; height: 42px; line-height: 42px; background-color: #0A66C2; border-radius: 50%; text-align: center; text-decoration: none; box-shadow: 0 3px 8px rgba(10, 102, 194, 0.35);">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="42" height="42" style="border-collapse: collapse;">
                      <tr>
                        <td align="center" valign="middle" style="width: 42px; height: 42px; text-align: center; vertical-align: middle; padding: 0;">
                          <img src="https://res.cloudinary.com/af0rejiv/image/upload/v1791057482/urbanfarm_badges/social/linkedin.png" alt="LinkedIn" width="22" height="22" style="display: block; margin: 0 auto; border: 0;" />
                        </td>
                      </tr>
                    </table>
                  </a>
                </td>

                <!-- X (Twitter) -->
                <td align="center" style="padding: 0 8px;">
                  <a href="${xUrl}" target="_blank" title="Share on X" style="display: inline-block; width: 42px; height: 42px; line-height: 42px; background-color: #000000; border-radius: 50%; text-align: center; text-decoration: none; box-shadow: 0 3px 8px rgba(0, 0, 0, 0.35);">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="42" height="42" style="border-collapse: collapse;">
                      <tr>
                        <td align="center" valign="middle" style="width: 42px; height: 42px; text-align: center; vertical-align: middle; padding: 0;">
                          <img src="https://res.cloudinary.com/af0rejiv/image/upload/v1791057484/urbanfarm_badges/social/x_twitter.png" alt="X" width="20" height="20" style="display: block; margin: 0 auto; border: 0;" />
                        </td>
                      </tr>
                    </table>
                  </a>
                </td>

                <!-- Instagram -->
                <td align="center" style="padding: 0 8px;">
                  <a href="${instagramUrl}" target="_blank" title="Share on Instagram" style="display: inline-block; width: 42px; height: 42px; line-height: 42px; background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%); background-color: #E1306C; border-radius: 50%; text-align: center; text-decoration: none; box-shadow: 0 3px 8px rgba(225, 48, 108, 0.35);">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="42" height="42" style="border-collapse: collapse;">
                      <tr>
                        <td align="center" valign="middle" style="width: 42px; height: 42px; text-align: center; vertical-align: middle; padding: 0;">
                          <img src="https://res.cloudinary.com/af0rejiv/image/upload/v1791057486/urbanfarm_badges/social/instagram.png" alt="Instagram" width="22" height="22" style="display: block; margin: 0 auto; border: 0;" />
                        </td>
                      </tr>
                    </table>
                  </a>
                </td>
              </tr>
            </table>
          </div>

        </div>

        <!-- Footer -->
        <div style="background: #f9fafb; padding: 18px 24px; text-align: center; border-top: 1px solid #f3f4f6;">
          <p style="margin: 0; font-size: 12px; color: #9ca3af; line-height: 1.5;">
            UrbanFarm Assistant • Grow your city sanctuary 🌱<br/>
            This achievement email was sent to ${recipients}
          </p>
        </div>

      </div>
    </body>
    </html>
  `;

  // Attach SVG file if available locally
  const attachments = [];
  if (badge.svgFilename) {
    const svgPath = path.join(__dirname, `../assets/badges/${badge.svgFilename}`);
    if (fs.existsSync(svgPath)) {
      attachments.push({
        filename: badge.svgFilename,
        path: svgPath,
        cid: 'badge_img',
      });
    }
  }

  return exports.sendEmail(recipients, subject, html, text, attachments);
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
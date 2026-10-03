const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendPasswordResetEmail } = require('../utils/emailService');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });
};

// @desc    Register user
// @route   POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    console.log('Registration attempt:', req.body);

    const { name, email, password, location, gardeningLevel, username } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already registered' 
      });
    }

    // ✅ Auto-assign admin role for specific emails
    const adminEmails = ['admin1234@example.com', 'ghanshyamsinhzala70@gmail.com', 'admin@example.com'];
    const role = adminEmails.includes(email) ? 'admin' : 'user';

    console.log(`📝 Creating user with role: ${role}`);

    // Create user
    const user = await User.create({
      name,
      username: username || name.toLowerCase().replace(/\s/g, ''),
      email,
      password,
      location: location || {},
      gardeningLevel: gardeningLevel || 'beginner',
      role,
    });

    // Generate token
    const token = generateToken(user._id);

    console.log(`✅ User created: ${email}, Role: ${user.role}`);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        gardeningLevel: user.gardeningLevel,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: messages[0] || 'Validation error',
        errors: messages,
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists',
      });
    }
    
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Login attempt for:', email);

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    console.log('✅ User found:', email, 'Role:', user.role);

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      console.log('❌ Password mismatch for:', email);
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    console.log('✅ Password matched for:', email);

    // Generate token
    const token = generateToken(user._id);

    // ✅ Prepare response with all user data
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      gardeningLevel: user.gardeningLevel,
      location: user.location,
      profilePicture: user.profilePicture,
      badges: user.badges,
      climateZone: user.climateZone,
      urbanSpaceType: user.urbanSpaceType,
      preferences: user.preferences,
    };

    console.log('📤 Sending login response with role:', userData.role);

    res.status(200).json({
      success: true,
      token,
      user: userData,
    });
  } catch (error) {
    console.error('Login error:', error);
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.status(200).json({ 
      success: true, 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location,
        gardeningLevel: user.gardeningLevel,
        badges: user.badges,
        profilePicture: user.profilePicture,
        climateZone: user.climateZone,
        urbanSpaceType: user.urbanSpaceType,
        preferences: user.preferences,
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot Password - Send reset link email
// @route   POST /api/auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide an email address' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No user found with that email address' });
    }

    // Generate unhashed reset token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash token and set to resetPasswordToken field
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes

    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    try {
      await sendPasswordResetEmail(user.email, resetUrl);
      console.log(`📧 Password reset email sent to: ${user.email}`);

      res.status(200).json({
        success: true,
        message: 'Password reset link sent to your email',
      });
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        message: 'Email could not be sent. Please check server email credentials.',
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    next(error);
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password/:token
exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    // Hash token to compare with DB
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired password reset token' });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    console.log(`✅ Password reset successfully for user: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now log in with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    next(error);
  }
};
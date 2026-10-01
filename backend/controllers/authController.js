const User = require('../models/User');
const jwt = require('jsonwebtoken');

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
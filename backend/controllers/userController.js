const User = require('../models/User');

// @desc    Update user profile
// @route   PUT /api/users/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, location, gardeningLevel, profilePicture, climateZone, urbanSpaceType, preferences, password } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name !== undefined) user.name = name;
    if (location !== undefined) user.location = location;
    if (gardeningLevel !== undefined) user.gardeningLevel = gardeningLevel;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;
    if (climateZone !== undefined) user.climateZone = climateZone;
    if (urbanSpaceType !== undefined) user.urbanSpaceType = urbanSpaceType;
    if (preferences !== undefined) user.preferences = { ...user.preferences, ...preferences };

    if (password && password.trim().length >= 6) {
      user.password = password;
    }

    await user.save();
    
    const updatedUser = await User.findById(req.user.id).select('-password');
    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user badges
// @route   GET /api/users/badges
exports.getBadges = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('badges');
    res.status(200).json({ success: true, badges: user?.badges || [] });
  } catch (error) {
    next(error);
  }
};

// @desc    Add badge (internal use)
exports.addBadge = async (userId, badgeName) => {
  try {
    await User.findByIdAndUpdate(userId, { $addToSet: { badges: badgeName } });
  } catch (error) {
    console.error('Badge add error:', error);
  }
};
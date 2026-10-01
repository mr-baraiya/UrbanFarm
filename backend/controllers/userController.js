const User = require('../models/User');

// @desc    Update user profile
// @route   PUT /api/users/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, location, gardeningLevel, profilePicture } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, location, gardeningLevel, profilePicture },
      { new: true, runValidators: true }
    );
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user badges
// @route   GET /api/users/badges
exports.getBadges = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('badges');
    res.status(200).json({ success: true, badges: user.badges });
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
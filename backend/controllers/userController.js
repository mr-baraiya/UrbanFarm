const User = require('../models/User');
const badgeService = require('../services/badgeService');

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

// @desc    Get user badges (auto-checks milestones and awards new badges)
// @route   GET /api/users/badges
exports.getBadges = async (req, res, next) => {
  try {
    // Automatically evaluate user achievements and send notification email for newly unlocked badges
    const result = await badgeService.checkAndAwardBadges(req.user.id);
    res.status(200).json({
      success: true,
      badges: result.badges || [],
      newlyUnlocked: result.newlyUnlocked || [],
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Manually trigger badge check
// @route   POST /api/users/check-badges
exports.checkBadges = async (req, res, next) => {
  try {
    const result = await badgeService.checkAndAwardBadges(req.user.id);
    res.status(200).json({
      success: true,
      badges: result.badges,
      newlyUnlocked: result.newlyUnlocked,
      stats: result.stats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Test sending badge unlock email
// @route   POST /api/users/test-badge-email
exports.testBadgeEmail = async (req, res, next) => {
  try {
    const { badgeId } = req.body;
    const result = await badgeService.triggerTestBadgeEmail(req.user?.id, badgeId || 'gardening_guru');
    res.status(200).json({
      success: true,
      message: `Test congratulation email sent successfully to ${result.sentTo}!`,
      badge: result.badge,
    });
  } catch (error) {
    console.error('Test badge email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send badge email: ' + (error.message || 'Unknown error'),
    });
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
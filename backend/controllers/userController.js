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

// @desc    Get user badges & settings (auto-checks milestones and awards new badges)
// @route   GET /api/users/badges
exports.getBadges = async (req, res, next) => {
  try {
    const { BADGES } = require('../utils/badgeDefinitions');
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Automatically evaluate user achievements and update badges
    const result = await badgeService.checkAndAwardBadges(req.user.id);

    const howToEarnMap = {
      first_sprout: 'Plant and register your 1st plant in UrbanFarm.',
      hydration_master: 'Complete 10 watering sessions across your plants.',
      plant_doctor: 'Diagnose at least 1 plant leaf issue with AI pathology.',
      first_harvest: 'Log your 1st harvest in the harvest tracker.',
      green_thumb: 'Cultivate 5 or more active plants simultaneously.',
      community_gardener: 'Publish 5 community posts to help fellow gardeners.',
      gardening_guru: 'Cultivate 10 plants or earn 100 cumulative gardening points.',
      weather_watcher: 'Create at least 1 garden space with local microclimate tracking.',
    };

    const allBadgesFormatted = BADGES.map(b => ({
      id: b.id,
      name: b.name,
      tier: b.tier,
      description: b.description,
      themeColor: b.themeColor,
      howToEarn: howToEarnMap[b.id] || b.description,
      isEarned: (result.badges || []).includes(b.id),
    }));

    const badgeSettings = user.badgeSettings || {
      displayedBadges: result.badges || [],
      pinnedBadge: '',
      isPublic: true,
    };

    res.status(200).json({
      success: true,
      badges: result.badges || [],
      allBadges: allBadgesFormatted,
      badgeSettings,
      newlyUnlocked: result.newlyUnlocked || [],
      stats: result.stats || {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user badge showcase settings (displayed badges, pinned favorite, public visibility)
// @route   PUT /api/users/badge-settings
exports.updateBadgeSettings = async (req, res, next) => {
  try {
    const { displayedBadges, pinnedBadge, isPublic } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.badgeSettings) {
      user.badgeSettings = {};
    }

    if (Array.isArray(displayedBadges)) {
      // Only allow earned badges to be displayed
      const earnedSet = new Set(user.badges || []);
      user.badgeSettings.displayedBadges = displayedBadges.filter(b => earnedSet.has(b));
    }

    if (pinnedBadge !== undefined) {
      // Only pin if earned or empty
      if (pinnedBadge === '' || (user.badges || []).includes(pinnedBadge)) {
        user.badgeSettings.pinnedBadge = pinnedBadge;
      }
    }

    if (typeof isPublic === 'boolean') {
      user.badgeSettings.isPublic = isPublic;
    }

    await user.save();

    res.status(200).json({
      success: true,
      badgeSettings: user.badgeSettings,
      message: 'Badge settings saved successfully.',
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
    const { badgeId, badgeIds } = req.body;
    const targetBadgeParam = badgeIds || badgeId || 'gardening_guru';
    const result = await badgeService.triggerTestBadgeEmail(req.user?.id, targetBadgeParam);
    res.status(200).json({
      success: true,
      message: `Test congratulation email sent successfully to ${result.sentTo}!`,
      badges: result.badges || [result.badge],
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
const User = require('../models/User');
const Plant = require('../models/Plant');
const Garden = require('../models/Garden');
const Diagnosis = require('../models/Diagnosis');
const CommunityPost = require('../models/CommunityPost');
const ScheduleTask = require('../models/ScheduleTask');
const { BADGES, getBadgeById } = require('../utils/badgeDefinitions');
const { sendBadgeUnlockedEmail, sendMultipleBadgesUnlockedEmail } = require('../utils/emailService');

/**
 * Calculate user stats and check/award any new badges.
 * Automatically sends congratulation email with badge image when a new badge is unlocked.
 * If 2 or more medals are unlocked together, sends ONLY 1 combined email with both medals.
 * If unlocked at different times, separate emails are sent.
 */
exports.checkAndAwardBadges = async (userId) => {
  try {
    if (!userId) return { badges: [], newlyUnlocked: [] };

    const user = await User.findById(userId);
    if (!user) return { badges: [], newlyUnlocked: [] };

    // Fetch user progress metrics
    const [gardensCount, plants, diagnosesCount, postsCount, completedWateringTasks] = await Promise.all([
      Garden.countDocuments({ userId, isActive: { $ne: false } }),
      Plant.find({ userId }),
      Diagnosis.countDocuments({ userId }),
      CommunityPost.countDocuments({ userId, isApproved: { $ne: false } }),
      ScheduleTask.countDocuments({ userId, type: 'watering', completed: true }),
    ]);

    const totalGardens = gardensCount;
    const totalPlants = plants.length;
    const totalDiagnoses = diagnosesCount;
    const totalCommunityPosts = postsCount;
    const plantWateringHistoryCount = plants.reduce(
      (acc, p) => acc + (Array.isArray(p.wateringHistory) ? p.wateringHistory.length : 0),
      0
    );
    const totalWateringEvents = Math.max(plantWateringHistoryCount, completedWateringTasks);
    const totalHarvests = plants.filter(
      p => p.status === 'harvested' || (Array.isArray(p.harvestHistory) && p.harvestHistory.length > 0)
    ).length;

    const stats = {
      totalGardens,
      totalPlants,
      totalDiagnoses,
      totalCommunityPosts,
      totalWateringEvents,
      totalHarvests,
    };

    const currentBadges = Array.isArray(user.badges) ? [...user.badges] : [];
    const newlyUnlocked = [];

    for (const badge of BADGES) {
      if (badge.check(stats)) {
        if (!currentBadges.includes(badge.id)) {
          currentBadges.push(badge.id);
          newlyUnlocked.push(badge);

          console.log(`🏆 [BadgeService] User ${user.email} unlocked badge: ${badge.name} (${badge.tier})`);
        }
      }
    }

    if (newlyUnlocked.length > 0) {
      user.badges = currentBadges;
      await user.save();

      // Rule: If one gets 2 or more medals together, send ONLY 1 mail containing both/all together.
      // If earned at different times, separate single mails are sent naturally.
      if (newlyUnlocked.length === 1) {
        try {
          await sendBadgeUnlockedEmail(user, newlyUnlocked[0]);
          console.log(`✉️ [BadgeService] Single congratulation email sent for ${newlyUnlocked[0].name}`);
        } catch (emailErr) {
          console.error(`⚠️ [BadgeService] Email failed for ${newlyUnlocked[0].name}:`, emailErr.message);
        }
      } else {
        try {
          await sendMultipleBadgesUnlockedEmail(user, newlyUnlocked);
          console.log(`✉️ [BadgeService] Consolidated email sent for ${newlyUnlocked.length} medals: ${newlyUnlocked.map(b => b.name).join(', ')}`);
        } catch (emailErr) {
          console.error(`⚠️ [BadgeService] Consolidated email failed for ${newlyUnlocked.length} medals:`, emailErr.message);
        }
      }
    }

    return {
      badges: currentBadges,
      newlyUnlocked,
      stats,
    };
  } catch (error) {
    console.error('❌ [BadgeService] checkAndAwardBadges error:', error);
    return { badges: [], newlyUnlocked: [] };
  }
};

/**
 * Trigger a test badge email for testing SMTP & badge display.
 * Supports a single badge or multiple badges (comma-separated or array).
 */
exports.triggerTestBadgeEmail = async (userId, badgeId = 'gardening_guru') => {
  const user = (userId ? await User.findById(userId) : null) || {
    name: 'Vishal Baraiya',
    email: 'baraiyavishalbhai32@gmail.com',
  };

  let badgesToTest = [];
  if (Array.isArray(badgeId)) {
    badgesToTest = badgeId.map(id => getBadgeById(id)).filter(Boolean);
  } else if (typeof badgeId === 'string' && badgeId.includes(',')) {
    badgesToTest = badgeId.split(',').map(s => getBadgeById(s.trim())).filter(Boolean);
  } else {
    const single = getBadgeById(badgeId) || BADGES[0];
    if (single) badgesToTest = [single];
  }

  if (badgesToTest.length === 0) {
    badgesToTest = [BADGES[0]];
  }

  let info;
  if (badgesToTest.length > 1) {
    info = await sendMultipleBadgesUnlockedEmail(user, badgesToTest);
  } else {
    info = await sendBadgeUnlockedEmail(user, badgesToTest[0]);
  }

  return {
    success: true,
    badges: badgesToTest,
    badge: badgesToTest[0],
    messageId: info?.messageId,
    sentTo: 'baraiyavishalbhai32@gmail.com',
  };
};

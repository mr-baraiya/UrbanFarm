const User = require('../models/User');
const Plant = require('../models/Plant');
const Garden = require('../models/Garden');
const Diagnosis = require('../models/Diagnosis');
const CommunityPost = require('../models/CommunityPost');
const ScheduleTask = require('../models/ScheduleTask');
const { BADGES, getBadgeById } = require('../utils/badgeDefinitions');
const { sendBadgeUnlockedEmail } = require('../utils/emailService');

/**
 * Calculate user stats and check/award any new badges.
 * Automatically sends congratulation email with badge image when a new badge is unlocked.
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

          // Send congratulation email with badge image
          try {
            await sendBadgeUnlockedEmail(user, badge);
            console.log(`✉️ [BadgeService] Congratulation email sent for ${badge.name}`);
          } catch (emailErr) {
            console.error(`⚠️ [BadgeService] Email failed for ${badge.name}:`, emailErr.message);
          }
        }
      }
    }

    if (newlyUnlocked.length > 0) {
      user.badges = currentBadges;
      await user.save();
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
 */
exports.triggerTestBadgeEmail = async (userId, badgeId = 'gardening_guru') => {
  const user = (userId ? await User.findById(userId) : null) || {
    name: 'Vishal Baraiya',
    email: 'baraiyavishalbhai32@gmail.com',
  };

  const badge = getBadgeById(badgeId) || BADGES[0];
  const info = await sendBadgeUnlockedEmail(user, badge);
  return {
    success: true,
    badge,
    messageId: info?.messageId,
    sentTo: 'baraiyavishalbhai32@gmail.com',
  };
};

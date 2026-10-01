const Notification = require('../models/Notification');

/**
 * Create a notification for a user
 */
exports.createNotification = async (userId, type, title, message, link = null, data = null) => {
  try {
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      link,
      data,
    });
    return notification;
  } catch (error) {
    console.error('Notification creation error:', error);
    return null;
  }
};

/**
 * Get unread count for a user
 */
exports.getUnreadCount = async (userId) => {
  try {
    return await Notification.countDocuments({ userId, read: false });
  } catch (error) {
    console.error('Unread count error:', error);
    return 0;
  }
};

/**
 * Mark all as read
 */
exports.markAllAsRead = async (userId) => {
  try {
    await Notification.updateMany({ userId, read: false }, { read: true });
    return true;
  } catch (error) {
    console.error('Mark all read error:', error);
    return false;
  }
};
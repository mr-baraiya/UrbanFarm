const User = require('../models/User');
const CommunityPost = require('../models/CommunityPost');
const AdminLog = require('../models/AdminLog');

// @desc    Get all users (admin)
// @route   GET /api/admin/users
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, users });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role (admin)
// @route   PUT /api/admin/users/:id/role
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Log admin action
    await AdminLog.create({
      adminId: req.user.id,
      action: 'update_user_role',
      targetType: 'user',
      targetId: user._id,
      details: { newRole: role },
    });

    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user (admin)
// @route   DELETE /api/admin/users/:id
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await AdminLog.create({
      adminId: req.user.id,
      action: 'delete_user',
      targetType: 'user',
      targetId: user._id,
      details: { email: user.email },
    });

    res.status(200).json({ success: true, message: 'User deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get flagged posts (admin)
// @route   GET /api/admin/flagged-posts
exports.getFlaggedPosts = async (req, res, next) => {
  try {
    const posts = await CommunityPost.find({ isFlagged: true })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, posts });
  } catch (error) {
    next(error);
  }
};

// @desc    Moderate post (approve/delete/flag)
// @route   PUT /api/admin/posts/:id/moderate
exports.moderatePost = async (req, res, next) => {
  try {
    const { isApproved, isFlagged } = req.body;
    const post = await CommunityPost.findByIdAndUpdate(
      req.params.id,
      { isApproved, isFlagged },
      { new: true }
    );
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    await AdminLog.create({
      adminId: req.user.id,
      action: 'moderate_post',
      targetType: 'post',
      targetId: post._id,
      details: { isApproved, isFlagged },
    });

    res.status(200).json({ success: true, post });
  } catch (error) {
    next(error);
  }
};

// @desc    Get admin logs
// @route   GET /api/admin/logs
exports.getAdminLogs = async (req, res, next) => {
  try {
    const logs = await AdminLog.find()
      .populate('adminId', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);
    res.status(200).json({ success: true, logs });
  } catch (error) {
    next(error);
  }
};
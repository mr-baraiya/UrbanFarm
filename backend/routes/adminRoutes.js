const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  updateUserRole,
  deleteUser,
  getFlaggedPosts,
  moderatePost,
  getAdminLogs,
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

// All admin routes require authentication + admin role
router.use(protect, admin);

router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);
router.get('/flagged-posts', getFlaggedPosts);
router.put('/posts/:id/moderate', moderatePost);
router.get('/logs', getAdminLogs);

module.exports = router;
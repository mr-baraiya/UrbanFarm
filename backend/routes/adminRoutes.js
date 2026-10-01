const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getAllUsers,
  createUser,
  updateUser,
  updateUserRole,
  deleteUser,
  getAllGardens,
  deleteGarden,
  getAllPlants,
  deletePlant,
  getAllPosts,
  deletePost,
  getFlaggedPosts,
  moderatePost,
  getAdminLogs,
  exportCSVData,
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

// All admin routes require authentication + admin role
router.use(protect, admin);

router.get('/stats', getAdminStats);

// User Management
router.get('/users', getAllUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

// Gardens & Plants Management
router.get('/gardens', getAllGardens);
router.delete('/gardens/:id', deleteGarden);
router.get('/plants', getAllPlants);
router.delete('/plants/:id', deletePlant);

// Community Posts & Moderation
router.get('/posts', getAllPosts);
router.delete('/posts/:id', deletePost);
router.get('/flagged-posts', getFlaggedPosts);
router.put('/posts/:id/moderate', moderatePost);

// Logs & CSV Export
router.get('/logs', getAdminLogs);
router.get('/export/:type', exportCSVData);

module.exports = router;
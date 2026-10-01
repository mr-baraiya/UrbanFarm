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
  createGarden,
  updateGarden,
  deleteGarden,
  getAllPlants,
  createPlant,
  updatePlant,
  deletePlant,
  getAllPosts,
  createPost,
  deletePost,
  getFlaggedPosts,
  moderatePost,
  getAdminLogs,
  exportCSVData,
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

const {
  getContactLeads,
  createContactLead,
  updateContactLead,
  deleteContactLead,
} = require('../controllers/contactController');

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
router.post('/gardens', createGarden);
router.put('/gardens/:id', updateGarden);
router.delete('/gardens/:id', deleteGarden);
router.get('/plants', getAllPlants);
router.post('/plants', createPlant);
router.put('/plants/:id', updatePlant);
router.delete('/plants/:id', deletePlant);

// Community Posts & Moderation
router.get('/posts', getAllPosts);
router.post('/posts', createPost);
router.delete('/posts/:id', deletePost);
router.get('/flagged-posts', getFlaggedPosts);
router.put('/posts/:id/moderate', moderatePost);

// Guest Contact Leads
router.get('/leads', getContactLeads);
router.post('/leads', createContactLead);
router.put('/leads/:id', updateContactLead);
router.delete('/leads/:id', deleteContactLead);

// Logs & CSV Export
router.get('/logs', getAdminLogs);
router.get('/export/:type', exportCSVData);

module.exports = router;
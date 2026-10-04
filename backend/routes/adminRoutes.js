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
  exportSystemBundle,
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

// Disable HTTP caching for all dynamic admin routes
router.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

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
router.get('/export/bundle', exportSystemBundle);
router.get('/export/:type', exportCSVData);

module.exports = router;
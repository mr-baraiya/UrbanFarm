const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const gardenRoutes = require('./gardenRoutes');
const plantRoutes = require('./plantRoutes');
const diseaseRoutes = require('./diseaseRoutes');
const cropRoutes = require('./cropRoutes');
const wateringRoutes = require('./wateringRoutes');
const scheduleRoutes = require('./scheduleRoutes');
const communityRoutes = require('./communityRoutes');
const adminRoutes = require('./adminRoutes');
const uploadRoutes = require('./uploadRoutes');
const weatherRoutes = require('./weatherRoutes');
const contactRoutes = require('./contactRoutes');
const chatbotRoutes = require('./chatbotRoutes');
const marketRoutes = require('./marketRoutes');
const iotRoutes = require('./iotRoutes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/gardens', gardenRoutes);
router.use('/plants', plantRoutes);
router.use('/disease', diseaseRoutes);
router.use('/crops', cropRoutes);
router.use('/watering', wateringRoutes);
router.use('/schedule', scheduleRoutes);
router.use('/community', communityRoutes);
router.use('/admin', adminRoutes);
router.use('/upload', uploadRoutes);
router.use('/weather', weatherRoutes);
router.use('/contact', contactRoutes);
router.use('/chat', chatbotRoutes);
router.use('/market', marketRoutes);
router.use('/iot', iotRoutes);

module.exports = router;
const Garden = require('../models/Garden');
const Plant = require('../models/Plant');
const badgeService = require('../services/badgeService');

// @desc    Create a new garden
// @route   POST /api/gardens
exports.createGarden = async (req, res, next) => {
  try {
    const { name, description, location, size, type, sunlight, soilType } = req.body;
    const garden = await Garden.create({
      name,
      description,
      location,
      size,
      type: type || 'balcony',
      sunlight: sunlight || 'full',
      soilType: soilType || 'potting_mix',
      userId: req.user.id,
    });

    badgeService.checkAndAwardBadges(req.user.id).catch(err => console.error('Badge check error:', err));

    res.status(201).json({ success: true, garden });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all gardens for user
// @route   GET /api/gardens
exports.getGardens = async (req, res, next) => {
  try {
    const gardens = await Garden.find({ userId: req.user.id, isActive: true })
      .populate('plants', 'name status health imageUrl');
    res.status(200).json({ success: true, gardens });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single garden
// @route   GET /api/gardens/:id
exports.getGardenById = async (req, res, next) => {
  try {
    const garden = await Garden.findOne({ _id: req.params.id, userId: req.user.id })
      .populate('plants');
    if (!garden) {
      return res.status(404).json({ success: false, message: 'Garden not found' });
    }
    res.status(200).json({ success: true, garden });
  } catch (error) {
    next(error);
  }
};

// @desc    Update garden
// @route   PUT /api/gardens/:id
exports.updateGarden = async (req, res, next) => {
  try {
    const garden = await Garden.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!garden) {
      return res.status(404).json({ success: false, message: 'Garden not found' });
    }
    res.status(200).json({ success: true, garden });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete garden (soft delete)
// @route   DELETE /api/gardens/:id
exports.deleteGarden = async (req, res, next) => {
  try {
    const garden = await Garden.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { isActive: false },
      { new: true }
    );
    if (!garden) {
      return res.status(404).json({ success: false, message: 'Garden not found' });
    }
    res.status(200).json({ success: true, message: 'Garden deleted' });
  } catch (error) {
    next(error);
  }
};
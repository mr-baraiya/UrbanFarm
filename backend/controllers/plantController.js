const Plant = require('../models/Plant');
const Garden = require('../models/Garden');

// @desc    Add a plant to a garden
// @route   POST /api/plants
exports.addPlant = async (req, res, next) => {
  try {
    const { name, scientificName, variety, gardenId, plantingDate, status, waterFrequency, sunlight, notes } = req.body;

    // Verify garden belongs to user
    const garden = await Garden.findOne({ _id: gardenId, userId: req.user.id });
    if (!garden) {
      return res.status(404).json({ success: false, message: 'Garden not found' });
    }

    const plant = await Plant.create({
      name,
      scientificName,
      variety,
      gardenId,
      userId: req.user.id,
      plantingDate,
      status,
      waterFrequency,
      sunlight,
      notes,
    });

    // Add plant to garden's plants array
    await Garden.findByIdAndUpdate(gardenId, { $push: { plants: plant._id } });

    res.status(201).json({ success: true, plant });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all plants for user
// @route   GET /api/plants
exports.getPlants = async (req, res, next) => {
  try {
    const plants = await Plant.find({ userId: req.user.id })
      .populate('gardenId', 'name');
    res.status(200).json({ success: true, plants });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single plant
// @route   GET /api/plants/:id
exports.getPlantById = async (req, res, next) => {
  try {
    const plant = await Plant.findOne({ _id: req.params.id, userId: req.user.id });
    if (!plant) {
      return res.status(404).json({ success: false, message: 'Plant not found' });
    }
    res.status(200).json({ success: true, plant });
  } catch (error) {
    next(error);
  }
};

// @desc    Update plant
// @route   PUT /api/plants/:id
exports.updatePlant = async (req, res, next) => {
  try {
    const plant = await Plant.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!plant) {
      return res.status(404).json({ success: false, message: 'Plant not found' });
    }
    res.status(200).json({ success: true, plant });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete plant
// @route   DELETE /api/plants/:id
exports.deletePlant = async (req, res, next) => {
  try {
    const plant = await Plant.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!plant) {
      return res.status(404).json({ success: false, message: 'Plant not found' });
    }
    // Remove from garden
    await Garden.findByIdAndUpdate(plant.gardenId, { $pull: { plants: plant._id } });
    res.status(200).json({ success: true, message: 'Plant deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Add growth timeline entry
// @route   POST /api/plants/:id/timeline
exports.addTimelineEntry = async (req, res, next) => {
  try {
    const { height, notes, imageUrl } = req.body;
    const plant = await Plant.findOne({ _id: req.params.id, userId: req.user.id });
    if (!plant) {
      return res.status(404).json({ success: false, message: 'Plant not found' });
    }

    plant.growthTimeline.push({ date: new Date(), height, notes, imageUrl });
    await plant.save();

    res.status(201).json({ success: true, timeline: plant.growthTimeline });
  } catch (error) {
    next(error);
  }
};
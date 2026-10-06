const Plant = require('../models/Plant');
const Garden = require('../models/Garden');
const ScheduleTask = require('../models/ScheduleTask');
const badgeService = require('../services/badgeService');

// @desc    Add a plant to a garden
// @route   POST /api/plants
exports.addPlant = async (req, res, next) => {
  try {
    const { 
      name, 
      scientificName, 
      variety, 
      gardenId, 
      plantingDate, 
      status, 
      waterFrequency, 
      sunlight, 
      notes, 
      imageUrl,
      lastWatered 
    } = req.body;

    // Verify garden belongs to user
    const garden = await Garden.findOne({ _id: gardenId, userId: req.user.id });
    if (!garden) {
      return res.status(404).json({ success: false, message: 'Garden not found' });
    }

    if (waterFrequency !== undefined && waterFrequency !== null && Number(waterFrequency) < 0) {
      return res.status(400).json({ success: false, message: 'Water frequency cannot be negative' });
    }

    let initialLastWatered = new Date();
    if (lastWatered) {
      if (new Date(lastWatered) > new Date()) {
        return res.status(400).json({ success: false, message: 'Last watered date cannot be in the future.' });
      }
      initialLastWatered = new Date(lastWatered);
    }

    const freqDays = Number(waterFrequency) > 0 ? Number(waterFrequency) : 3;
    const initialNextWatering = new Date(initialLastWatered.getTime() + (freqDays * 24 * 60 * 60 * 1000));

    const plant = await Plant.create({
      name,
      scientificName,
      variety,
      gardenId,
      userId: req.user.id,
      plantingDate,
      status,
      waterFrequency: freqDays,
      sunlight,
      notes,
      imageUrl,
      lastWatered: initialLastWatered,
      nextWateringDate: initialNextWatering,
      wateringHistory: [{ date: initialLastWatered, notes: 'Initial watering recorded' }]
    });

    // Add plant to garden's plants array
    await Garden.findByIdAndUpdate(gardenId, { $push: { plants: plant._id } });
    await plant.populate('gardenId', 'name');

    // Trigger badge evaluation asynchronously
    badgeService.checkAndAwardBadges(req.user.id).catch(err => console.error('Badge check error:', err));

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

// @desc    Get single plant (public or authenticated)
// @route   GET /api/plants/:id
exports.getPlantById = async (req, res, next) => {
  try {
    const plant = await Plant.findById(req.params.id)
      .populate('gardenId', 'name location')
      .populate('userId', 'name location profilePicture');
    if (!plant) {
      return res.status(404).json({ success: false, message: 'Plant not found' });
    }
    res.status(200).json({ success: true, plant });
  } catch (error) {
    next(error);
  }
};

// @desc    Update plant (supports editing lastWatered and waterFrequency with validation)
// @route   PUT /api/plants/:id
exports.updatePlant = async (req, res, next) => {
  try {
    const plant = await Plant.findOne({ _id: req.params.id, userId: req.user.id });
    if (!plant) {
      return res.status(404).json({ success: false, message: 'Plant not found' });
    }

    const updates = { ...req.body };

    // Validate manual lastWatered date
    if (updates.lastWatered !== undefined && updates.lastWatered !== null) {
      const parsedLast = new Date(updates.lastWatered);
      if (isNaN(parsedLast.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid last watered date format' });
      }
      if (parsedLast > new Date()) {
        return res.status(400).json({ success: false, message: 'Last watered date cannot be in the future.' });
      }
      plant.lastWatered = parsedLast;
      
      // Update next watering date
      const freq = updates.waterFrequency !== undefined ? Number(updates.waterFrequency) : (plant.waterFrequency || 3);
      plant.nextWateringDate = new Date(parsedLast.getTime() + (freq * 24 * 60 * 60 * 1000));
    } else if (updates.waterFrequency !== undefined && updates.waterFrequency !== null) {
      // User changed only watering interval
      const freq = Number(updates.waterFrequency);
      if (freq < 0) {
        return res.status(400).json({ success: false, message: 'Water frequency cannot be negative' });
      }
      plant.waterFrequency = freq;
      const baseDate = plant.lastWatered ? new Date(plant.lastWatered) : new Date();
      plant.nextWateringDate = new Date(baseDate.getTime() + (freq * 24 * 60 * 60 * 1000));
    }

    // Apply remaining scalar updates
    const allowedFields = ['name', 'scientificName', 'variety', 'gardenId', 'plantingDate', 'harvestDate', 'status', 'health', 'sunlight', 'notes', 'imageUrl'];
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        plant[field] = updates[field];
      }
    }

    await plant.save();
    await plant.populate('gardenId', 'name');

    // If plant was watered today or updated, clear overdue tasks
    if (updates.lastWatered) {
      await ScheduleTask.updateMany(
        { plantId: plant._id, type: 'watering', completed: false, dueDate: { $lte: new Date(plant.lastWatered) } },
        { completed: true, completedAt: new Date() }
      );
    }

    badgeService.checkAndAwardBadges(req.user.id).catch(err => console.error('Badge check error:', err));
    res.status(200).json({ success: true, plant });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark plant as watered now or at specific date
// @route   POST /api/plants/:id/water
exports.waterPlant = async (req, res, next) => {
  try {
    const { wateredDate, notes } = req.body;
    const plant = await Plant.findOne({ _id: req.params.id, userId: req.user.id });
    if (!plant) {
      return res.status(404).json({ success: false, message: 'Plant not found' });
    }

    let effectiveWatered = new Date();
    if (wateredDate) {
      const parsed = new Date(wateredDate);
      if (isNaN(parsed.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid watered date provided' });
      }
      if (parsed > new Date()) {
        return res.status(400).json({ success: false, message: 'Last watered date cannot be in the future.' });
      }
      effectiveWatered = parsed;
    }

    const intervalDays = plant.waterFrequency && plant.waterFrequency > 0 ? plant.waterFrequency : 3;
    const computedNext = new Date(effectiveWatered.getTime() + (intervalDays * 24 * 60 * 60 * 1000));

    plant.lastWatered = effectiveWatered;
    plant.nextWateringDate = computedNext;

    if (!Array.isArray(plant.wateringHistory)) {
      plant.wateringHistory = [];
    }
    plant.wateringHistory.push({
      date: effectiveWatered,
      notes: notes || 'Watered by gardener',
    });

    await plant.save();
    await plant.populate('gardenId', 'name');

    // Mark pending overdue watering tasks for this plant as completed
    await ScheduleTask.updateMany(
      { plantId: plant._id, type: 'watering', completed: false, dueDate: { $lte: new Date() } },
      { completed: true, completedAt: new Date() }
    );

    // Trigger badge evaluation
    badgeService.checkAndAwardBadges(req.user.id).catch(err => console.error('Badge check error:', err));

    res.status(200).json({
      success: true,
      plant,
      message: 'Plant marked as watered. Next watering scheduled.',
    });
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
    const { date, height, notes, imageUrl } = req.body;
    const query = req.user.role === 'admin' 
      ? { _id: req.params.id } 
      : { _id: req.params.id, userId: req.user.id };

    const plant = await Plant.findOne(query);
    if (!plant) {
      return res.status(404).json({ success: false, message: 'Plant not found' });
    }

    plant.growthTimeline.push({
      date: date ? new Date(date) : new Date(),
      height: height ? parseFloat(height) : undefined,
      notes: notes || '',
      imageUrl: imageUrl || ''
    });
    
    // Sort timeline by date ascending
    plant.growthTimeline.sort((a, b) => new Date(a.date) - new Date(b.date));
    await plant.save();

    res.status(201).json({ success: true, timeline: plant.growthTimeline });
  } catch (error) {
    next(error);
  }
};
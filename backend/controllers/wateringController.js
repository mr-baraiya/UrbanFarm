const WateringSchedule = require('../models/WateringSchedule');
const Plant = require('../models/Plant');
const ScheduleTask = require('../models/ScheduleTask');
const { getForecast } = require('../services/weatherService');
const { generateSchedule } = require('../services/aiWateringService');

// @desc    Generate watering schedule for a plant
// @route   POST /api/watering/generate
exports.generateWateringSchedule = async (req, res, next) => {
  try {
    const { plantId } = req.body;

    console.log('💧 Generating watering schedule for plant:', plantId);

    const plant = await Plant.findOne({ _id: plantId, userId: req.user.id });
    if (!plant) {
      return res.status(404).json({ success: false, message: 'Plant not found' });
    }

    // Get user location (from user profile)
    const user = req.user;
    const city = user.location?.city || 'London';

    // Fetch weather forecast
    let weatherData = null;
    try {
      weatherData = await getForecast(city);
      console.log('🌤️ Weather data fetched for:', city);
    } catch (err) {
      console.warn('⚠️ Weather fetch failed, using fallback');
    }

    // Generate schedule using AI service
    console.log('🤖 Generating schedule with AI...');
    const scheduleEvents = await generateSchedule(plant, weatherData);
    console.log(`✅ Schedule generated: ${scheduleEvents.length} events`);

    // Deactivate previous active schedules for this plant
    await WateringSchedule.updateMany(
      { userId: req.user.id, plantId: plant._id, isActive: true },
      { isActive: false }
    );

    // Save schedule to database
    const wateringSchedule = await WateringSchedule.create({
      userId: req.user.id,
      plantId: plant._id,  // ✅ Store the plant ID
      schedule: scheduleEvents,
      weatherAdjusted: !!weatherData,
      nextWateringDate: scheduleEvents.length > 0 ? new Date(scheduleEvents[0].date) : null,
    });

    // ✅ Automatically sync active watering events into the User's Tasks & Schedule
    try {
      // Remove any previously scheduled uncompleted watering tasks for this plant
      await ScheduleTask.deleteMany({
        userId: req.user.id,
        plantId: plant._id,
        type: 'watering',
        completed: false
      });

      const activeWateringEvents = scheduleEvents.filter(e => {
        if (!e.amount) return false;
        const amt = e.amount.toLowerCase().trim();
        return amt !== '0ml' && amt !== '0l' && amt !== '0' && amt !== 'none';
      });

      if (activeWateringEvents.length > 0) {
        const tasksToCreate = activeWateringEvents.map(e => ({
          userId: req.user.id,
          plantId: plant._id,
          title: `Water ${plant.name} (${e.amount})`,
          description: e.notes || `Scheduled watering (${e.timeOfDay || 'morning'}) - ${e.amount}`,
          type: 'watering',
          priority: 'medium',
          dueDate: new Date(e.date),
          completed: e.completed || false,
        }));

        await ScheduleTask.insertMany(tasksToCreate);
        console.log(`🌱 Created ${tasksToCreate.length} tasks in Tasks & Schedule for ${plant.name}`);
      }
    } catch (taskErr) {
      console.error('⚠️ Failed to sync tasks from watering schedule:', taskErr);
    }

    // ✅ Populate the plant data before sending response
    const populatedSchedule = await WateringSchedule.findById(wateringSchedule._id)
      .populate('plantId', 'name imageUrl status');

    res.status(201).json({
      success: true,
      schedule: populatedSchedule,
      events: scheduleEvents,
    });
  } catch (error) {
    console.error('❌ Watering schedule generation error:', error);
    next(error);
  }
};

// @desc    Get watering schedule for a plant
// @route   GET /api/watering/plant/:plantId
exports.getPlantWateringSchedule = async (req, res, next) => {
  try {
    const schedule = await WateringSchedule.findOne({
      plantId: req.params.plantId,
      userId: req.user.id,
      isActive: true,
    }).populate('plantId', 'name imageUrl status'); // ✅ Populate plant data

    if (!schedule) {
      return res.status(404).json({ success: false, message: 'No schedule found for this plant' });
    }
    res.status(200).json({ success: true, schedule });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all watering schedules for user
// @route   GET /api/watering/all
exports.getAllWateringSchedules = async (req, res, next) => {
  try {
    // Deduplicate active schedules: ensure only the latest schedule for each plant is isActive: true
    const activeSchedules = await WateringSchedule.find({
      userId: req.user.id,
      isActive: true,
    }).sort({ createdAt: -1 });

    const seenPlants = new Set();
    const deactivatedIds = [];

    for (const s of activeSchedules) {
      const pIdStr = s.plantId ? s.plantId.toString() : null;
      if (!pIdStr) continue;
      if (seenPlants.has(pIdStr)) {
        deactivatedIds.push(s._id);
      } else {
        seenPlants.add(pIdStr);
      }
    }

    if (deactivatedIds.length > 0) {
      await WateringSchedule.updateMany(
        { _id: { $in: deactivatedIds } },
        { isActive: false }
      );
    }

    const schedules = await WateringSchedule.find({ 
      userId: req.user.id
    })
    .populate('plantId', 'name imageUrl status') // ✅ Populate plant data
    .sort({ createdAt: -1 }); // ✅ Show newest first
    
    // Sanitize any legacy schedule events where both completed and skipped were saved as true
    for (const s of schedules) {
      if (s.schedule && Array.isArray(s.schedule)) {
        let modified = false;
        s.schedule.forEach(e => {
          if (e.completed && e.skipped) {
            e.skipped = false; // Reset skipped if completed is true
            modified = true;
          }
        });
        if (modified) {
          await s.save();
        }
      }
    }

    res.status(200).json({ success: true, schedules });
  } catch (error) {
    next(error);
  }
};

// @desc    Update watering schedule (mark completed, etc.)
// @route   PUT /api/watering/:scheduleId
exports.updateSchedule = async (req, res, next) => {
  try {
    const schedule = await WateringSchedule.findOneAndUpdate(
      { _id: req.params.scheduleId, userId: req.user.id },
      req.body,
      { new: true }
    ).populate('plantId', 'name imageUrl status'); // ✅ Populate plant data
    
    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }

    // 💧 ALSO SYNC TO ScheduleTask collection so Tasks & Schedule tab stays in sync
    if (schedule.plantId && schedule.schedule) {
      try {
        const plantIdVal = schedule.plantId._id || schedule.plantId;
        for (const event of schedule.schedule) {
          const eventDate = new Date(event.date);
          const startOfDay = new Date(eventDate);
          startOfDay.setHours(0, 0, 0, 0);
          const endOfDay = new Date(eventDate);
          endOfDay.setHours(23, 59, 59, 999);

          await ScheduleTask.updateMany(
            {
              userId: req.user.id,
              plantId: plantIdVal,
              type: 'watering',
              dueDate: { $gte: startOfDay, $lte: endOfDay }
            },
            {
              completed: !!event.completed,
              completedAt: event.completed ? (event.completedAt || new Date()) : null
            }
          );
        }
      } catch (taskErr) {
        console.error('⚠️ Error syncing ScheduleTask from updateSchedule:', taskErr);
      }
    }

    res.status(200).json({ success: true, schedule });
  } catch (error) {
    next(error);
  }
};
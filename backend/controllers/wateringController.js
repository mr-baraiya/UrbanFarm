const WateringSchedule = require('../models/WateringSchedule');
const Plant = require('../models/Plant');
const ScheduleTask = require('../models/ScheduleTask');
const { getForecast } = require('../services/weatherService');
const { generateSchedule, getAiAdvice } = require('../services/aiWateringService');

// @desc    Generate watering schedule for a plant
// @route   POST /api/watering/generate
exports.generateWateringSchedule = async (req, res, next) => {
  try {
    const { plantId, iotData, weatherData: clientWeather } = req.body;

    console.log('💧 Generating 10-day IoT watering schedule for plant:', plantId);

    let plant = null;
    if (plantId && plantId !== 'tomato-01') {
      try {
        plant = await Plant.findOne({ _id: plantId, userId: req.user.id });
      } catch (findErr) {
        plant = null;
      }
    }
    
    if (!plant) {
      plant = {
        _id: 'tomato-01',
        name: "Priya's Balcony Tomato",
        variety: "Sweet 100 Cherry & Roma",
        sunlight: "Full Sun",
        status: "healthy",
        waterFrequency: 2,
      };
    }

    // Weather data
    let weatherData = clientWeather || null;
    if (!weatherData) {
      try {
        const city = req.user?.location?.city || 'London';
        weatherData = await getForecast(city);
      } catch (err) {
        console.warn('⚠️ Weather fetch fallback');
      }
    }

    // Generate 10-day schedule with AI + IoT + Weather
    const scheduleEvents = await generateSchedule(plant, weatherData, iotData);

    let populatedSchedule = null;
    if (plant._id && plant._id !== 'tomato-01') {
      await WateringSchedule.updateMany(
        { userId: req.user.id, plantId: plant._id, isActive: true },
        { isActive: false }
      );

      const wateringSchedule = await WateringSchedule.create({
        userId: req.user.id,
        plantId: plant._id,
        schedule: scheduleEvents,
        weatherAdjusted: !!weatherData,
        nextWateringDate: scheduleEvents.length > 0 ? new Date(scheduleEvents[0].date) : null,
      });

      populatedSchedule = await WateringSchedule.findById(wateringSchedule._id)
        .populate('plantId', 'name imageUrl status');
    } else {
      populatedSchedule = {
        _id: 'tomato-iot-sched',
        plantId: { _id: 'tomato-01', name: "Priya's Balcony Tomato", variety: "Sweet 100 Cherry & Roma" },
        schedule: scheduleEvents,
        weatherAdjusted: true,
        nextWateringDate: scheduleEvents[0]?.date || new Date().toISOString(),
        isActive: true,
      };
    }

    // Get past schedules/history
    let pastHistory = [];
    try {
      pastHistory = await WateringSchedule.find({
        userId: req.user.id,
      }).sort({ createdAt: -1 }).limit(8);
    } catch (hErr) {
      console.warn('History fetch error:', hErr);
    }

    res.status(201).json({
      success: true,
      schedule: populatedSchedule,
      events: scheduleEvents,
      history: pastHistory,
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

// @desc    Get real-time AI watering advice & crop stress score
// @route   POST /api/watering/ai-advice or POST /api/ai-advice
exports.getAiAdvice = async (req, res, next) => {
  try {
    const { sensorData, weather, cropStage, language, forecast } = req.body;
    const advice = await getAiAdvice({ sensorData, weather, cropStage, language, forecast });
    res.status(200).json({ success: true, ...advice });
  } catch (error) {
    next(error);
  }
};
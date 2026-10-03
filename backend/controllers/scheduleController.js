const ScheduleTask = require('../models/ScheduleTask');
const WateringSchedule = require('../models/WateringSchedule');

// @desc    Create a task
// @route   POST /api/schedule
exports.createTask = async (req, res, next) => {
  try {
    const { title, description, type, priority, dueDate, plantId, gardenId, reminder } = req.body;

    // ✅ Validate and clean IDs - convert empty strings to null
    const cleanPlantId = plantId && plantId.trim() !== '' ? plantId : null;
    const cleanGardenId = gardenId && gardenId.trim() !== '' ? gardenId : null;

    // ✅ Validate required fields
    if (!title || title.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        message: 'Task title is required' 
      });
    }

    if (!dueDate) {
      return res.status(400).json({ 
        success: false, 
        message: 'Due date is required' 
      });
    }

    const task = await ScheduleTask.create({
      userId: req.user.id,
      title: title.trim(),
      description: description ? description.trim() : '',
      type: type || 'other',
      priority: priority || 'medium',
      dueDate: new Date(dueDate),
      plantId: cleanPlantId,
      gardenId: cleanGardenId,
      reminder: reminder || false,
    });

    res.status(201).json({ success: true, task });
  } catch (error) {
    console.error('❌ Create task error:', error);
    next(error);
  }
};

// @desc    Get all tasks for user (auto-syncing active watering schedule events)
// @route   GET /api/schedule
exports.getTasks = async (req, res, next) => {
  try {
    // 🔄 Auto-sync active WateringSchedules into ScheduleTask collection if not already synced
    try {
      const activeWateringSchedules = await WateringSchedule.find({
        userId: req.user.id,
        isActive: true,
      }).populate('plantId', 'name');

      for (const ws of activeWateringSchedules) {
        if (!ws.plantId || !ws.schedule || ws.schedule.length === 0) continue;

        for (const event of ws.schedule) {
          if (!event.amount) continue;
          const amt = event.amount.toLowerCase().trim();
          if (amt === '0ml' || amt === '0l' || amt === '0' || amt === 'none') continue;

          const eventDate = new Date(event.date);
          const startOfDay = new Date(eventDate);
          startOfDay.setHours(0, 0, 0, 0);
          const endOfDay = new Date(eventDate);
          endOfDay.setHours(23, 59, 59, 999);

          const existingTask = await ScheduleTask.findOne({
            userId: req.user.id,
            plantId: ws.plantId._id,
            type: 'watering',
            dueDate: { $gte: startOfDay, $lte: endOfDay },
          });

          if (!existingTask) {
            await ScheduleTask.create({
              userId: req.user.id,
              plantId: ws.plantId._id,
              title: `Water ${ws.plantId.name} (${event.amount})`,
              description: event.notes || `Scheduled watering (${event.timeOfDay || 'morning'}) - ${event.amount}`,
              type: 'watering',
              priority: 'medium',
              dueDate: eventDate,
              completed: event.completed || false,
            });
          }
        }
      }
    } catch (syncErr) {
      console.error('⚠️ Error auto-syncing watering tasks:', syncErr);
    }

    const { completed, type, startDate, endDate } = req.query;
    const filter = { userId: req.user.id };

    if (completed !== undefined) filter.completed = completed === 'true';
    if (type) filter.type = type;
    if (startDate && endDate) {
      filter.dueDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const tasks = await ScheduleTask.find(filter)
      .populate('plantId', 'name')
      .populate('gardenId', 'name')
      .sort({ dueDate: 1 });
    res.status(200).json({ success: true, tasks });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task
// @route   PUT /api/schedule/:id
exports.updateTask = async (req, res, next) => {
  try {
    const { plantId, gardenId } = req.body;
    
    // ✅ Clean IDs - convert empty strings to null
    const cleanPlantId = plantId && plantId.trim() !== '' ? plantId : null;
    const cleanGardenId = gardenId && gardenId.trim() !== '' ? gardenId : null;
    
    // Prepare update data
    const updateData = {
      ...req.body,
      plantId: cleanPlantId,
      gardenId: cleanGardenId,
    };

    const task = await ScheduleTask.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.status(200).json({ success: true, task });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark task as complete
// @route   PUT /api/schedule/:id/complete
exports.completeTask = async (req, res, next) => {
  try {
    const existingTask = await ScheduleTask.findOne({ _id: req.params.id, userId: req.user.id });
    if (!existingTask) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // ⛔ Block completing future tasks ahead of time
    if (existingTask.dueDate && !existingTask.completed) {
      const taskDate = new Date(existingTask.dueDate);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      if (taskDate > todayEnd) {
        return res.status(400).json({
          success: false,
          message: 'Future tasks scheduled for tomorrow or later cannot be completed ahead of time'
        });
      }
    }

    const task = await ScheduleTask.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { completed: true, completedAt: new Date() },
      { new: true }
    );

    // 💧 If this is a watering task, sync completion back to the active WateringSchedule
    if (task.type === 'watering' && task.plantId) {
      try {
        const taskDate = new Date(task.dueDate);
        const startOfDay = new Date(taskDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(taskDate);
        endOfDay.setHours(23, 59, 59, 999);

        const ws = await WateringSchedule.findOne({
          userId: req.user.id,
          plantId: task.plantId,
          isActive: true,
        });

        if (ws && ws.schedule) {
          let updated = false;
          ws.schedule.forEach(ev => {
            const ed = new Date(ev.date);
            if (ed >= startOfDay && ed <= endOfDay) {
              ev.completed = true;
              ev.completedAt = new Date();
              updated = true;
            }
          });
          if (updated) {
            ws.isCompleted = ws.schedule.every(ev => ev.completed);
            await ws.save();
          }
        }
      } catch (wsErr) {
        console.error('⚠️ Error syncing completion to WateringSchedule:', wsErr);
      }
    }

    res.status(200).json({ success: true, task });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/schedule/:id
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await ScheduleTask.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // 💧 If this was a watering task, also clear/update the corresponding event in WateringSchedule
    // so it doesn't get auto-recreated on next getTasks sync
    if (task.type === 'watering' && task.plantId) {
      try {
        const taskDate = new Date(task.dueDate);
        const startOfDay = new Date(taskDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(taskDate);
        endOfDay.setHours(23, 59, 59, 999);

        const ws = await WateringSchedule.findOne({
          userId: req.user.id,
          plantId: task.plantId,
          isActive: true,
        });

        if (ws && ws.schedule) {
          let modified = false;
          ws.schedule.forEach(ev => {
            const ed = new Date(ev.date);
            if (ed >= startOfDay && ed <= endOfDay) {
              ev.amount = '0ml';
              ev.notes = 'Cancelled / Deleted from schedule';
              modified = true;
            }
          });
          if (modified) {
            await ws.save();
          }
        }
      } catch (wsErr) {
        console.error('⚠️ Error syncing deletion to WateringSchedule:', wsErr);
      }
    }

    res.status(200).json({ success: true, message: 'Task deleted' });
  } catch (error) {
    next(error);
  }
};
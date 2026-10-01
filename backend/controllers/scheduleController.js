const ScheduleTask = require('../models/ScheduleTask');

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

// @desc    Get all tasks for user
// @route   GET /api/schedule
exports.getTasks = async (req, res, next) => {
  try {
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
    const task = await ScheduleTask.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { completed: true, completedAt: new Date() },
      { new: true }
    );
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
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
    res.status(200).json({ success: true, message: 'Task deleted' });
  } catch (error) {
    next(error);
  }
};
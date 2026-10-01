const User = require('../models/User');
const Garden = require('../models/Garden');
const Plant = require('../models/Plant');
const CommunityPost = require('../models/CommunityPost');
const AdminLog = require('../models/AdminLog');

// @desc    Get system overview stats (admin)
// @route   GET /api/admin/stats
exports.getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    
    const totalGardens = await Garden.countDocuments();
    const totalPlants = await Plant.countDocuments();
    
    const totalPosts = await CommunityPost.countDocuments();
    const flaggedPosts = await CommunityPost.countDocuments({ isFlagged: true });
    
    const totalLogs = await AdminLog.countDocuments();

    // Plant health distribution
    const healthyPlants = await Plant.countDocuments({ health: 'healthy' });
    const warningPlants = await Plant.countDocuments({ health: 'warning' });
    const unhealthyPlants = await Plant.countDocuments({ health: 'unhealthy' });

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        totalAdmins,
        totalGardens,
        totalPlants,
        totalPosts,
        flaggedPosts,
        totalLogs,
        plantHealth: {
          healthy: healthyPlants,
          warning: warningPlants,
          unhealthy: unhealthyPlants,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (admin) with search & filters
// @route   GET /api/admin/users
exports.getAllUsers = async (req, res, next) => {
  try {
    const { search, role, status, level } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
      ];
    }

    if (role && role !== 'all') {
      query.role = role;
    }

    if (status && status !== 'all') {
      query.isActive = status === 'active';
    }

    if (level && level !== 'all') {
      query.gardeningLevel = level;
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new user/admin (admin)
// @route   POST /api/admin/users
exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, gardeningLevel, location } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({
      name,
      email,
      password: password || 'DefaultPass123!',
      role: role || 'user',
      gardeningLevel: gardeningLevel || 'beginner',
      location: location || {},
    });

    await AdminLog.create({
      adminId: req.user.id,
      action: 'create_user',
      targetType: 'user',
      targetId: user._id,
      details: { email: user.email, role: user.role },
    });

    const userObject = user.toObject();
    delete userObject.password;

    res.status(201).json({ success: true, user: userObject });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user details (admin)
// @route   PUT /api/admin/users/:id
exports.updateUser = async (req, res, next) => {
  try {
    const { name, email, role, isActive, gardeningLevel } = req.body;
    
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (gardeningLevel !== undefined) updateData.gardeningLevel = gardeningLevel;

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await AdminLog.create({
      adminId: req.user.id,
      action: 'update_user',
      targetType: 'user',
      targetId: user._id,
      details: updateData,
    });

    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role (admin)
// @route   PUT /api/admin/users/:id/role
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await AdminLog.create({
      adminId: req.user.id,
      action: 'update_user_role',
      targetType: 'user',
      targetId: user._id,
      details: { newRole: role },
    });

    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user (admin)
// @route   DELETE /api/admin/users/:id
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await AdminLog.create({
      adminId: req.user.id,
      action: 'delete_user',
      targetType: 'user',
      targetId: user._id,
      details: { email: user.email },
    });

    res.status(200).json({ success: true, message: 'User deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all gardens across platform (admin)
// @route   GET /api/admin/gardens
exports.getAllGardens = async (req, res, next) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    const gardens = await Garden.find(query)
      .populate('userId', 'name email')
      .populate('plants')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: gardens.length, gardens });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete garden (admin)
// @route   DELETE /api/admin/gardens/:id
exports.deleteGarden = async (req, res, next) => {
  try {
    const garden = await Garden.findByIdAndDelete(req.params.id);
    if (!garden) {
      return res.status(404).json({ success: false, message: 'Garden not found' });
    }

    // Remove associated plants
    await Plant.deleteMany({ gardenId: req.params.id });

    await AdminLog.create({
      adminId: req.user.id,
      action: 'delete_garden',
      targetType: 'garden',
      targetId: req.params.id,
      details: { gardenName: garden.name },
    });

    res.status(200).json({ success: true, message: 'Garden and associated plants deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Update garden details (admin)
// @route   PUT /api/admin/gardens/:id
exports.updateGarden = async (req, res, next) => {
  try {
    const { name, description, location, size, isActive } = req.body;
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (location !== undefined) updateData.location = location;
    if (size !== undefined) updateData.size = size;
    if (isActive !== undefined) updateData.isActive = isActive;

    const garden = await Garden.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate('userId', 'name email').populate('plants');

    if (!garden) {
      return res.status(404).json({ success: false, message: 'Garden not found' });
    }

    await AdminLog.create({
      adminId: req.user.id,
      action: 'update_garden',
      targetType: 'garden',
      targetId: garden._id,
      details: updateData,
    });

    res.status(200).json({ success: true, garden });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new garden (admin)
// @route   POST /api/admin/gardens
exports.createGarden = async (req, res, next) => {
  try {
    const { name, description, location, size, userId } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Garden name is required' });
    }
    const garden = await Garden.create({
      name,
      description: description || '',
      location: location || '',
      size: parseFloat(size) || 0,
      userId: userId || req.user.id,
    });

    await AdminLog.create({
      adminId: req.user.id,
      action: 'create_garden',
      targetType: 'garden',
      targetId: garden._id,
      details: { gardenName: garden.name },
    });

    res.status(201).json({ success: true, garden });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all plants across platform (admin)
// @route   GET /api/admin/plants
exports.getAllPlants = async (req, res, next) => {
  try {
    const { search, health, status } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { scientificName: { $regex: search, $options: 'i' } },
        { variety: { $regex: search, $options: 'i' } },
      ];
    }

    if (health && health !== 'all') {
      query.health = health;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    const plants = await Plant.find(query)
      .populate('userId', 'name email')
      .populate('gardenId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: plants.length, plants });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete plant (admin)
// @route   DELETE /api/admin/plants/:id
exports.deletePlant = async (req, res, next) => {
  try {
    const plant = await Plant.findByIdAndDelete(req.params.id);
    if (!plant) {
      return res.status(404).json({ success: false, message: 'Plant not found' });
    }

    // Remove plant reference from Garden
    await Garden.findByIdAndUpdate(plant.gardenId, {
      $pull: { plants: plant._id },
    });

    await AdminLog.create({
      adminId: req.user.id,
      action: 'delete_plant',
      targetType: 'plant',
      targetId: plant._id,
      details: { plantName: plant.name },
    });

    res.status(200).json({ success: true, message: 'Plant deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Update plant details (admin)
// @route   PUT /api/admin/plants/:id
exports.updatePlant = async (req, res, next) => {
  try {
    const { name, scientificName, variety, status, health, notes, sunlight, waterFrequency } = req.body;
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (scientificName !== undefined) updateData.scientificName = scientificName;
    if (variety !== undefined) updateData.variety = variety;
    if (status !== undefined) updateData.status = status;
    if (health !== undefined) updateData.health = health;
    if (notes !== undefined) updateData.notes = notes;
    if (sunlight !== undefined) updateData.sunlight = sunlight;
    if (waterFrequency !== undefined) updateData.waterFrequency = waterFrequency;

    const plant = await Plant.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate('userId', 'name email').populate('gardenId', 'name');

    if (!plant) {
      return res.status(404).json({ success: false, message: 'Plant not found' });
    }

    await AdminLog.create({
      adminId: req.user.id,
      action: 'update_plant',
      targetType: 'plant',
      targetId: plant._id,
      details: updateData,
    });

    res.status(200).json({ success: true, plant });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new plant (admin)
// @route   POST /api/admin/plants
exports.createPlant = async (req, res, next) => {
  try {
    const { name, scientificName, variety, gardenId, health, status, sunlight, waterFrequency, notes } = req.body;
    if (!name || !gardenId) {
      return res.status(400).json({ success: false, message: 'Plant name and garden selection are required' });
    }

    const garden = await Garden.findById(gardenId);
    if (!garden) {
      return res.status(404).json({ success: false, message: 'Selected garden space not found' });
    }

    const plant = await Plant.create({
      name,
      scientificName: scientificName || '',
      variety: variety || '',
      gardenId,
      userId: garden.userId || req.user.id,
      health: health || 'healthy',
      status: status || 'seedling',
      sunlight: sunlight || 'full',
      waterFrequency: parseInt(waterFrequency) || 3,
      notes: notes || '',
    });

    await Garden.findByIdAndUpdate(gardenId, {
      $push: { plants: plant._id },
    });

    await AdminLog.create({
      adminId: req.user.id,
      action: 'create_plant',
      targetType: 'plant',
      targetId: plant._id,
      details: { plantName: plant.name },
    });

    res.status(201).json({ success: true, plant });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all community posts (admin)
// @route   GET /api/admin/posts
exports.getAllPosts = async (req, res, next) => {
  try {
    const { search, category, flagged } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (flagged === 'true') {
      query.isFlagged = true;
    }

    const posts = await CommunityPost.find(query)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: posts.length, posts });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete post (admin)
// @route   DELETE /api/admin/posts/:id
exports.deletePost = async (req, res, next) => {
  try {
    const post = await CommunityPost.findByIdAndDelete(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    await AdminLog.create({
      adminId: req.user.id,
      action: 'delete_post',
      targetType: 'post',
      targetId: post._id,
      details: { postTitle: post.title },
    });

    res.status(200).json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get flagged posts (admin)
// @route   GET /api/admin/flagged-posts
exports.getFlaggedPosts = async (req, res, next) => {
  try {
    const posts = await CommunityPost.find({ isFlagged: true })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, posts });
  } catch (error) {
    next(error);
  }
};

// @desc    Moderate post (approve/delete/flag)
// @route   PUT /api/admin/posts/:id/moderate
exports.moderatePost = async (req, res, next) => {
  try {
    const { isApproved, isFlagged } = req.body;
    const post = await CommunityPost.findByIdAndUpdate(
      req.params.id,
      { isApproved, isFlagged },
      { new: true }
    );
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    await AdminLog.create({
      adminId: req.user.id,
      action: 'moderate_post',
      targetType: 'post',
      targetId: post._id,
      details: { isApproved, isFlagged },
    });

    res.status(200).json({ success: true, post });
  } catch (error) {
    next(error);
  }
};

// @desc    Create community announcement/post (admin)
// @route   POST /api/admin/posts
exports.createPost = async (req, res, next) => {
  try {
    const { title, content, category, imageUrl } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }

    const post = await CommunityPost.create({
      title,
      content,
      category: category || 'general',
      imageUrl: imageUrl || '',
      userId: req.user.id,
      isApproved: true,
      isFlagged: false,
    });

    await AdminLog.create({
      adminId: req.user.id,
      action: 'create_post',
      targetType: 'post',
      targetId: post._id,
      details: { postTitle: post.title },
    });

    res.status(201).json({ success: true, post });
  } catch (error) {
    next(error);
  }
};

// @desc    Get admin logs
// @route   GET /api/admin/logs
exports.getAdminLogs = async (req, res, next) => {
  try {
    const { search } = req.query;
    let query = {};

    const logs = await AdminLog.find(query)
      .populate('adminId', 'name email')
      .sort({ createdAt: -1 })
      .limit(200);

    res.status(200).json({ success: true, count: logs.length, logs });
  } catch (error) {
    next(error);
  }
};

// @desc    Export system data as CSV (admin)
// @route   GET /api/admin/export/:type
exports.exportCSVData = async (req, res, next) => {
  try {
    const { type } = req.params;
    let csvData = '';
    let filename = `urbanfarm_${type}_export.csv`;

    if (type === 'users') {
      const users = await User.find().select('-password').sort({ createdAt: -1 });
      csvData = 'ID,Name,Email,Role,Active,GardeningLevel,CreatedAt\n';
      users.forEach((u) => {
        csvData += `"${u._id}","${u.name}","${u.email}","${u.role}","${u.isActive}","${u.gardeningLevel}","${u.createdAt}"\n`;
      });
    } else if (type === 'gardens') {
      const gardens = await Garden.find().populate('userId', 'email').sort({ createdAt: -1 });
      csvData = 'ID,GardenName,OwnerEmail,Location,Size,PlantCount,CreatedAt\n';
      gardens.forEach((g) => {
        const owner = g.userId?.email || 'N/A';
        csvData += `"${g._id}","${g.name}","${owner}","${g.location || ''}","${g.size || 0}","${g.plants?.length || 0}","${g.createdAt}"\n`;
      });
    } else if (type === 'plants') {
      const plants = await Plant.find().populate('userId', 'email').populate('gardenId', 'name').sort({ createdAt: -1 });
      csvData = 'ID,PlantName,ScientificName,GardenName,OwnerEmail,Health,Status,CreatedAt\n';
      plants.forEach((p) => {
        const owner = p.userId?.email || 'N/A';
        const gName = p.gardenId?.name || 'N/A';
        csvData += `"${p._id}","${p.name}","${p.scientificName || ''}","${gName}","${owner}","${p.health}","${p.status}","${p.createdAt}"\n`;
      });
    } else if (type === 'posts') {
      const posts = await CommunityPost.find().populate('userId', 'email').sort({ createdAt: -1 });
      csvData = 'ID,Title,Category,AuthorEmail,IsApproved,IsFlagged,LikesCount,CommentsCount,CreatedAt\n';
      posts.forEach((p) => {
        const author = p.userId?.email || 'N/A';
        csvData += `"${p._id}","${p.title.replace(/"/g, '""')}","${p.category}","${author}","${p.isApproved}","${p.isFlagged}","${p.likes?.length || 0}","${p.comments?.length || 0}","${p.createdAt}"\n`;
      });
    } else if (type === 'logs') {
      const logs = await AdminLog.find().populate('adminId', 'email').sort({ createdAt: -1 });
      csvData = 'ID,AdminEmail,Action,TargetType,TargetID,CreatedAt\n';
      logs.forEach((l) => {
        const adminEmail = l.adminId?.email || 'System';
        csvData += `"${l._id}","${adminEmail}","${l.action}","${l.targetType}","${l.targetId || ''}","${l.createdAt}"\n`;
      });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid export type' });
    }

    await AdminLog.create({
      adminId: req.user.id,
      action: `export_${type}_csv`,
      targetType: 'system',
      details: { exportType: type },
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(csvData);
  } catch (error) {
    next(error);
  }
};
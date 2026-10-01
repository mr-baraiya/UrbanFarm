const CommunityPost = require('../models/CommunityPost');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');

// @desc    Create a community post
// @route   POST /api/community
exports.createPost = async (req, res, next) => {
  try {
    const { title, content, category } = req.body;
    let imageUrl = null;

    // If image uploaded, upload to Cloudinary
    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;
      const result = await cloudinary.uploader.upload(dataURI, { folder: 'community' });
      imageUrl = result.secure_url;
    }

    const post = await CommunityPost.create({
      userId: req.user.id,
      title,
      content,
      imageUrl,
      category,
    });

    // Auto-approve for now (admin moderation can be added later)
    post.isApproved = true;
    await post.save();

    const populated = await CommunityPost.findById(post._id).populate('userId', 'name profilePicture');
    res.status(201).json({ success: true, post: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all community posts (approved)
// @route   GET /api/community
exports.getPosts = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const filter = { isApproved: true, isFlagged: false };

    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    const posts = await CommunityPost.find(filter)
      .populate('userId', 'name profilePicture gardeningLevel')
      .populate('comments.userId', 'name profilePicture')
      .sort({ createdAt: -1 })
      .limit(50);
    res.status(200).json({ success: true, posts });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single post with comments
// @route   GET /api/community/:id
exports.getPostById = async (req, res, next) => {
  try {
    const post = await CommunityPost.findOne({ _id: req.params.id, isApproved: true })
      .populate('userId', 'name profilePicture gardeningLevel')
      .populate('comments.userId', 'name profilePicture');
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    res.status(200).json({ success: true, post });
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment to post
// @route   POST /api/community/:id/comments
exports.addComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    const post = await CommunityPost.findById(req.params.id);
    if (!post || !post.isApproved) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    post.comments.push({ userId: req.user.id, content });
    await post.save();

    const updated = await CommunityPost.findById(req.params.id)
      .populate('comments.userId', 'name profilePicture');
    res.status(201).json({ success: true, post: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Like/unlike a post
// @route   PUT /api/community/:id/like
exports.toggleLike = async (req, res, next) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const index = post.likes.indexOf(req.user.id);
    if (index > -1) {
      post.likes.splice(index, 1);
    } else {
      post.likes.push(req.user.id);
    }
    await post.save();

    res.status(200).json({ success: true, likes: post.likes.length, liked: index === -1 });
  } catch (error) {
    next(error);
  }
};

// Add this function to communityController.js

// @desc    Get leaderboard
// @route   GET /api/community/leaderboard
exports.getLeaderboard = async (req, res, next) => {
  try {
    // Aggregate users with their post and like counts
    const leaderboard = await User.aggregate([
      {
        $lookup: {
          from: 'communityposts',
          localField: '_id',
          foreignField: 'userId',
          as: 'posts'
        }
      },
      {
        $project: {
          name: 1,
          profilePicture: 1,
          postCount: { $size: '$posts' },
          likeCount: {
            $sum: {
              $map: {
                input: '$posts',
                as: 'post',
                in: { $size: '$$post.likes' }
              }
            }
          }
        }
      },
      {
        $addFields: {
          points: {
            $add: [
              { $multiply: ['$postCount', 10] },
              { $multiply: ['$likeCount', 2] }
            ]
          }
        }
      },
      { $sort: { points: -1 } },
      { $limit: 10 }
    ]);
    
    res.status(200).json({ success: true, leaderboard });
  } catch (error) {
    next(error);
  }
};
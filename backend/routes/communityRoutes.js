const express = require('express');
const router = express.Router();
const {
  createPost,
  getPosts,
  getPostById,
  addComment,
  toggleLike,
  getLeaderboard,
} = require('../controllers/communityController');
const { protect } = require('../middleware/authMiddleware');
const { uploadSingle, handleUploadError } = require('../middleware/uploadMiddleware');
const { postValidation } = require('../middleware/validationMiddleware');

router.route('/')
  .post(protect, uploadSingle, handleUploadError, postValidation, createPost)
  .get(getPosts);

router.get('/leaderboard', getLeaderboard);
router.get('/:id', getPostById);
router.post('/:id/comments', protect, addComment);
router.put('/:id/like', protect, toggleLike);

module.exports = router;
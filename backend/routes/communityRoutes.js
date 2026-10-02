const express = require('express');
const router = express.Router();
const {
  createPost,
  getPosts,
  getPostById,
  addComment,
  toggleLike,
  getLeaderboard,
  updatePost,
  deletePost,
  deleteComment,
} = require('../controllers/communityController');
const { protect } = require('../middleware/authMiddleware');
const { uploadSingle, handleUploadError } = require('../middleware/uploadMiddleware');
const { postValidation } = require('../middleware/validationMiddleware');

router.route('/')
  .post(protect, uploadSingle, handleUploadError, postValidation, createPost)
  .get(getPosts);

router.get('/leaderboard', getLeaderboard);
router.route('/:id')
  .get(getPostById)
  .put(protect, updatePost)
  .delete(protect, deletePost);

router.post('/:id/comments', protect, addComment);
router.delete('/:id/comments/:commentId', protect, deleteComment);
router.put('/:id/like', protect, toggleLike);

module.exports = router;
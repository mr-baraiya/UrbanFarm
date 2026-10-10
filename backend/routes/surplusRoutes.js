const express = require('express');
const router = express.Router();
const {
  getListings,
  createListing,
  updateStatus,
  deleteListing,
  submitSurplusRequest,
  updateSurplusRequestStatus,
  getUserChats,
  getOrCreateChat,
  sendChatMessage,
  getChatById,
} = require('../controllers/surplusController');
const { protect } = require('../middleware/authMiddleware');
const { uploadSingle, handleUploadError } = require('../middleware/uploadMiddleware');

// Marketplace Listings
router.route('/')
  .get(getListings)
  .post(protect, uploadSingle, handleUploadError, createListing);

router.route('/:id')
  .delete(protect, deleteListing);

router.route('/:id/status')
  .patch(protect, updateStatus);

// Requests Endpoints
router.route('/:id/requests')
  .post(protect, submitSurplusRequest);

router.route('/:id/requests/:dealId')
  .patch(protect, updateSurplusRequestStatus);

// Direct 1-on-1 Neighbor Chat
router.route('/chats')
  .get(protect, getUserChats)
  .post(protect, getOrCreateChat);

router.route('/chats/:chatId')
  .get(protect, getChatById);

router.route('/chats/:chatId/messages')
  .post(protect, sendChatMessage);

module.exports = router;

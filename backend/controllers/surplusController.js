const SurplusListing = require('../models/SurplusListing');
const SurplusChat = require('../models/SurplusChat');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const { createNotification } = require('../utils/notifications');

// @desc    Get all surplus listings
exports.getListings = async (req, res, next) => {
  try {
    const { category, priceType, search, maxDistance } = req.query;
    const filter = {};

    if (category && category !== 'all') {
      filter.category = category;
    }
    if (priceType && priceType !== 'all') {
      filter.priceType = priceType;
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'location.neighborhood': { $regex: search, $options: 'i' } },
      ];
    }

    const listings = await SurplusListing.find(filter)
      .populate('userId', 'name profilePicture location gardeningLevel')
      .sort({ createdAt: -1 })
      .limit(60);

    res.status(200).json({ success: true, listings });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new surplus harvest listing
// @route   POST /api/surplus
exports.createListing = async (req, res, next) => {
  try {
    const { title, category, quantity, priceType, price, unit, state, district, description, neighborhood, distanceKm, image } = req.body;
    let imageUrl = image || '';

    // If file uploaded via multipart
    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;
      const result = await cloudinary.uploader.upload(dataURI, { folder: 'surplus' });
      imageUrl = result.secure_url;
    }

    const user = await User.findById(req.user.id);
    const sellerName = user ? user.name : 'Urban Farmer';
    const sellerAvatar = user ? user.profilePicture : '';

    const calcDistance = distanceKm && Number(distanceKm) !== 0.8
      ? Number(distanceKm)
      : Number((0.5 + Math.random() * 2.0).toFixed(1));

    const listing = await SurplusListing.create({
      userId: req.user.id,
      sellerName,
      sellerAvatar,
      title,
      category,
      quantity,
      priceType,
      price: price ? Number(price) : 0,
      unit: unit || 'kg',
      description,
      imageUrl,
      location: {
        state: state || (user?.location?.state) || 'Gujarat',
        district: district || (user?.location?.city) || 'Rajkot',
        neighborhood: neighborhood || 'Sector 4',
        city: user?.location?.city || district || 'Rajkot',
        distanceKm: calcDistance,
      },
      status: 'available',
    });

    const populated = await SurplusListing.findById(listing._id).populate('userId', 'name profilePicture location gardeningLevel');
    res.status(201).json({ success: true, listing: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Update listing status (available, reserved, sold)
// @route   PATCH /api/surplus/:id/status
exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const listing = await SurplusListing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }
    if (listing.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    listing.status = status;
    await listing.save();

    res.status(200).json({ success: true, listing });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete surplus listing
// @route   DELETE /api/surplus/:id
exports.deleteListing = async (req, res, next) => {
  try {
    const listing = await SurplusListing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }
    if (listing.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await listing.deleteOne();
    res.status(200).json({ success: true, message: 'Listing deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit a buy request to a listing
// @route   POST /api/surplus/:id/requests
exports.submitSurplusRequest = async (req, res, next) => {
  try {
    const listingId = req.params.id;
    const dealReceipt = req.body;
    const buyerId = req.user.id;

    const listing = await SurplusListing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    const buyer = await User.findById(buyerId);
    const buyerName = buyer ? buyer.name : dealReceipt.buyerName || 'Neighbor Buyer';

    const fullReceipt = {
      ...dealReceipt,
      listingId: listing._id.toString(),
      listingTitle: listing.title,
      listingImage: listing.imageUrl,
      sellerName: listing.sellerName,
      sellerId: listing.userId.toString(),
      buyerName,
      buyerId,
      status: 'pending_approval',
      createdAt: new Date(),
    };

    // Filter existing requests from same buyer
    listing.pendingRequests = (listing.pendingRequests || []).filter(
      (r) => (r.buyerId && r.buyerId.toString() !== buyerId) || r.status === 'declined'
    );
    listing.pendingRequests.push(fullReceipt);
    listing.status = 'requested';
    await listing.save();

    // Create MongoDB Notification for Seller
    const sellerId = listing.userId;
    await createNotification(
      sellerId,
      'surplus_request',
      `📥 New Buy Request: ${listing.title}`,
      `${buyerName} requested ${fullReceipt.quantity} (${fullReceipt.price}).`,
      '/community#surplus',
      { listingId: listing._id, dealId: fullReceipt.dealId }
    );

    const populated = await SurplusListing.findById(listing._id).populate('userId', 'name profilePicture location gardeningLevel');
    res.status(200).json({ success: true, listing: populated, dealReceipt: fullReceipt });
  } catch (error) {
    next(error);
  }
};

// @desc    Accept or Decline a buy request on a listing
// @route   PATCH /api/surplus/:id/requests/:dealId
exports.updateSurplusRequestStatus = async (req, res, next) => {
  try {
    const { id: listingId, dealId } = req.params;
    const { status } = req.body; // 'accepted' or 'declined'

    const listing = await SurplusListing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    if (listing.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    let targetReq = null;
    listing.pendingRequests = (listing.pendingRequests || []).map((r) => {
      if (r.dealId === dealId) {
        r.status = status;
        targetReq = r;
      }
      return r;
    });

    if (status === 'accepted') {
      listing.status = 'sold';
    } else if (status === 'declined') {
      listing.status = 'available';
    }

    await listing.save();

    // Create MongoDB Notification for Buyer
    if (targetReq && targetReq.buyerId) {
      if (status === 'accepted') {
        await createNotification(
          targetReq.buyerId,
          'surplus_accepted',
          `🎉 Buy Request Accepted!`,
          `Seller ${listing.sellerName} accepted your request for "${listing.title}". Item marked as sold.`,
          '/community#surplus',
          { listingId: listing._id, dealId }
        );
      } else if (status === 'declined') {
        await createNotification(
          targetReq.buyerId,
          'surplus_declined',
          `❌ Buy Request Declined`,
          `Seller ${listing.sellerName} declined your request for "${listing.title}".`,
          '/community#surplus',
          { listingId: listing._id, dealId }
        );
      }
    }

    const populated = await SurplusListing.findById(listing._id).populate('userId', 'name profilePicture location gardeningLevel');
    res.status(200).json({ success: true, listing: populated });
  } catch (error) {
    next(error);
  }
};

// ===================================
// DIRECT 1-ON-1 CHAT ENDPOINTS
// ===================================

// @desc    Get all chat threads for the current user (as buyer or seller)
// @route   GET /api/surplus/chats
exports.getUserChats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const chats = await SurplusChat.find({
      $or: [{ buyerId: userId }, { sellerId: userId }],
    })
      .populate('buyerId', 'name profilePicture')
      .populate('sellerId', 'name profilePicture')
      .populate('listingId', 'title imageUrl price priceType status')
      .sort({ lastMessageAt: -1 });

    res.status(200).json({ success: true, chats });
  } catch (error) {
    next(error);
  }
};

// @desc    Get or create a 1-on-1 chat for a specific listing between current user and seller
// @route   POST /api/surplus/chats
exports.getOrCreateChat = async (req, res, next) => {
  try {
    const { listingId, sellerId } = req.body;
    const buyerId = req.user.id;

    if (!listingId || !sellerId) {
      return res.status(400).json({ success: false, message: 'listingId and sellerId are required' });
    }

    let chat = await SurplusChat.findOne({ listingId, buyerId, sellerId })
      .populate('buyerId', 'name profilePicture')
      .populate('sellerId', 'name profilePicture')
      .populate('listingId');

    if (!chat) {
      const listing = await SurplusListing.findById(listingId);
      const buyer = await User.findById(buyerId);

      const priceStr = listing
        ? listing.priceType === 'free'
          ? 'FREE'
          : listing.priceType === 'swap'
          ? 'Swap/Trade'
          : `₹${listing.price} / ${listing.unit}`
        : '';

      chat = await SurplusChat.create({
        listingId,
        buyerId,
        sellerId,
        listingTitle: listing ? listing.title : 'Surplus Item',
        listingImage: listing ? listing.imageUrl : '',
        listingPrice: priceStr,
        messages: [
          {
            senderId: buyerId,
            senderName: buyer ? buyer.name : 'Neighbor',
            text: `Hi! I am interested in your listing: "${listing ? listing.title : 'Surplus Harvest'}". Is it available?`,
            isRead: false,
          },
        ],
        lastMessage: `Hi! I am interested in your listing...`,
        lastMessageAt: new Date(),
      });

      chat = await SurplusChat.findById(chat._id)
        .populate('buyerId', 'name profilePicture')
        .populate('sellerId', 'name profilePicture')
        .populate('listingId');
    }

    res.status(200).json({ success: true, chat });
  } catch (error) {
    next(error);
  }
};

// @desc    Send a message in a 1-on-1 chat
// @route   POST /api/surplus/chats/:chatId/messages
exports.sendChatMessage = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const { text } = req.body;
    const senderId = req.user.id;

    const chat = await SurplusChat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat thread not found' });
    }

    const sender = await User.findById(senderId);
    const senderName = sender ? sender.name : 'Neighbor';

    const newMessage = {
      senderId,
      senderName,
      text,
      isRead: false,
      createdAt: new Date(),
    };

    chat.messages.push(newMessage);
    chat.lastMessage = text;
    chat.lastMessageAt = new Date();
    await chat.save();

    const updatedChat = await SurplusChat.findById(chatId)
      .populate('buyerId', 'name profilePicture')
      .populate('sellerId', 'name profilePicture')
      .populate('listingId');

    res.status(200).json({ success: true, chat: updatedChat, message: newMessage });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single chat thread by ID (for live polling)
// @route   GET /api/surplus/chats/:chatId
exports.getChatById = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const chat = await SurplusChat.findById(chatId)
      .populate('buyerId', 'name profilePicture')
      .populate('sellerId', 'name profilePicture')
      .populate('listingId');

    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat thread not found' });
    }

    res.status(200).json({ success: true, chat });
  } catch (error) {
    next(error);
  }
};


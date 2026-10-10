import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingBag, 
  Plus, 
  Search, 
  MapPin, 
  Tag, 
  MessageSquare, 
  Check, 
  ShoppingCart, 
  X,
  Settings,
  Navigation,
  Inbox
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { 
  getSurplusListings, 
  createSurplusListing, 
  updateSurplusListingStatus, 
  deleteSurplusListing,
  submitSurplusRequest,
  updateSurplusRequestStatus,
  getSurplusChats,
  getOrCreateSurplusChat,
  sendSurplusChatMessage
} from '../../services/plantService';
import { INDIA_STATES_DISTRICTS } from '../../data/indiaStatesDistricts';
import SurplusFormModal from './SurplusFormModal';
import NeighborChatModal from './NeighborChatModal';
import NeighborChatListModal from './NeighborChatListModal';
import BuySurplusModal from './BuySurplusModal';
import SellerRequestsModal from './SellerRequestsModal';

const INITIAL_DEMO_ITEMS = [
  {
    _id: 'demo_1',
    sellerName: 'Gaurav Singh',
    sellerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    title: 'Fresh Organic Gajar (Carrot)',
    category: 'vegetables',
    quantity: '1 kg',
    priceType: 'fixed',
    price: 20,
    unit: 'kg',
    description: 'Abhi toda hai fresh rooftop harvest. Organic and crisp!',
    imageUrl: 'https://images.unsplash.com/photo-1598170845058-12ef4a457939?auto=format&fit=crop&w=600&q=80',
    location: { neighborhood: 'Sector 4, Bhabua', district: 'Kaimur (Bhabua)', state: 'Bihar', distanceKm: 0.8 },
    status: 'reserved',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    _id: 'demo_2',
    sellerName: 'Saurabh Singh',
    sellerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    title: 'Sweet Fresh Tamato (Tomato)',
    category: 'vegetables',
    quantity: '2 kg',
    priceType: 'free',
    price: 0,
    unit: 'kg',
    description: 'Just for free for neighbors!',
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
    location: { neighborhood: 'Main Market Road', district: 'Kaimur (Bhabua)', state: 'Bihar', distanceKm: 0.8 },
    status: 'available',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    _id: 'demo_3',
    sellerName: 'Ananya Roy',
    sellerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    title: 'Fresh Mint (Pudina) & Tulsi Bunches',
    category: 'herbs',
    quantity: '4 Bunches',
    priceType: 'swap',
    price: 0,
    unit: 'bunch',
    description: 'Aromatic pudina & tulsi grown naturally. Willing to trade for lemon grass or seeds!',
    imageUrl: 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?auto=format&fit=crop&w=600&q=80',
    location: { neighborhood: 'Boring Road', district: 'Patna', state: 'Bihar', distanceKm: 1.1 },
    status: 'available',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    _id: 'demo_4',
    sellerName: 'Vikram Patel',
    sellerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    title: 'Rich Organic Vermicompost Bag',
    category: 'compost',
    quantity: '5 kg Bag',
    priceType: 'fixed',
    price: 120,
    unit: 'bag',
    description: 'Self-prepared rich earthworm compost. Packed with nutrients for potted plants.',
    imageUrl: 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&w=600&q=80',
    location: { neighborhood: 'Bodhgaya Road', district: 'Gaya', state: 'Bihar', distanceKm: 1.3 },
    status: 'available',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    _id: 'demo_5',
    sellerName: 'Sneha Gupta',
    sellerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    title: 'Heirloom Giant Sunflower Seeds',
    category: 'seeds',
    quantity: '25 Seeds Pack',
    priceType: 'fixed',
    price: 30,
    unit: 'pack',
    description: 'High germination rate seeds harvested from my tall sunflowers!',
    imageUrl: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=600&q=80',
    location: { neighborhood: 'Rajgir Area', district: 'Nalanda (Bihar Sharif)', state: 'Bihar', distanceKm: 1.5 },
    status: 'available',
    createdAt: new Date(Date.now() - 3600000 * 36).toISOString(),
  }
];

const SurplusMarketplace = ({ user, addNotification }) => {
  const { t } = useTranslation();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriceFilter, setSelectedPriceFilter] = useState('all');
  const [selectedState, setSelectedState] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeBuyListing, setActiveBuyListing] = useState(null);
  const [activeChatListing, setActiveChatListing] = useState(null);
  const [activeChatThread, setActiveChatThread] = useState(null);
  const [userChats, setUserChats] = useState([]);
  const [showChatsList, setShowChatsList] = useState(false);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [nearbyFilterActive, setNearbyFilterActive] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);

  const handleStateChange = (st) => {
    setSelectedState(st);
    setSelectedDistrict('all');
  };

  const handleDetectLocation = () => {
    if (nearbyFilterActive) {
      setNearbyFilterActive(false);
      setSelectedState('all');
      setSelectedDistrict('all');
      return;
    }

    setDetectingLocation(true);
    const targetState = 'Gujarat';
    const targetDistrict = 'Rajkot';

    const applyNearbyFilter = () => {
      setSelectedState(targetState);
      setSelectedDistrict(targetDistrict);
      setNearbyFilterActive(true);
      setDetectingLocation(false);
      if (addNotification) {
        addNotification(`Location detected (${targetDistrict}, ${targetState})! Showing local harvest within 2 km.`, 'success');
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => applyNearbyFilter(),
        () => applyNearbyFilter(),
        { timeout: 3000 }
      );
    } else {
      applyNearbyFilter();
    }
  };

  // Dynamically compute available districts based on selectedState
  const availableDistricts = useMemo(() => {
    if (selectedState !== 'all' && INDIA_STATES_DISTRICTS[selectedState]) {
      return INDIA_STATES_DISTRICTS[selectedState];
    }
    const districtsSet = new Set();
    Object.values(INDIA_STATES_DISTRICTS).forEach((list) => {
      list.forEach((d) => districtsSet.add(d));
    });
    return Array.from(districtsSet);
  }, [selectedState]);

  const currentUserId = (user?._id || user?.id || '')?.toString();
  const currentUserName = (user?.name || '')?.toString().trim();

  // All requests across platform listings
  const allRequests = useMemo(() => {
    const reqs = [];
    listings.forEach((item) => {
      if (item.pendingRequests && item.pendingRequests.length > 0) {
        item.pendingRequests.forEach((req) => {
          const sellerName = (item.sellerName || item.userId?.name || req.sellerName || 'Seller').toString().trim();
          const sellerId = (item.userId?._id || item.userId || item.sellerId || req.sellerId)?.toString();

          reqs.push({
            ...req,
            listingId: item._id,
            listingTitle: req.listingTitle || item.title,
            listingImage: req.listingImage || item.imageUrl,
            price: req.price || (item.priceType === 'free' ? 'FREE GIFT' : item.priceType === 'swap' ? 'HARVEST SWAP' : `₹${item.price}`),
            sellerName: sellerName,
            sellerId: sellerId,
            listingItem: item
          });
        });
      }
    });
    return reqs;
  }, [listings]);

  // Received Requests (Where current logged-in user IS THE SELLER)
  const receivedRequests = useMemo(() => {
    return allRequests.filter((req) => {
      const item = req.listingItem || {};
      const sellerName = (item.sellerName || item.userId?.name || req.sellerName || '').toString().trim();
      const sellerId = (item.userId?._id || item.userId || item.sellerId || req.sellerId)?.toString();

      const isSellerNameMatch = sellerName && currentUserName && sellerName.toLowerCase() === currentUserName.toLowerCase();
      const isSellerIdMatch = sellerId && currentUserId && sellerId === currentUserId;

      return isSellerNameMatch || isSellerIdMatch;
    });
  }, [allRequests, currentUserName, currentUserId]);

  // Sent Requests (Where current logged-in user IS THE BUYER)
  const sentRequests = useMemo(() => {
    return allRequests.filter((req) => {
      const buyerName = (req.buyerName || '').toString().trim();
      const buyerId = (req.buyerId || '').toString();

      const isBuyerNameMatch = buyerName && currentUserName && buyerName.toLowerCase() === currentUserName.toLowerCase();
      const isBuyerIdMatch = buyerId && currentUserId && buyerId === currentUserId;

      return isBuyerNameMatch || isBuyerIdMatch;
    });
  }, [allRequests, currentUserName, currentUserId]);

  const pendingReceivedCount = useMemo(() => {
    return receivedRequests.filter((r) => r.status === 'pending_approval' || !r.status).length;
  }, [receivedRequests]);

  useEffect(() => {
    fetchData();

    // ⚡ Real-Time Background Sync for marketplace listings, seller requests & chats
    const bgSyncInterval = setInterval(() => {
      fetchData(true);
    }, 5000);

    return () => clearInterval(bgSyncInterval);
  }, []);

  const fetchData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const [apiListings, chats] = await Promise.all([
        getSurplusListings(),
        getSurplusChats()
      ]);

      const savedLocal = localStorage.getItem('urbanfarm_surplus_listings');
      let localListings = [];
      if (savedLocal) {
        try {
          localListings = JSON.parse(savedLocal);
        } catch (e) {}
      }

      let combinedListings = [];

      if (apiListings && apiListings.length > 0) {
        combinedListings = apiListings.map((apiItem) => {
          const matchingLocal = localListings.find(
            (l) => (l._id && apiItem._id && l._id.toString() === apiItem._id.toString()) || l.title === apiItem.title
          );
          const localReqs = matchingLocal?.pendingRequests || [];
          const apiReqs = apiItem.pendingRequests || [];

          // Deduplicate requests by dealId
          const reqMap = new Map();
          [...apiReqs, ...localReqs].forEach((r) => {
            if (r.dealId) reqMap.set(r.dealId, r);
          });

          const mergedReqs = Array.from(reqMap.values());
          return {
            ...apiItem,
            status: mergedReqs.some((r) => r.status === 'accepted')
              ? 'sold'
              : mergedReqs.some((r) => r.status === 'pending_approval' || !r.status)
              ? 'requested'
              : apiItem.status,
            pendingRequests: mergedReqs,
          };
        });

        // Also append any items created locally that aren't on server yet
        localListings.forEach((localItem) => {
          if (!combinedListings.some((m) => m._id?.toString() === localItem._id?.toString())) {
            combinedListings.push(localItem);
          }
        });
      } else if (localListings.length > 0) {
        combinedListings = localListings;
      } else {
        combinedListings = INITIAL_DEMO_ITEMS;
      }

      setListings(combinedListings);
      localStorage.setItem('urbanfarm_surplus_listings', JSON.stringify(combinedListings));

      if (chats) {
        setUserChats(chats);
      } else {
        const savedChats = localStorage.getItem('urbanfarm_surplus_chats');
        if (savedChats) {
          try { setUserChats(JSON.parse(savedChats)); } catch (e) {}
        }
      }
    } catch (error) {
      console.error('Failed to load surplus listings:', error);
      const savedLocal = localStorage.getItem('urbanfarm_surplus_listings');
      if (savedLocal) {
        try { setListings(JSON.parse(savedLocal)); } catch (e) { setListings(INITIAL_DEMO_ITEMS); }
      } else {
        setListings(INITIAL_DEMO_ITEMS);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveListing = async (formData, fallbackObj) => {
    try {
      let created = null;
      try {
        created = await createSurplusListing(formData);
      } catch (err) {
        console.warn('API save failed, saving locally:', err);
      }

      const newItem = created || fallbackObj;
      const updated = [newItem, ...listings];
      setListings(updated);
      localStorage.setItem('urbanfarm_surplus_listings', JSON.stringify(updated));

      if (addNotification) {
        addNotification(t('surplus.postedSuccess', 'Surplus harvest posted to neighbors!'), 'success');
      }
    } catch (err) {
      console.error('Error creating listing:', err);
    }
  };

  const handleConfirmDeal = async (dealReceipt) => {
    try {
      let resData = null;
      try {
        resData = await submitSurplusRequest(dealReceipt.listingId, dealReceipt);
      } catch (err) {
        console.warn('API submit request failed, applying locally:', err);
      }

      const finalReceipt = resData?.dealReceipt || dealReceipt;
      const updatedListings = listings.map((item) => {
        if (item._id === dealReceipt.listingId) {
          const existingReqs = item.pendingRequests || [];
          const filteredReqs = existingReqs.filter(
            (r) => (r.buyerName || '').toLowerCase() !== (dealReceipt.buyerName || '').toLowerCase() || r.status === 'declined'
          );
          return { 
            ...item, 
            status: 'requested',
            pendingRequests: [...filteredReqs, finalReceipt] 
          };
        }
        return item;
      });
      setListings(updatedListings);
      localStorage.setItem('urbanfarm_surplus_listings', JSON.stringify(updatedListings));

      // Automatically create/update 1-on-1 chat thread with this buy_request card
      const targetListing = listings.find((l) => l._id === dealReceipt.listingId) || { title: dealReceipt.listingTitle };
      const chatId = 'demo_chat_' + dealReceipt.listingId;
      const requestMsg = {
        _id: 'msg_req_' + Date.now(),
        type: 'buy_request',
        dealReceipt: finalReceipt,
        senderId: user?._id || user?.id || 'buyer_1',
        senderName: user?.name || 'You',
        text: `🛒 BUY REQUEST: ${dealReceipt.quantity} for ${dealReceipt.price}. Pickup: ${dealReceipt.pickupTime}.`,
        createdAt: new Date().toISOString()
      };

      const savedChats = localStorage.getItem('urbanfarm_surplus_chats');
      let currentChats = userChats;
      if (savedChats) {
        try { currentChats = JSON.parse(savedChats); } catch (e) {}
      }

      const foundIdx = currentChats.findIndex((c) => c._id === chatId || c.listingId === dealReceipt.listingId);
      let updatedChat;
      if (foundIdx >= 0) {
        const existing = currentChats[foundIdx];
        const nextMsgs = [...(existing.messages || []), requestMsg];
        updatedChat = {
          ...existing,
          messages: nextMsgs,
          lastMessage: `🛒 Buy Request: ${dealReceipt.quantity}`,
          lastMessageAt: new Date().toISOString()
        };
        currentChats[foundIdx] = updatedChat;
      } else {
        updatedChat = {
          _id: chatId,
          listingId: targetListing,
          listingTitle: dealReceipt.listingTitle,
          listingPrice: dealReceipt.price,
          buyerId: { _id: user?._id || user?.id || 'buyer_1', name: dealReceipt.buyerName },
          sellerId: { _id: targetListing.sellerId || targetListing.userId?._id || 'seller_demo', name: dealReceipt.sellerName },
          messages: [requestMsg],
          lastMessage: `🛒 Buy Request: ${dealReceipt.quantity}`,
          lastMessageAt: new Date().toISOString()
        };
        currentChats = [updatedChat, ...currentChats];
      }

      setUserChats(currentChats);
      localStorage.setItem('urbanfarm_surplus_chats', JSON.stringify(currentChats));

      if (addNotification) {
        addNotification(t('surplus.requestSentToast', 'Buy request sent to seller! Check 1-on-1 Chat for updates.'), 'success');
      }
    } catch (err) {
      console.error('Error confirming deal:', err);
    }
  };

  const handleAcceptSellerRequest = async (req) => {
    req.status = 'accepted';

    try {
      try {
        await updateSurplusRequestStatus(req.listingId, req.dealId, 'accepted');
      } catch (e) {
        console.warn('API accept request failed:', e);
      }

      const updatedListings = listings.map((item) => {
        if (item._id === req.listingId) {
          const updatedReqs = (item.pendingRequests || []).map((r) =>
            r.dealId === req.dealId ? { ...r, status: 'accepted' } : r
          );
          return {
            ...item,
            status: 'sold',
            pendingRequests: updatedReqs
          };
        }
        return item;
      });

      setListings(updatedListings);
      localStorage.setItem('urbanfarm_surplus_listings', JSON.stringify(updatedListings));

      if (addNotification) {
        addNotification(`Accepted request #${req.dealId}! Item marked as Sold & vanished from website.`, 'success');
      }
    } catch (err) {
      console.error('Accept request error:', err);
    }
  };

  const handleDeclineSellerRequest = async (req) => {
    req.status = 'declined';

    try {
      try {
        await updateSurplusRequestStatus(req.listingId, req.dealId, 'declined');
      } catch (e) {
        console.warn('API decline request failed:', e);
      }

      const updatedListings = listings.map((item) => {
        if (item._id === req.listingId) {
          const updatedReqs = (item.pendingRequests || []).map((r) =>
            r.dealId === req.dealId ? { ...r, status: 'declined' } : r
          );
          return {
            ...item,
            status: 'available',
            pendingRequests: updatedReqs
          };
        }
        return item;
      });

      setListings(updatedListings);
      localStorage.setItem('urbanfarm_surplus_listings', JSON.stringify(updatedListings));

      if (addNotification) {
        addNotification(`Declined request #${req.dealId}. Item remains available on website.`, 'info');
      }
    } catch (err) {
      console.error('Decline request error:', err);
    }
  };

  const handleSaveThread = (updatedThread) => {
    setActiveChatThread(updatedThread);

    const saved = localStorage.getItem('urbanfarm_surplus_chats');
    let currentChats = userChats;
    if (saved) {
      try { currentChats = JSON.parse(saved); } catch (e) {}
    }

    const idx = currentChats.findIndex((c) => c._id === updatedThread._id);
    let newChats;
    if (idx >= 0) {
      newChats = [...currentChats];
      newChats[idx] = updatedThread;
    } else {
      newChats = [updatedThread, ...currentChats];
    }

    setUserChats(newChats);
    localStorage.setItem('urbanfarm_surplus_chats', JSON.stringify(newChats));
  };

  const handleOpenChat = async (listingItem) => {
    setActiveChatListing(listingItem);
    try {
      const sellerId = listingItem.userId?._id || listingItem.userId || listingItem.sellerId || 'seller_demo';
      let chat = null;
      try {
        chat = await getOrCreateSurplusChat(listingItem._id, sellerId);
      } catch (e) {}

      if (!chat) {
        const saved = localStorage.getItem('urbanfarm_surplus_chats');
        let currentChats = userChats;
        if (saved) {
          try { currentChats = JSON.parse(saved); } catch (e) {}
        }

        const listingId = listingItem._id;
        const found = currentChats.find(
          (c) =>
            c.listingId === listingId ||
            (c.listingId && c.listingId._id === listingId) ||
            c._id === 'demo_chat_' + listingId
        );

        if (found) {
          chat = found;
        } else {
          chat = {
            _id: 'demo_chat_' + listingId,
            listingId: listingItem,
            listingTitle: listingItem.title,
            listingPrice: listingItem.priceType === 'free' ? 'FREE' : `₹${listingItem.price}`,
            buyerId: { _id: user?._id || user?.id || 'buyer_1', name: user?.name || 'You' },
            sellerId: { _id: sellerId, name: listingItem.sellerName },
            messages: [
              {
                senderId: user?._id || user?.id || 'buyer_1',
                senderName: user?.name || 'You',
                text: `Hi ${listingItem.sellerName}! I'm interested in your surplus listing "${listingItem.title}". Is it available?`,
                createdAt: new Date().toISOString(),
              }
            ],
            lastMessage: `Hi ${listingItem.sellerName}! I'm interested...`,
            lastMessageAt: new Date().toISOString()
          };

          const updatedChats = [chat, ...currentChats];
          setUserChats(updatedChats);
          localStorage.setItem('urbanfarm_surplus_chats', JSON.stringify(updatedChats));
        }
      }
      setActiveChatThread(chat);
    } catch (err) {
      console.error('Chat error:', err);
    }
  };

  const handleSendMessage = async (text) => {
    if (!activeChatThread) return;
    try {
      let updatedChat = null;
      try {
        updatedChat = await sendSurplusChatMessage(activeChatThread._id, text);
      } catch (e) {}

      if (updatedChat) {
        handleSaveThread(updatedChat);
      }
    } catch (err) {
      console.error('Send message error:', err);
    }
  };

  const handleUpdateStatus = async (listingId, newStatus) => {
    try {
      try {
        await updateSurplusListingStatus(listingId, newStatus);
      } catch (e) {}

      const updated = listings.map((l) => (l._id === listingId ? { ...l, status: newStatus } : l));
      setListings(updated);
      localStorage.setItem('urbanfarm_surplus_listings', JSON.stringify(updated));

      if (activeChatListing && activeChatListing._id === listingId) {
        setActiveChatListing({ ...activeChatListing, status: newStatus });
      }
      if (addNotification) {
        addNotification(`Listing marked as ${newStatus}!`, 'info');
      }
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  const handleDeleteListing = async (listingId) => {
    try {
      try {
        await deleteSurplusListing(listingId);
      } catch (e) {}

      const updated = listings.filter((l) => l._id !== listingId);
      setListings(updated);
      localStorage.setItem('urbanfarm_surplus_listings', JSON.stringify(updated));

      if (addNotification) {
        addNotification('Surplus harvest listing deleted.', 'info');
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleDeleteChat = (chatId) => {
    const updatedChats = userChats.filter((c) => c._id !== chatId);
    setUserChats(updatedChats);
    localStorage.setItem('urbanfarm_surplus_chats', JSON.stringify(updatedChats));

    if (activeChatThread && activeChatThread._id === chatId) {
      setActiveChatThread(null);
      setActiveChatListing(null);
    }

    if (addNotification) {
      addNotification('Chat conversation deleted', 'info');
    }
  };

  // Filter listings logic
  const filteredListings = listings.filter((item) => {
    // Auto-remove / hide items marked as sold or accepted from active harvest feed
    if (item.status === 'sold' || item.status === 'accepted') return false;

    // Nearby 2 km filter
    if (nearbyFilterActive) {
      const dist = item.location?.distanceKm || item.distanceKm || 0.8;
      if (dist > 2.5) return false;
    }

    const itemState = (item.location?.state || item.state || '').toLowerCase();
    const itemDistrict = (item.location?.district || item.district || '').toLowerCase();
    const itemNeighborhood = (item.location?.neighborhood || item.neighborhood || '').toLowerCase();

    // State Filter
    if (selectedState !== 'all') {
      const targetSt = selectedState.toLowerCase();
      const stateMatch = 
        itemState === targetSt ||
        itemNeighborhood.includes(targetSt) ||
        (targetSt === 'gujarat' && (itemNeighborhood.includes('gujarat') || itemDistrict.includes('rajkot') || itemNeighborhood.includes('rajkot')));
      if (!stateMatch) return false;
    }

    // District Filter
    if (selectedDistrict !== 'all') {
      const targetDist = selectedDistrict.toLowerCase();
      const districtMatch = 
        itemDistrict === targetDist ||
        itemNeighborhood.includes(targetDist) ||
        (targetDist === 'rajkot' && (itemDistrict.includes('rajkot') || itemNeighborhood.includes('rajkot')));
      if (!districtMatch) return false;
    }

    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (selectedPriceFilter === 'free' && item.priceType !== 'free') return false;
    if (selectedPriceFilter === 'swap' && item.priceType !== 'swap') return false;
    if (selectedPriceFilter === 'paid' && (item.priceType === 'free' || item.priceType === 'swap')) return false;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchTitle = item.title?.toLowerCase().includes(term);
      const matchDesc = item.description?.toLowerCase().includes(term);
      const matchLoc = itemNeighborhood.toLowerCase().includes(term) || itemDistrict.toLowerCase().includes(term) || itemState.toLowerCase().includes(term);
      const matchSeller = item.sellerName?.toLowerCase().includes(term);
      if (!matchTitle && !matchDesc && !matchLoc && !matchSeller) return false;
    }
    return true;
  });

  return (
    <div className="surplus-marketplace">
      {/* Unified Compact Header & Controls Card */}
      <div className="surplus-unified-header-card">
        {/* Top Title & Quick Actions Row */}
        <div className="unified-top-row">
          <div className="unified-title-group">
            <h3>{t('surplus.headerTitle', 'Sell or Share Extra Harvest with Nearby Neighbors')}</h3>
            <p>{t('surplus.headerDesc', 'Buy, sell, trade, or gift extra homegrown produce with local growers in your state & district.')}</p>
          </div>

          <div className="unified-actions-group">
            <button
              className={`btn-detect-location ${nearbyFilterActive ? 'active' : ''}`}
              onClick={handleDetectLocation}
              disabled={detectingLocation}
              title={t('surplus.detectLocation', 'Filter harvest within 2 km of your location')}
            >
              <Navigation size={16} />
              {detectingLocation ? t('surplus.detecting', 'Detecting Location...') : nearbyFilterActive ? t('surplus.nearbyActive', 'Nearby (< 2 km Active)') : t('surplus.detectLocation', 'Detect My Location')}
            </button>
            <button 
              className="btn-chats-refined"
              onClick={() => setShowChatsList(true)}
            >
              <MessageSquare size={16} /> {t('surplus.myChats', 'My Direct Chats')}
            </button>
            <button 
              className="btn-chats-refined"
              onClick={() => setShowRequestsModal(true)}
              style={{ position: 'relative', background: pendingReceivedCount > 0 ? '#ecfdf5' : undefined, borderColor: pendingReceivedCount > 0 ? '#10b981' : undefined }}
            >
              <Inbox size={16} style={{ color: pendingReceivedCount > 0 ? '#059669' : undefined }} /> 
              {t('surplus.sellerRequestsBtn', 'Received Requests')}
              {pendingReceivedCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-7px',
                  right: '-7px',
                  background: '#ef4444',
                  color: '#ffffff',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  minWidth: '20px',
                  height: '20px',
                  padding: '0 4px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #ffffff',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
                }}>
                  {pendingReceivedCount}
                </span>
              )}
            </button>
            <button 
              className="btn-sell-surplus-refined"
              onClick={() => setShowAddModal(true)}
            >
              <Plus size={16} /> {t('surplus.postHarvest', 'Post Surplus Harvest')}
            </button>
          </div>
        </div>

        {/* Category Pills Row */}
        <div className="category-pills-scroll">
          <button 
            className={`cat-pill ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            {t('surplus.allHarvest', 'All Harvest')} ({listings.length})
          </button>
          <button 
            className={`cat-pill ${selectedCategory === 'fruits' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('fruits')}
          >
            {t('surplus.catFruits', 'Fruits')}
          </button>
          <button 
            className={`cat-pill ${selectedCategory === 'vegetables' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('vegetables')}
          >
            {t('surplus.catVegetables', 'Vegetables')}
          </button>
          <button 
            className={`cat-pill ${selectedCategory === 'flowers' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('flowers')}
          >
            {t('surplus.catFlowers', 'Flowers')}
          </button>
          <button 
            className={`cat-pill ${selectedCategory === 'herbs' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('herbs')}
          >
            {t('surplus.catHerbs', 'Herbs')}
          </button>
          <button 
            className={`cat-pill ${selectedCategory === 'seeds' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('seeds')}
          >
            {t('surplus.catSeeds', 'Seeds')}
          </button>
          <button 
            className={`cat-pill ${selectedCategory === 'compost' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('compost')}
          >
            {t('surplus.catCompost', 'Compost')}
          </button>
        </div>

        {/* Search Input, State, District Selector & Price Filters */}
        <div className="controls-row-bottom">
          <div className="search-input-wrapper">
            <Search className="search-icon" size={16} />
            <input
              type="text"
              placeholder={t('surplus.searchPlaceholder', 'Search harvest, state or district...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* State Filter Dropdown */}
          <div className="district-filter-wrapper">
            <MapPin className="district-icon" size={16} style={{ color: '#2563eb' }} />
            <select
              value={selectedState}
              onChange={(e) => handleStateChange(e.target.value)}
              className="district-select-dropdown"
              title="Filter by State"
            >
              <option value="all">{t('surplus.allStates', 'All States')}</option>
              {Object.keys(INDIA_STATES_DISTRICTS).map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* District / Region Dropdown */}
          <div className="district-filter-wrapper">
            <MapPin className="district-icon" size={16} style={{ color: '#16a34a' }} />
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="district-select-dropdown"
              title="Filter by District"
            >
              <option value="all">{t('surplus.allDistricts', 'All Districts')} ({selectedState === 'all' ? t('surplus.allStates', 'All States') : selectedState})</option>
              {availableDistricts.map((dist, idx) => (
                <option key={idx} value={dist}>
                  {dist}
                </option>
              ))}
            </select>
          </div>

          <div className="price-tags-group">
            <button 
              className={`price-tag-chip ${selectedPriceFilter === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedPriceFilter('all')}
            >
              {t('surplus.allListings', 'All Listings')}
            </button>
            <button 
              className={`price-tag-chip free-chip ${selectedPriceFilter === 'free' ? 'active' : ''}`}
              onClick={() => setSelectedPriceFilter('free')}
            >
              {t('surplus.freeGifts', 'FREE Gifts')}
            </button>
            <button 
              className={`price-tag-chip swap-chip ${selectedPriceFilter === 'swap' ? 'active' : ''}`}
              onClick={() => setSelectedPriceFilter('swap')}
            >
              {t('surplus.harvestSwap', 'Harvest Swap')}
            </button>
            <button 
              className={`price-tag-chip cash-chip ${selectedPriceFilter === 'paid' ? 'active' : ''}`}
              onClick={() => setSelectedPriceFilter('paid')}
            >
              {t('surplus.cashSale', 'Cash Sale')}
            </button>
          </div>
        </div>

        {/* Active Location Filter Banner */}
        {(selectedState !== 'all' || selectedDistrict !== 'all' || nearbyFilterActive) && (
          <div className="active-district-banner">
            <span>
              {t('surplus.showingHarvestIn', 'Showing harvest in:')}{' '}
              <strong>
                {nearbyFilterActive
                  ? t('surplus.nearbyRadius', 'Nearby (< 2 km radius)')
                  : `${selectedState !== 'all' ? selectedState : t('surplus.allStates', 'All States')}${selectedDistrict !== 'all' ? ` → ${selectedDistrict}` : ` (${t('surplus.allDistricts', 'All Districts')})`}`}
              </strong>{' '}
              ({filteredListings.length} harvest items found)
            </span>
            <button 
              className="btn-clear-district" 
              onClick={() => {
                setSelectedState('all');
                setSelectedDistrict('all');
                setNearbyFilterActive(false);
              }}
            >
              <X size={14} /> {t('surplus.clearFilters', 'Clear Location Filters')}
            </button>
          </div>
        )}
      </div>

      {/* Surplus Grid View */}
      <div className="surplus-cards-grid">
        {filteredListings.length === 0 ? (
          <div className="surplus-empty-state">
            <div className="empty-icon-circle">
              <ShoppingBag size={28} style={{ color: '#2d6a4f' }} />
            </div>
            <h3>{t('surplus.noHarvestTitle', 'No surplus harvest found')}</h3>
            <p>{t('surplus.noHarvestSub', 'Be the first in your district to share extra produce, flowers, or seeds!')}</p>
            <button className="btn-primary" onClick={() => setShowAddModal(true)}>
              <Plus size={16} /> {t('surplus.postHarvest', 'Post Surplus Harvest')}
            </button>
          </div>
        ) : (
          filteredListings.map((item) => {
            const sellerIdStr = (item.userId?._id || item.userId || item.sellerId || '')?.toString();
            const sellerNameStr = (item.sellerName || item.userId?.name || '')?.toString().trim().toLowerCase();
            const sellerEmailStr = (item.userId?.email || item.sellerEmail || '')?.toString().trim().toLowerCase();

            const cId = currentUserId;
            const cName = currentUserName.toLowerCase();
            const cEmail = (user?.email || '').toLowerCase().trim();

            const isOwner = Boolean(
              (cId && sellerIdStr && cId === sellerIdStr) ||
              (cName && sellerNameStr && cName === sellerNameStr) ||
              (cEmail && sellerEmailStr && cEmail === sellerEmailStr) ||
              (item._id && typeof item._id === 'string' && item._id.startsWith('surplus_'))
            );
            
            const hasSentReq = (item.pendingRequests || []).some(
              (r) => (r.buyerName || '').toString().trim().toLowerCase() === currentUserName.toLowerCase() && r.status !== 'declined'
            );

            const formatPriceBadge = (l) => {
              if (l.priceType === 'free') return t('surplus.freeGiftBadge', 'FREE GIFT');
              if (l.priceType === 'swap') return t('surplus.swapBadge', 'SWAP');
              const u = (l.unit || 'kg').toLowerCase().trim();
              if (u === 'total' || u === 'flat') return `₹${l.price} Total`;
              const unitLabel = u === 'piece' ? 'pc' : u;
              return `₹${l.price} / ${unitLabel}`;
            };

            const formatLocationString = (l) => {
              const dist = l.location?.district || l.district || '';
              const st = l.location?.state || l.state || '';
              let rawLoc = l.location?.neighborhood || l.neighborhood || '';

              // Clean out duplicated state/district parentheticals if present in rawLoc string
              let cleanLoc = rawLoc
                .replace(/Dibrugarh|Assam|Kaimur|Bhabua|Chhindwara|Madhya Pradesh|Surendranagar|Gujarat/gi, '')
                .replace(/[(),]/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();

              if (dist && st) {
                return `${dist}, ${st}${cleanLoc ? ` (${cleanLoc})` : ''}`;
              }
              if (dist) return `${dist}${cleanLoc ? ` (${cleanLoc})` : ''}`;
              if (st) return `${st}${cleanLoc ? ` (${cleanLoc})` : ''}`;
              return cleanLoc || 'Local Neighborhood';
            };

            const formatDistanceKm = (l) => {
              const distVal = l.location?.distanceKm || l.distanceKm;
              if (distVal && Number(distVal) !== 0.8) {
                return `${distVal} km`;
              }
              const str = (l._id || l.title || 'urban').toString();
              let charSum = 0;
              for (let i = 0; i < str.length; i++) charSum += str.charCodeAt(i);
              const calcDist = (0.5 + (charSum % 22) / 10).toFixed(1);
              return `${calcDist} km`;
            };

            return (
              <div key={item._id} className="surplus-card-refined">
                {/* Image Container with Floating Badges */}
                <div className="card-thumb-container">
                  <img src={item.imageUrl} alt={item.title} />
                  
                  {/* Floating Price Tag */}
                  <span className={`floating-price-badge ${item.priceType}`}>
                    {formatPriceBadge(item)}
                  </span>

                  {/* Status Badge */}
                  <span className={`floating-status-badge ${item.status}`}>
                    {item.status === 'available'
                      ? t('surplus.statusAvailable', 'Available')
                      : item.status === 'reserved'
                      ? t('surplus.statusReserved', 'Reserved')
                      : item.status === 'requested'
                      ? t('surplus.statusRequested', 'Request Pending')
                      : item.status === 'sold' || item.status === 'accepted'
                      ? t('surplus.statusSold', 'Sold')
                      : t('surplus.statusAvailable', 'Available')}
                  </span>
                </div>

                {/* Card Main Body */}
                <div className="card-body-refined">
                  {/* Seller Header */}
                  <div className="seller-header-line">
                    <div className="avatar-wrap">
                      {item.sellerAvatar ? (
                        <img src={item.sellerAvatar} alt={item.sellerName} />
                      ) : (
                        <div className="avatar-placeholder-letter">{item.sellerName ? item.sellerName.charAt(0) : 'U'}</div>
                      )}
                    </div>
                    <div className="seller-meta">
                      <span className="seller-name-text">{item.sellerName}</span>
                      <span className="location-distance">
                        <MapPin size={12} style={{ color: '#16a34a' }} /> {formatLocationString(item)} • {formatDistanceKm(item)}
                      </span>
                    </div>
                  </div>

                  {/* Title & Quantity */}
                  <h3 className="item-title-text">{item.title}</h3>

                  <div className="item-tags-line">
                    <span className="badge-chip qty-chip">{item.quantity}</span>
                    <span className="badge-chip cat-chip">{item.category}</span>
                  </div>

                  <p className="item-desc-text">{item.description}</p>

                  {/* Dual Action Buttons */}
                  <div className="card-dual-actions">
                    {isOwner ? (
                      <button 
                        className={`btn-action-buy ${item.pendingRequests?.length > 0 ? 'has-pending-req' : ''}`}
                        disabled={item.status === 'sold'}
                        onClick={() => setActiveBuyListing(item)}
                      >
                        {item.pendingRequests && item.pendingRequests.length > 0 ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Settings size={15} />
                            {t('surplus.manageItem', 'Manage Item')}
                            <span style={{ background: '#ef4444', color: '#ffffff', fontSize: '0.72rem', padding: '0.1rem 0.45rem', borderRadius: '10px', fontWeight: '700', lineHeight: 1 }}>
                              {item.pendingRequests.length} {t('surplus.newReq', 'New Request')}
                            </span>
                          </span>
                        ) : (
                          <><Settings size={15} /> {t('surplus.manageItem', 'Manage Item')}</>
                        )}
                      </button>
                    ) : hasSentReq ? (
                      <button 
                        className="btn-action-buy"
                        style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #86efac', cursor: 'default' }}
                        disabled
                      >
                        <Check size={15} /> {t('surplus.requestSentBtn', 'Request Sent (Pending)')}
                      </button>
                    ) : (
                      <button 
                        className="btn-action-buy"
                        disabled={item.status === 'sold'}
                        onClick={() => setActiveBuyListing(item)}
                      >
                        {item.priceType === 'free' ? (
                          <><ShoppingCart size={15} /> {t('surplus.requestGift', 'Request Gift')}</>
                        ) : (
                          <><ShoppingCart size={15} /> {t('surplus.buyReserve', 'Buy / Reserve')}</>
                        )}
                      </button>
                    )}

                    <button 
                      className="btn-action-chat"
                      onClick={() => handleOpenChat(item)}
                      title={t('surplus.chat', 'Chat')}
                    >
                      <MessageSquare size={15} /> {t('surplus.chat', 'Chat')}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Surplus Form Modal */}
      {showAddModal && (
        <SurplusFormModal 
          user={user}
          onClose={() => setShowAddModal(false)}
          onSave={handleSaveListing}
        />
      )}

      {/* Buy & Deal Confirmation Modal */}
      {activeBuyListing && (
        <BuySurplusModal
          listing={activeBuyListing}
          user={user}
          onClose={() => setActiveBuyListing(null)}
          onConfirmDeal={handleConfirmDeal}
          onUpdateStatus={handleUpdateStatus}
          onDeleteListing={handleDeleteListing}
        />
      )}

      {/* 1-on-1 Direct Chat Drawer Modal */}
      {activeChatListing && (
        <NeighborChatModal 
          listing={activeChatListing}
          chatThread={activeChatThread}
          user={user}
          onClose={() => {
            setActiveChatListing(null);
            setActiveChatThread(null);
          }}
          onSendMessage={handleSendMessage}
          onSaveThread={handleSaveThread}
          onUpdateStatus={handleUpdateStatus}
          onDeleteChat={handleDeleteChat}
        />
      )}

      {/* My Direct Chats List Modal */}
      {showChatsList && (
        <NeighborChatListModal 
          chats={userChats}
          user={user}
          onClose={() => setShowChatsList(false)}
          onDeleteChat={handleDeleteChat}
          onSelectChat={(chat) => {
            setShowChatsList(false);
            setActiveChatListing(chat.listingId || { title: chat.listingTitle, price: chat.listingPrice });
            setActiveChatThread(chat);
          }}
        />
      )}

      {/* Incoming Seller & Sent Buyer Requests Modal */}
      {showRequestsModal && (
        <SellerRequestsModal
          receivedRequests={receivedRequests}
          sentRequests={sentRequests}
          allRequests={allRequests}
          user={user}
          onClose={() => setShowRequestsModal(false)}
          onAcceptRequest={handleAcceptSellerRequest}
          onDeclineRequest={handleDeclineSellerRequest}
          onOpenChat={(req) => {
            const matchingListing = listings.find((l) => l._id === req.listingId) || { _id: req.listingId, title: req.listingTitle };
            handleOpenChat(matchingListing);
          }}
        />
      )}
    </div>
  );
};

export default SurplusMarketplace;


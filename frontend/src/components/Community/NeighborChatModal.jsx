import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  MapPin, 
  CheckCheck, 
  ShieldCheck,
  Trash2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getSurplusChatById } from '../../services/plantService';

const QUICK_PROMPTS = [
  "Hi! Is this surplus item still available for pickup today?",
  "Can I trade this with my homegrown organic mint leaves?",
  "What time works best for pickup in your neighborhood?",
  "Could you share your approximate landmark / gate location?"
];

const NeighborChatModal = ({ listing, chatThread, user, onClose, onSendMessage, onSaveThread, onUpdateStatus, onDeleteChat }) => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const currentUserId = user?._id || user?.id || 'user_1';
  const isSeller = currentUserId.toString() === (listing?.userId?._id || listing?.userId || listing?.sellerId)?.toString();
  const otherPartyName = isSeller 
    ? (chatThread?.buyerId?.name || 'Interested Neighbor') 
    : (listing?.sellerName || listing?.userId?.name || 'Seller Neighbor');
  const otherPartyAvatar = isSeller 
    ? (chatThread?.buyerId?.profilePicture || '') 
    : (listing?.sellerAvatar || listing?.userId?.profilePicture || '');

  useEffect(() => {
    if (chatThread && chatThread.messages && chatThread.messages.length > 0) {
      setMessages(chatThread.messages);
    } else {
      const initMsg = {
        _id: 'msg_init_' + Date.now(),
        senderId: currentUserId,
        senderName: user?.name || 'You',
        text: `Hi ${otherPartyName}! I'm interested in your surplus listing "${listing?.title || 'Harvest'}". Is it available?`,
        createdAt: new Date().toISOString(),
      };
      setMessages([initMsg]);
    }

    // ⚡ Real-Time Live Polling for buyer & seller 1-on-1 chat
    if (chatThread && chatThread._id && !chatThread._id.toString().startsWith('demo_chat_')) {
      const pollInterval = setInterval(async () => {
        try {
          const latestChat = await getSurplusChatById(chatThread._id);
          if (latestChat && Array.isArray(latestChat.messages)) {
            setMessages((prev) => {
              if (latestChat.messages.length !== prev.length || 
                  (latestChat.messages.length > 0 && prev.length > 0 && 
                   latestChat.messages[latestChat.messages.length - 1]._id !== prev[prev.length - 1]._id)) {
                if (onSaveThread) {
                  onSaveThread(latestChat);
                }
                return latestChat.messages;
              }
              return prev;
            });
          }
        } catch (e) {
          // Graceful fallback
        }
      }, 2500);

      return () => clearInterval(pollInterval);
    }
  }, [chatThread, listing, user, otherPartyName, currentUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const updateThreadMessages = (newMsgs) => {
    setMessages(newMsgs);
    if (onSaveThread && chatThread) {
      const last = newMsgs[newMsgs.length - 1];
      onSaveThread({
        ...chatThread,
        messages: newMsgs,
        lastMessage: last ? last.text : '',
        lastMessageAt: last ? last.createdAt : new Date().toISOString(),
      });
    }
  };

  const handleSend = (textToSend = null) => {
    const text = textToSend || inputText;
    if (!text.trim() || sending) return;

    const newMsg = {
      _id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      senderId: currentUserId,
      senderName: user?.name || 'You',
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };

    const nextMsgs = [...messages, newMsg];
    updateThreadMessages(nextMsgs);
    setInputText('');

    if (onSendMessage) {
      onSendMessage(text.trim());
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleStatusChange = (newStatus) => {
    if (onUpdateStatus && listing) {
      onUpdateStatus(listing._id || listing.id, newStatus);
    }
  };

  return (
    <div className="neighbor-chat-overlay" onClick={onClose}>
      <div className="neighbor-chat-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="chat-drawer-header">
          <div className="chat-partner-info">
            <div className="partner-avatar">
              {otherPartyAvatar ? (
                <img src={otherPartyAvatar} alt={otherPartyName} />
              ) : (
                <div className="avatar-placeholder">{otherPartyName.charAt(0).toUpperCase()}</div>
              )}
              <span className="online-dot"></span>
            </div>
            <div>
              <div className="partner-name-row">
                <h4>{otherPartyName}</h4>
                <span className="neighborhood-badge">
                  <MapPin size={12} /> {listing?.location?.neighborhood || 'Green Park'}
                </span>
              </div>
              <span className="chat-subtitle">
                <ShieldCheck size={13} style={{ color: '#16a34a' }} /> Direct 1-on-1 Neighbor Chat
              </span>
            </div>
          </div>
          <div className="chat-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {onDeleteChat && chatThread && (
              <button 
                className="chat-delete-header-btn" 
                onClick={() => {
                  onDeleteChat(chatThread._id);
                  onClose();
                }} 
                title={t('surplus.deleteChat', 'Delete Chat Conversation')}
              >
                <Trash2 size={16} />
              </button>
            )}
            <button className="chat-close-btn" onClick={onClose} aria-label="Close chat">
              <X size={18} />
            </button>
          </div>
        </div>


        {/* Listing Banner Card */}
        {listing && (
          <div className="chat-listing-banner">
            <img 
              src={listing.imageUrl || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=300&q=80'} 
              alt={listing.title} 
              className="listing-thumb" 
            />
            <div className="listing-details">
              <div className="listing-title-row">
                <span className="item-title">{listing.title}</span>
                <span className={`status-pill ${listing.status}`}>
                  {listing.status === 'available' ? t('surplus.statusAvailable', 'Available') : listing.status === 'reserved' ? t('surplus.statusReserved', 'Reserved') : t('surplus.statusSold', 'Sold')}
                </span>
              </div>
              <div className="listing-meta">
                <span className="price-tag">
                  {listing.priceType === 'free' ? t('surplus.freeGiftBadge', 'FREE') : listing.priceType === 'swap' ? t('surplus.swapBadge', 'Swap') : `₹${listing.price} / ${listing.unit}`}
                </span>
                <span className="qty-tag">{listing.quantity}</span>
              </div>
            </div>
            {isSeller && (
              <div className="seller-quick-actions">
                {listing.status === 'available' ? (
                  <button 
                    className="btn-status reserve-btn"
                    onClick={() => handleStatusChange('reserved')}
                    title={t('surplus.markReserved', 'Mark as Reserved for this neighbor')}
                  >
                    {t('surplus.markReserved', 'Hold / Reserve')}
                  </button>
                ) : listing.status === 'reserved' ? (
                  <button 
                    className="btn-status sold-btn"
                    onClick={() => handleStatusChange('sold')}
                  >
                    {t('surplus.markSold', 'Mark Sold')}
                  </button>
                ) : (
                  <button 
                    className="btn-status avail-btn"
                    onClick={() => handleStatusChange('available')}
                  >
                    {t('surplus.markAvailable', 'Make Available')}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Quick Suggestion Chips */}
        <div className="chat-quick-suggestions">
          {QUICK_PROMPTS.map((prompt, idx) => (
            <button 
              key={idx} 
              className="suggestion-chip"
              onClick={() => handleSend(prompt)}
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat Messages Body */}
        <div className="chat-messages-container">
          <div className="security-notice">
            <ShieldCheck size={14} /> {t('surplus.chatNotice', 'Private 1-on-1 chat with your local neighbor for surplus pickup arrangements.')}
          </div>

          {messages.map((msg, index) => {
            const isMe = (msg.senderId?.toString() === currentUserId?.toString()) || msg.senderName === 'You' || msg.senderName === user?.name;
            const timeStr = msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now';

            return (
              <div key={msg._id || index} className={`message-bubble-wrapper ${isMe ? 'outgoing' : 'incoming'}`}>
                {!isMe && (
                  <div className="msg-avatar">
                    {otherPartyAvatar ? (
                      <img src={otherPartyAvatar} alt={otherPartyName} />
                    ) : (
                      <span>{otherPartyName.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                )}
                <div className="message-bubble" style={{ maxWidth: msg.type === 'buy_request' || msg.dealReceipt ? '340px' : '78%' }}>
                  {msg.type === 'buy_request' || msg.dealReceipt ? (
                    <div className="chat-deal-card" style={{ padding: '0.2rem 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700, color: '#1e293b', fontSize: '0.86rem', marginBottom: '0.4rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.35rem' }}>
                        <span>🛒 {t('surplus.requestBuyTitle', 'Buy Harvest Request')}</span>
                      </div>
                      <div style={{ fontSize: '0.79rem', color: '#334155', lineHeight: 1.5 }}>
                        <div><strong>{t('surplus.itemLabel', 'Item:')}</strong> {msg.dealReceipt?.listingTitle || listing?.title}</div>
                        <div><strong>{t('surplus.qtyRequestedLabel', 'Quantity:')}</strong> {msg.dealReceipt?.quantity || 'Full Portion'}</div>
                        <div><strong>{t('surplus.totalPriceLabel', 'Price:')}</strong> <span style={{ color: '#16a34a', fontWeight: 700 }}>{msg.dealReceipt?.price}</span></div>
                        <div><strong>{t('surplus.pickupWindowLabel', 'Pickup:')}</strong> {msg.dealReceipt?.pickupTime}</div>
                        {msg.dealReceipt?.notes && (
                          <div style={{ fontStyle: 'italic', background: 'rgba(255,255,255,0.8)', padding: '0.3rem 0.45rem', borderRadius: '6px', marginTop: '0.35rem', border: '1px solid #cbd5e1' }}>
                            "{msg.dealReceipt.notes}"
                          </div>
                        )}
                      </div>

                      {/* Status / Action Buttons */}
                      <div style={{ marginTop: '0.65rem' }}>
                        {listing?.status === 'sold' || msg.dealReceipt?.status === 'accepted' ? (
                          <div style={{ background: '#dcfce7', color: '#15803d', padding: '0.45rem 0.6rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <CheckCheck size={16} /> {t('surplus.dealAcceptedSold', 'Deal Accepted! Item Marked as Sold & Removed from Marketplace')}
                          </div>
                        ) : msg.dealReceipt?.status === 'declined' ? (
                          <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.45rem 0.6rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <X size={16} /> {t('surplus.dealDeclined', 'Request Declined by Seller')}
                          </div>
                        ) : isSeller ? (
                          /* Interactive Action Buttons for Seller */
                          <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem' }}>
                            <button
                              type="button"
                              style={{
                                flex: 1,
                                background: '#2d6a4f',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '0.5rem 0.65rem',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.3rem',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                              }}
                              onClick={() => {
                                if (msg.dealReceipt) msg.dealReceipt.status = 'accepted';
                                handleStatusChange('sold');
                                handleSend(t('surplus.msgAccepted', '✅ I have accepted your request! The item is now marked as sold.'));
                              }}
                            >
                              <CheckCheck size={14} /> {t('surplus.acceptMarkSold', 'Accept Request & Mark Sold')}
                            </button>

                            <button
                              type="button"
                              style={{
                                background: '#ffffff',
                                color: '#dc2626',
                                border: '1px solid #fca5a5',
                                borderRadius: '8px',
                                padding: '0.5rem 0.6rem',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.3rem'
                              }}
                              onClick={() => {
                                if (msg.dealReceipt) msg.dealReceipt.status = 'declined';
                                handleStatusChange('available');
                                handleSend(t('surplus.msgDeclined', '❌ Sorry, I cannot accept this request at this time.'));
                              }}
                            >
                              <X size={14} /> {t('surplus.decline', 'Decline')}
                            </button>
                          </div>
                        ) : (
                          /* Waiting Box for Buyer */
                          <div style={{ background: '#f0f9ff', color: '#0369a1', padding: '0.45rem 0.65rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 600, marginTop: '0.4rem', border: '1px solid #bae6fd' }}>
                            ⏳ Request sent to seller. Waiting for seller approval...
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bubble-content">{msg.text}</div>
                  )}
                  <div className="bubble-footer">
                    <span className="msg-time">{timeStr}</span>
                    {isMe && <CheckCheck size={14} className="read-icon" />}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Bar */}
        <div className="chat-input-bar">
          <textarea
            rows="1"
            placeholder={t('surplus.inputPlaceholder', 'Type private message to neighbor...')}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          <button 
            className="send-msg-btn"
            disabled={!inputText.trim()}
            onClick={() => handleSend()}
            type="button"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NeighborChatModal;

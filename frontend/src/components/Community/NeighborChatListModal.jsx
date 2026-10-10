import React from 'react';
import { X, MessageSquare, ShoppingBag, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const NeighborChatListModal = ({ chats = [], user, onSelectChat, onDeleteChat, onClose }) => {
  const { t } = useTranslation();

  return (
    <div className="surplus-modal-overlay" onClick={onClose}>
      <div className="surplus-modal-card chats-list-card" onClick={(e) => e.stopPropagation()}>
        <div className="surplus-modal-header">
          <div className="modal-title-group">
            <span className="modal-icon">
              <MessageSquare size={22} style={{ color: '#2d6a4f' }} />
            </span>
            <div>
              <h3>{t('surplus.chatsTitle', 'Your Direct Neighbor Chats')}</h3>
              <p>{t('surplus.chatsSub', 'Private 1-on-1 conversations for buying, selling, or trading surplus harvest')}</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="chats-list-container">
          {chats.length === 0 ? (
            <div className="empty-chats">
              <MessageSquare className="empty-chat-icon" size={42} />
              <h4>{t('surplus.noChats', 'No active neighbor chats yet')}</h4>
              <p>{t('surplus.noChatsSub', 'Browse the Surplus Marketplace and click "Chat with Seller" to start a direct 1-on-1 conversation with a neighbor!')}</p>
            </div>
          ) : (
            chats.map((chat) => {
              const currentUserId = user?._id || user?.id;
              const isSeller = chat.sellerId?._id?.toString() === currentUserId?.toString();
              const otherUser = isSeller ? chat.buyerId : chat.sellerId;
              const otherName = otherUser?.name || 'Neighbor';
              const avatar = otherUser?.profilePicture || '';
              const listing = chat.listingId || {};
              const timeStr = chat.lastMessageAt ? new Date(chat.lastMessageAt).toLocaleDateString() : '';

              return (
                <div 
                  key={chat._id} 
                  className="chat-thread-item"
                  onClick={() => onSelectChat(chat)}
                >
                  <div className="thread-avatar">
                    {avatar ? <img src={avatar} alt={otherName} /> : <span>{otherName.charAt(0).toUpperCase()}</span>}
                  </div>
                  <div className="thread-content">
                    <div className="thread-header-row">
                      <span className="thread-partner">{otherName}</span>
                      <span className="thread-time">{timeStr}</span>
                    </div>
                    <div className="thread-listing-tag">
                      <ShoppingBag size={13} /> {chat.listingTitle || listing.title || 'Surplus Item'} ({chat.listingPrice || 'Free/Sale'})
                    </div>
                    <p className="thread-last-msg">{chat.lastMessage || 'Click to view conversation...'}</p>
                  </div>

                  {onDeleteChat && (
                    <button
                      className="btn-delete-chat-thread"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteChat(chat._id);
                      }}
                      title="Delete conversation"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default NeighborChatListModal;


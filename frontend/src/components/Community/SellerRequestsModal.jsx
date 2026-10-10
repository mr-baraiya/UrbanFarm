import React, { useState } from 'react';
import { 
  X, 
  Inbox, 
  Send,
  CheckCheck, 
  Clock, 
  User, 
  MessageSquare,
  ShieldCheck,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  ArrowDownLeft,
  Users
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const SellerRequestsModal = ({ 
  receivedRequests = [], 
  sentRequests = [],
  allRequests = [],
  user, 
  onClose, 
  onAcceptRequest, 
  onDeclineRequest,
  onOpenChat
}) => {
  const { t } = useTranslation();
  const currentUserId = (user?._id || user?.id)?.toString();
  const currentUserName = (user?.name || '').toString().trim();

  // Filter mode: 'seller' (Incoming for Seller), 'buyer' (Sent by Buyer), or 'all' (All Platform Requests)
  const [filterMode, setFilterMode] = useState(
    receivedRequests.length > 0 ? 'seller' : sentRequests.length > 0 ? 'buyer' : 'all'
  );

  // Collect all requests for 'all' mode
  const allRequestsList = allRequests.length > 0 ? allRequests : [...receivedRequests, ...sentRequests];
  const uniqueAllRequests = Array.from(
    new Map(allRequestsList.map((req) => [req.dealId || Math.random(), req])).values()
  );

  const displayList = 
    filterMode === 'seller' 
      ? receivedRequests 
      : filterMode === 'buyer' 
      ? sentRequests 
      : uniqueAllRequests;

  return (
    <div className="surplus-modal-overlay" onClick={onClose}>
      <div 
        className="surplus-modal-card seller-requests-modal" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '680px', width: '92vw', maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Header */}
        <div className="surplus-modal-header" style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
          <div className="modal-title-group">
            <span className="modal-icon" style={{ background: '#ecfdf5', color: '#059669', padding: '0.55rem', borderRadius: '12px', display: 'inline-flex' }}>
              <Inbox size={22} />
            </span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                Seller Requests Box ({displayList.length})
              </h3>
              <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                Review buyer requests sent to seller. Sellers can accept to mark sold or reject to keep item available.
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* View Mode Filter Tabs */}
        <div style={{ display: 'flex', background: '#e2e8f0', padding: '0.3rem', gap: '0.3rem', borderBottom: '1px solid #cbd5e1' }}>
          <button
            type="button"
            style={{
              flex: 1,
              padding: '0.55rem 0.5rem',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              background: filterMode === 'seller' ? '#ffffff' : 'transparent',
              color: filterMode === 'seller' ? '#166534' : '#475569',
              boxShadow: filterMode === 'seller' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none'
            }}
            onClick={() => setFilterMode('seller')}
          >
            <ArrowDownLeft size={15} style={{ color: filterMode === 'seller' ? '#16a34a' : '#64748b' }} />
            Incoming for Seller ({receivedRequests.length})
          </button>

          <button
            type="button"
            style={{
              flex: 1,
              padding: '0.55rem 0.5rem',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              background: filterMode === 'buyer' ? '#ffffff' : 'transparent',
              color: filterMode === 'buyer' ? '#0284c7' : '#475569',
              boxShadow: filterMode === 'buyer' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none'
            }}
            onClick={() => setFilterMode('buyer')}
          >
            <ArrowUpRight size={15} style={{ color: filterMode === 'buyer' ? '#0284c7' : '#64748b' }} />
            Sent by Buyer ({sentRequests.length})
          </button>

          <button
            type="button"
            style={{
              padding: '0.55rem 0.75rem',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              background: filterMode === 'all' ? '#ffffff' : 'transparent',
              color: filterMode === 'all' ? '#059669' : '#475569',
              boxShadow: filterMode === 'all' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none'
            }}
            onClick={() => setFilterMode('all')}
          >
            <Users size={15} style={{ color: filterMode === 'all' ? '#059669' : '#64748b' }} />
            All Requests ({uniqueAllRequests.length})
          </button>
        </div>

        {/* Requests Body List */}
        <div style={{ padding: '1rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {displayList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#64748b' }}>
              <Inbox size={42} style={{ color: '#cbd5e1', marginBottom: '0.75rem' }} />
              <h4 style={{ margin: '0 0 0.35rem 0', color: '#334155', fontWeight: 700 }}>
                {filterMode === 'seller'
                  ? 'No incoming buyer requests for your listings'
                  : filterMode === 'buyer'
                  ? 'No sent buy requests yet'
                  : 'No buy requests recorded'}
              </h4>
              <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.82rem' }}>
                {filterMode === 'seller' 
                  ? 'When customers send buy requests for items you posted, they appear here.'
                  : 'Requests you send to sellers appear under the "Sent by Buyer" tab.'}
              </p>
            </div>
          ) : (
            displayList.map((req, idx) => {
              const status = req.status || 'pending_approval';
              const isAccepted = status === 'accepted';
              const isDeclined = status === 'declined';

              // Check if current user is seller for this specific request
              const reqSellerName = (req.sellerName || req.listingItem?.sellerName || '').toString().trim();
              const reqSellerId = (req.sellerId || req.listingItem?.userId?._id || req.listingItem?.userId || req.listingItem?.sellerId)?.toString();

              const isCurrentSeller = 
                (reqSellerName && currentUserName && reqSellerName.toLowerCase() === currentUserName.toLowerCase()) ||
                (reqSellerId && currentUserId && reqSellerId === currentUserId);

              return (
                <div 
                  key={req.dealId || idx} 
                  className="request-item-card"
                  style={{ 
                    background: '#ffffff', 
                    borderRadius: '14px', 
                    border: '1px solid #cbd5e1', 
                    boxShadow: '0 3px 10px rgba(0,0,0,0.04)',
                    padding: '0.95rem 1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.65rem'
                  }}
                >
                  {/* Top Bar: Request ID & Status Tag */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed #e2e8f0', paddingBottom: '0.45rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ background: '#f1f5f9', color: '#1e293b', fontSize: '0.78rem', fontWeight: 700, padding: '0.2rem 0.55rem', borderRadius: '6px', fontFamily: 'monospace' }}>
                        ID #{req.dealId || 'REQ-10001'}
                      </span>
                      <span style={{ fontSize: '0.73rem', color: '#64748b' }}>
                        • {new Date(req.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <span 
                      style={{ 
                        fontSize: '0.74rem', 
                        fontWeight: 700, 
                        padding: '0.25rem 0.65rem', 
                        borderRadius: '20px',
                        background: isAccepted ? '#dcfce7' : isDeclined ? '#fee2e2' : isCurrentSeller ? '#fef3c7' : '#e0f2fe',
                        color: isAccepted ? '#15803d' : isDeclined ? '#b91c1c' : isCurrentSeller ? '#b45309' : '#0284c7'
                      }}
                    >
                      {isAccepted 
                        ? 'ACCEPTED (VANISHED FROM WEBSITE)' 
                        : isDeclined 
                        ? 'REJECTED (KEPT ON WEBSITE)' 
                        : isCurrentSeller 
                        ? 'INCOMING REQUEST (ACTION REQUIRED)'
                        : 'SENT TO SELLER (WAITING FOR APPROVAL)'}
                    </span>
                  </div>

                  {/* Details Grid */}
                  <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                    {req.listingImage && (
                      <img 
                        src={req.listingImage} 
                        alt={req.listingTitle} 
                        style={{ width: '64px', height: '64px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0, border: '1px solid #cbd5e1' }}
                      />
                    )}
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 0.3rem 0', fontSize: '0.98rem', fontWeight: 700, color: '#0f172a' }}>
                        {req.listingTitle}
                      </h4>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem 0.65rem', fontSize: '0.8rem', color: '#334155' }}>
                        <div><User size={13} style={{ display: 'inline', marginRight: '3px', color: '#16a34a' }} /> <strong>Customer / Buyer:</strong> {req.buyerName}</div>
                        <div><User size={13} style={{ display: 'inline', marginRight: '3px', color: '#0284c7' }} /> <strong>Seller:</strong> {req.sellerName || 'Seller'}</div>
                        <div><strong>Price:</strong> <span style={{ color: '#16a34a', fontWeight: 700 }}>{req.price}</span></div>
                        <div><strong>Qty:</strong> {req.quantity}</div>
                        <div><Clock size={13} style={{ display: 'inline', marginRight: '3px', color: '#0284c7' }} /> <strong>Pickup:</strong> {req.pickupTime}</div>
                      </div>

                      {req.notes && (
                        <div style={{ marginTop: '0.45rem', fontSize: '0.78rem', color: '#334155', fontStyle: 'italic', background: '#f8fafc', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                          "{req.notes}"
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Seller / Buyer Action Buttons */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.2rem', paddingTop: '0.65rem', borderTop: '1px solid #f1f5f9' }}>
                    {isAccepted ? (
                      <div style={{ flex: 1, background: '#dcfce7', color: '#15803d', padding: '0.55rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                        <CheckCheck size={18} /> Accepted! Item marked as Sold & vanished from website.
                      </div>
                    ) : isDeclined ? (
                      <div style={{ flex: 1, background: '#fee2e2', color: '#b91c1c', padding: '0.55rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                        <XCircle size={18} /> Rejected! Request declined. Item stays available on website.
                      </div>
                    ) : isCurrentSeller ? (
                      <>
                        <button
                          type="button"
                          style={{
                            flex: 1,
                            background: '#2d6a4f',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '0.6rem 0.75rem',
                            fontSize: '0.84rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.4rem',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.12)'
                          }}
                          onClick={() => {
                            onAcceptRequest(req);
                            onClose();
                          }}
                        >
                          <CheckCheck size={16} /> Accept Request & Mark Sold
                        </button>

                        <button
                          type="button"
                          style={{
                            background: '#ffffff',
                            color: '#dc2626',
                            border: '1px solid #fca5a5',
                            borderRadius: '8px',
                            padding: '0.6rem 0.75rem',
                            fontSize: '0.84rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem'
                          }}
                          onClick={() => {
                            onDeclineRequest(req);
                          }}
                        >
                          <XCircle size={16} /> Reject Request
                        </button>

                        {onOpenChat && (
                          <button
                            type="button"
                            style={{
                              background: '#f1f5f9',
                              color: '#334155',
                              border: '1px solid #cbd5e1',
                              borderRadius: '8px',
                              padding: '0.6rem 0.75rem',
                              fontSize: '0.82rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.35rem'
                            }}
                            onClick={() => {
                              onClose();
                              onOpenChat(req);
                            }}
                          >
                            <MessageSquare size={15} /> Chat
                          </button>
                        )}
                      </>
                    ) : (
                      /* BUYER VIEW: Waiting for seller approval */
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                        <div style={{ fontSize: '0.82rem', color: '#0369a1', fontWeight: 600, background: '#f0f9ff', padding: '0.45rem 0.75rem', borderRadius: '8px', flex: 1, border: '1px solid #bae6fd' }}>
                          ⏳ Request sent to seller ({req.sellerName || 'Seller'}). Waiting for seller to accept or reject.
                        </div>
                        {onOpenChat && (
                          <button
                            type="button"
                            style={{
                              background: '#0284c7',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '0.55rem 0.85rem',
                              fontSize: '0.82rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              whiteSpace: 'nowrap'
                            }}
                            onClick={() => {
                              onClose();
                              onOpenChat(req);
                            }}
                          >
                            <MessageSquare size={15} /> Chat with Seller
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div style={{ padding: '0.85rem 1.25rem', borderTop: '1px solid #e2e8f0', background: '#f8fafc', borderBottomLeftRadius: '14px', borderBottomRightRadius: '14px', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn-secondary" onClick={onClose} style={{ minWidth: '95px' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SellerRequestsModal;

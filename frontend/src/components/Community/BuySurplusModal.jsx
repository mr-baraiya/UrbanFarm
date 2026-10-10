import React, { useState } from 'react';
import { 
  X, 
  ShoppingBag, 
  MapPin, 
  Check, 
  Clock, 
  Trash2, 
  CheckCheck,
  Settings,
  ShieldCheck,
  Gift,
  RefreshCw,
  ShoppingCart,
  Send
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const BuySurplusModal = ({ 
  listing, 
  user, 
  onClose, 
  onConfirmDeal, 
  onUpdateStatus, 
  onAcceptRequest,
  onDeclineRequest,
  onDeleteListing 
}) => {
  const { t } = useTranslation();
  const [selectedQty, setSelectedQty] = useState('Full Quantity (' + (listing?.quantity || '1 kg') + ')');
  const [paymentMethod, setPaymentMethod] = useState(
    listing?.priceType === 'free' ? 'free' : listing?.priceType === 'swap' ? 'swap' : 'cash'
  );
  const [pickupTime, setPickupTime] = useState('Today Evening (4:00 PM - 7:00 PM)');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [dealSuccess, setDealSuccess] = useState(null);

  if (!listing) return null;

  const currentUserId = (user?._id || user?.id || '')?.toString();
  const currentUserName = (user?.name || '')?.toString().trim().toLowerCase();
  const currentUserEmail = (user?.email || '')?.toString().trim().toLowerCase();

  const listingOwnerId = (listing.userId?._id || listing.userId || listing.sellerId || '')?.toString();
  const listingOwnerName = (listing.sellerName || listing.userId?.name || '')?.toString().trim().toLowerCase();
  const listingOwnerEmail = (listing.userId?.email || listing.sellerEmail || '')?.toString().trim().toLowerCase();

  const isOwner = Boolean(
    (currentUserId && listingOwnerId && currentUserId === listingOwnerId) ||
    (currentUserName && listingOwnerName && currentUserName === listingOwnerName) ||
    (currentUserEmail && listingOwnerEmail && currentUserEmail === listingOwnerEmail) ||
    (listing._id && typeof listing._id === 'string' && listing._id.startsWith('surplus_'))
  );

  const isFree = listing.priceType === 'free';
  const isSwap = listing.priceType === 'swap';
  const totalPrice = isFree || isSwap ? 0 : listing.price || 0;

  const handleConfirm = (e) => {
    e.preventDefault();
    setSubmitting(true);

    const dealReceipt = {
      dealId: 'REQ-' + Math.floor(100000 + Math.random() * 900000),
      listingId: listing._id,
      listingTitle: listing.title,
      listingImage: listing.imageUrl,
      sellerName: listing.sellerName || listing.userId?.name || 'Seller',
      sellerId: (listing.userId?._id || listing.userId || listing.sellerId)?.toString(),
      buyerName: user?.name || 'Neighbor Buyer',
      buyerId: (user?._id || user?.id)?.toString(),
      quantity: selectedQty,
      price: totalPrice > 0 ? `₹${totalPrice}` : isFree ? 'FREE GIFT' : 'HARVEST SWAP',
      paymentMethod,
      pickupTime,
      notes,
      neighborhood: listing.location?.neighborhood || 'Green Park',
      createdAt: new Date().toISOString(),
      status: 'pending_approval',
    };

    setTimeout(() => {
      setSubmitting(false);
      setDealSuccess(dealReceipt);

      if (onConfirmDeal) {
        onConfirmDeal(dealReceipt);
      }
    }, 600);
  };

  const handleStatusChange = (newStatus) => {
    if (onUpdateStatus) {
      onUpdateStatus(listing._id, newStatus);
    }
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this listing from the marketplace?')) {
      if (onDeleteListing) {
        onDeleteListing(listing._id);
      }
      onClose();
    }
  };

  return (
    <div className="surplus-modal-overlay" onClick={onClose}>
      <div className="surplus-modal-card buy-deal-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="surplus-modal-header">
          <div className="modal-title-group">
            <span className="modal-icon">
              {isOwner ? <Settings size={22} style={{ color: '#2d6a4f' }} /> : isFree ? <Gift size={22} style={{ color: '#10b981' }} /> : isSwap ? <RefreshCw size={22} style={{ color: '#8b5cf6' }} /> : <ShoppingCart size={22} style={{ color: '#2d6a4f' }} />}
            </span>
            <div>
              <h3>
                {isOwner 
                  ? t('surplus.manageTitle', 'Manage Your Surplus Harvest') 
                  : isFree 
                  ? t('surplus.requestFreeTitle', 'Request Free Gift') 
                  : isSwap 
                  ? t('surplus.offerSwapTitle', 'Offer Harvest Swap') 
                  : t('surplus.requestBuyTitle', 'Request Buy Harvest')}
              </h3>
              <p>
                {isOwner 
                  ? t('surplus.manageSub', 'Review pending buyer requests and manage listing status') 
                  : t('surplus.sendRequestSub', 'Send buy request to seller for approval')}
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {isOwner ? (
          /* OWNER MANAGEMENT VIEW */
          <div className="owner-manage-body">
            <div className="modal-item-summary-card">
              <img src={listing.imageUrl} alt={listing.title} className="summary-thumb" />
              <div className="summary-info">
                <span className="seller-by">{t('surplus.yourListing', 'Your Listing')}</span>
                <h4>{listing.title}</h4>
                <div className="summary-tags">
                  <span className="price-tag-badge">
                    {isFree ? t('surplus.freeGiftBadge', 'FREE GIFT') : isSwap ? t('surplus.swapBadge', 'SWAP') : `₹${listing.price} / ${listing.unit}`}
                  </span>
                  <span className={`status-pill ${listing.status}`}>
                    {listing.status === 'available' ? t('surplus.statusAvailable', 'Available') : listing.status === 'requested' ? t('surplus.statusRequested', 'Request Pending') : listing.status === 'reserved' ? t('surplus.statusReserved', 'Reserved') : t('surplus.statusSold', 'Sold')}
                  </span>
                </div>
              </div>
            </div>

            {/* Pending Buyer Requests Section */}
            {(() => {
              const activePendingReqs = (listing.pendingRequests || []).filter(r => r.status === 'pending_approval' || !r.status);
              if (activePendingReqs.length === 0) return null;
              return (
                <div className="manage-requests-section" style={{ background: '#fffbe5', padding: '1rem', borderRadius: '14px', border: '1px solid #ffe58f' }}>
                  <h4 style={{ margin: '0 0 0.6rem 0', color: '#b45309', fontSize: '0.9rem', fontWeight: 700 }}>
                    📥 {t('surplus.pendingRequests', 'Pending Buyer Requests')} ({activePendingReqs.length})
                  </h4>
                  {activePendingReqs.map((req, idx) => (
                    <div key={idx} className="pending-request-card" style={{ background: '#ffffff', padding: '0.85rem', borderRadius: '10px', marginBottom: '0.6rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 5px rgba(0,0,0,0.04)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', fontWeight: '700', color: '#1e293b' }}>
                        <span>{req.buyerName}</span>
                        <span style={{ color: '#2d6a4f' }}>{req.price}</span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', margin: '0.25rem 0' }}>
                        Qty: {req.quantity} • Pickup: {req.pickupTime}
                      </div>
                      {req.notes && (
                        <div style={{ fontSize: '0.76rem', color: '#475569', fontStyle: 'italic', marginBottom: '0.5rem', background: '#f8fafc', padding: '0.35rem 0.5rem', borderRadius: '6px' }}>
                          "{req.notes}"
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <button
                          type="button"
                          className="btn-status-option active-sold"
                          style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem' }}
                          onClick={() => {
                            if (onAcceptRequest) {
                              onAcceptRequest(req);
                            } else {
                              handleStatusChange('sold');
                            }
                            onClose();
                          }}
                        >
                          <CheckCheck size={14} /> {t('surplus.acceptMarkSold', 'Accept & Mark Sold')}
                        </button>
                        <button
                          type="button"
                          className="btn-status-option"
                          style={{ padding: '0.5rem', fontSize: '0.8rem', color: '#dc2626', borderColor: '#fca5a5' }}
                          onClick={() => {
                            if (onDeclineRequest) {
                              onDeclineRequest(req);
                            } else {
                              handleStatusChange('available');
                            }
                            onClose();
                          }}
                        >
                          <X size={14} /> {t('surplus.decline', 'Decline')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}

            <div className="manage-status-section">
              <label className="manage-label">{t('surplus.updateAvailability', 'Update Harvest Availability')}</label>
              <p className="manage-sub">{t('surplus.updateAvailabilitySub', 'Once accepted or marked as "Sold", this item will be removed from the active market feed.')}</p>
              
              <div className="status-buttons-row">
                <button 
                  type="button"
                  className={`btn-status-option ${listing.status === 'available' ? 'active-avail' : ''}`}
                  onClick={() => handleStatusChange('available')}
                >
                  <Check size={14} /> {t('surplus.markAvailable', 'Mark as Available')}
                </button>
                <button 
                  type="button"
                  className={`btn-status-option ${listing.status === 'reserved' ? 'active-reserve' : ''}`}
                  onClick={() => handleStatusChange('reserved')}
                >
                  <Clock size={14} /> {t('surplus.markReserved', 'Mark as Reserved')}
                </button>
                <button 
                  type="button"
                  className={`btn-status-option ${listing.status === 'sold' ? 'active-sold' : ''}`}
                  onClick={() => handleStatusChange('sold')}
                >
                  <CheckCheck size={14} /> {t('surplus.markSold', 'Accept & Mark Sold')}
                </button>
              </div>
            </div>

            <div className="danger-zone-block">
              <button type="button" className="btn-delete-listing" onClick={handleDelete}>
                <Trash2 size={16} /> {t('surplus.deleteListing', 'Delete Listing Permanently')}
              </button>
            </div>

            <div className="modal-actions-footer">
              <button type="button" className="btn-secondary full-btn" onClick={onClose}>
                {t('surplus.done', 'Done')}
              </button>
            </div>
          </div>
        ) : dealSuccess ? (
          /* DEAL SUCCESS VIEW */
          <div className="deal-success-container">
            <div className="success-icon-badge" style={{ background: '#e0f2fe', color: '#0284c7' }}>
              <Send size={28} />
            </div>
            <h2>{t('surplus.requestSentTitle', 'Request Sent to Seller!')}</h2>
            <p className="success-sub">
              {t('surplus.requestSentSub', 'Your request has been sent to owner. When the owner accepts your request, the item will be counted as sold!')}
            </p>

            <div className="deal-receipt-card">
              <div className="receipt-header">
                <span>REQUEST ID #{dealSuccess.dealId}</span>
                <span className="receipt-status-tag" style={{ color: '#0284c7' }}>{t('surplus.pendingOwnerApproval', 'PENDING OWNER APPROVAL')}</span>
              </div>
              <div className="receipt-body">
                <div className="receipt-row">
                  <span>{t('surplus.itemLabel', 'Item:')}</span>
                  <strong>{dealSuccess.listingTitle}</strong>
                </div>
                <div className="receipt-row">
                  <span>{t('surplus.sellerLabel', 'Seller:')}</span>
                  <strong>{dealSuccess.sellerName}</strong>
                </div>
                <div className="receipt-row">
                  <span>{t('surplus.qtyRequestedLabel', 'Quantity Requested:')}</span>
                  <strong>{dealSuccess.quantity}</strong>
                </div>
                <div className="receipt-row">
                  <span>{t('surplus.totalPriceLabel', 'Total Price:')}</span>
                  <strong className="amount-highlight">{dealSuccess.price}</strong>
                </div>
                <div className="receipt-row">
                  <span>{t('surplus.paymentMethodLabel', 'Payment Method:')}</span>
                  <strong className="capitalize">{dealSuccess.paymentMethod}</strong>
                </div>
                <div className="receipt-row">
                  <span>{t('surplus.pickupWindowLabel', 'Pickup Window:')}</span>
                  <strong>{dealSuccess.pickupTime}</strong>
                </div>
              </div>
            </div>

            <div className="success-actions">
              <button className="btn-primary full-btn" onClick={onClose} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                <ShieldCheck size={16} /> {t('surplus.doneReturn', 'Done & Return to Marketplace')}
              </button>
            </div>
          </div>
        ) : (
          /* BUYER FORM VIEW */
          <form onSubmit={handleConfirm} className="surplus-modal-form">
            {/* Listing Summary Header */}
            <div className="modal-item-summary-card">
              <img src={listing.imageUrl} alt={listing.title} className="summary-thumb" />
              <div className="summary-info">
                <span className="seller-by">{t('surplus.listedBy', 'Listed by')} {listing.sellerName}</span>
                <h4>{listing.title}</h4>
                <div className="summary-tags">
                  <span className="price-tag-badge">
                    {isFree ? t('surplus.freeGiftBadge', 'FREE GIFT') : isSwap ? t('surplus.swapBadge', 'HARVEST SWAP') : `₹${listing.price} / ${listing.unit}`}
                  </span>
                  <span className="loc-tag-badge">
                    <MapPin size={12} /> {listing.location?.neighborhood || 'Green Park'}
                  </span>
                </div>
              </div>
            </div>

            <div className="form-grid">
              {/* Quantity Selection */}
              <div className="form-group full-width">
                <label>{t('surplus.selectQty', 'Select Quantity to Buy / Request')}</label>
                <select value={selectedQty} onChange={(e) => setSelectedQty(e.target.value)}>
                  <option value={`Full Quantity (${listing.quantity})`}>{t('surplus.fullQty', 'Full Quantity')} ({listing.quantity})</option>
                  <option value={`Half Portion (1/2 of ${listing.quantity})`}>{t('surplus.halfQty', 'Half Portion')} (1/2 of {listing.quantity})</option>
                  <option value="Custom Quantity (Negotiate in Chat)">Custom Quantity (Specify in chat)</option>
                </select>
              </div>

              {/* Payment / Exchange Method */}
              <div className="form-group full-width">
                <label>{t('surplus.preferredPayment', 'Payment / Exchange Method')}</label>
                {isFree ? (
                  <div className="payment-info-box free-box">
                    <strong>{t('surplus.freeGiftBadge', 'Free Gift')}:</strong> {t('surplus.freeGiftDesc', 'Request free harvest directly from neighbor. Owner will confirm pickup.')}
                  </div>
                ) : isSwap ? (
                  <div className="payment-info-box swap-box">
                    <strong>{t('surplus.swapBadge', 'Harvest Swap')}:</strong> {t('surplus.swapDesc', 'Offer exchange with your homegrown herbs, flowers, or veggies!')}
                  </div>
                ) : (
                  <div className="payment-options-grid">
                    <label className={`payment-option-card ${paymentMethod === 'cash' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="pay"
                        value="cash"
                        checked={paymentMethod === 'cash'}
                        onChange={() => setPaymentMethod('cash')}
                      />
                      <div>
                        <strong>{t('surplus.cashOnPickup', 'Cash on Pickup')}</strong>
                        <p>{t('surplus.cashDesc', 'Pay cash when collecting from seller')}</p>
                      </div>
                    </label>

                    <label className={`payment-option-card ${paymentMethod === 'upi' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="pay"
                        value="upi"
                        checked={paymentMethod === 'upi'}
                        onChange={() => setPaymentMethod('upi')}
                      />
                      <div>
                        <strong>{t('surplus.digitalUpi', 'UPI / GPay / PhonePe')}</strong>
                        <p>{t('surplus.digitalUpiDesc', 'Direct digital payment to neighbor')}</p>
                      </div>
                    </label>
                  </div>
                )}
              </div>

              {/* Preferred Pickup Window */}
              <div className="form-group full-width">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Clock size={14} style={{ color: '#16a34a' }} /> {t('surplus.pickupTime', 'Preferred Pickup Window')}
                </label>
                <select value={pickupTime} onChange={(e) => setPickupTime(e.target.value)}>
                  <option value="Today Evening (4:00 PM - 7:00 PM)">{t('surplus.todayEvening', 'Today Evening (4:00 PM - 7:00 PM)')}</option>
                  <option value="Tomorrow Morning (8:00 AM - 11:00 AM)">{t('surplus.tomorrowMorning', 'Tomorrow Morning (8:00 AM - 11:00 AM)')}</option>
                  <option value="Flexible / Discuss in Chat">{t('surplus.flexibleWeekend', 'Flexible / Discuss in Chat')}</option>
                </select>
              </div>

              {/* Note to Seller */}
              <div className="form-group full-width">
                <label>{t('surplus.messageNotes', 'Note to Seller (Optional)')}</label>
                <input
                  type="text"
                  placeholder="e.g. Hi! I live nearby in Block B, will come around 5 PM."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            {/* Total Summary Footer */}
            <div className="modal-deal-footer">
              <div className="deal-total-display">
                <span>Total Amount:</span>
                <strong className="total-val">
                  {isFree ? '₹0 (FREE)' : isSwap ? 'SWAP' : `₹${totalPrice}`}
                </strong>
              </div>
              <div className="modal-actions-row">
                <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>
                  {t('surplus.cancel', 'Cancel')}
                </button>
                <button type="submit" className="btn-primary" disabled={submitting} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Send size={15} /> {submitting ? t('surplus.sendingRequest', 'Sending Request...') : t('surplus.sendBuyRequest', 'Send Buy Request to Owner')}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default BuySurplusModal;

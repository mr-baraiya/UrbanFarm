import React, { useState } from 'react';
import { X, ImagePlus, MapPin, Sprout, Plus, Navigation, LocateFixed } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { INDIA_STATES_DISTRICTS, DEFAULT_STATE, DEFAULT_DISTRICT } from '../../data/indiaStatesDistricts';

const PRESET_IMAGES = {
  fruits: 'https://images.unsplash.com/photo-1557800636-894a64c1696f?auto=format&fit=crop&w=600&q=80',
  vegetables: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
  flowers: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=600&q=80',
  herbs: 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?auto=format&fit=crop&w=600&q=80',
  seeds: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=600&q=80',
  compost: 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&w=600&q=80',
  tools: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=600&q=80',
};

const SurplusFormModal = ({ onClose, onSave, user }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    title: '',
    category: 'vegetables',
    quantity: '2 kg',
    priceType: 'fixed',
    price: 40,
    unit: 'kg',
    state: DEFAULT_STATE,
    district: DEFAULT_DISTRICT,
    neighborhood: 'Sector 4',
    description: '',
    imageUrl: PRESET_IMAGES.vegetables,
  });
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(PRESET_IMAGES.vegetables);
  const [submitting, setSubmitting] = useState(false);
  const [detecting, setDetecting] = useState(false);

  const handleStateChange = (st) => {
    const districtsList = INDIA_STATES_DISTRICTS[st] || [];
    setFormData((prev) => ({
      ...prev,
      state: st,
      district: districtsList[0] || '',
    }));
  };

  const handleDetectLocation = async () => {
    setDetecting(true);
    const defaultState = user?.location?.state || 'Gujarat';
    const defaultDistrict = user?.location?.city || (INDIA_STATES_DISTRICTS[defaultState] ? INDIA_STATES_DISTRICTS[defaultState][0] : 'Rajkot');
    const defaultLandmark = user?.location?.neighborhood || 'Sector 4, Main Gate';

    const applyLocation = (st, dist, landmark) => {
      handleStateChange(st);
      setFormData((prev) => ({
        ...prev,
        state: st,
        district: dist,
        neighborhood: landmark,
      }));
      setDetecting(false);
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const { latitude, longitude } = pos.coords;
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
            );
            const data = await res.json();
            const addr = data.address || {};

            // Detect landmark / local neighborhood
            const detectedLandmark =
              addr.neighbourhood ||
              addr.suburb ||
              addr.residential ||
              addr.road ||
              addr.amenity ||
              addr.quarter ||
              defaultLandmark;

            // Map detected state to INDIA_STATES_DISTRICTS key
            let matchedState = defaultState;
            const rawState = addr.state || '';
            for (const st of Object.keys(INDIA_STATES_DISTRICTS)) {
              if (rawState.toLowerCase().includes(st.toLowerCase()) || st.toLowerCase().includes(rawState.toLowerCase())) {
                matchedState = st;
                break;
              }
            }

            // Map detected district to INDIA_STATES_DISTRICTS district list
            const districtsList = INDIA_STATES_DISTRICTS[matchedState] || [];
            let matchedDistrict = districtsList[0] || defaultDistrict;
            const rawCity = addr.city || addr.town || addr.county || addr.state_district || addr.district || '';
            for (const d of districtsList) {
              if (rawCity.toLowerCase().includes(d.toLowerCase()) || d.toLowerCase().includes(rawCity.toLowerCase())) {
                matchedDistrict = d;
                break;
              }
            }

            applyLocation(matchedState, matchedDistrict, detectedLandmark);
          } catch (err) {
            console.warn('Reverse geocoding error:', err);
            applyLocation(defaultState, defaultDistrict, defaultLandmark);
          }
        },
        (err) => {
          console.warn('Geolocation error:', err);
          applyLocation(defaultState, defaultDistrict, defaultLandmark);
        },
        { timeout: 5000 }
      );
    } else {
      applyLocation(defaultState, defaultDistrict, defaultLandmark);
    }
  };

  const handleCategoryChange = (cat) => {
    setFormData((prev) => ({
      ...prev,
      category: cat,
      imageUrl: PRESET_IMAGES[cat] || PRESET_IMAGES.vegetables,
    }));
    if (!imageFile) {
      setPreviewUrl(PRESET_IMAGES[cat] || PRESET_IMAGES.vegetables);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.quantity.trim()) return;

    setSubmitting(true);
    try {
      const landmarkText = formData.neighborhood.trim() || 'Sector 4';
      const randDist = Number((0.4 + Math.random() * 2.0).toFixed(1));

      const dataToSend = new FormData();
      dataToSend.append('title', formData.title);
      dataToSend.append('category', formData.category);
      dataToSend.append('quantity', formData.quantity);
      dataToSend.append('priceType', formData.priceType);
      dataToSend.append('price', formData.priceType === 'free' ? 0 : formData.price);
      dataToSend.append('unit', formData.unit);
      dataToSend.append('state', formData.state);
      dataToSend.append('district', formData.district);
      dataToSend.append('neighborhood', landmarkText);
      dataToSend.append('distanceKm', randDist);
      dataToSend.append('description', formData.description);

      if (imageFile) {
        dataToSend.append('image', imageFile);
      } else {
        dataToSend.append('image', previewUrl);
      }

      await onSave(dataToSend, {
        ...formData,
        imageUrl: previewUrl,
        location: {
          state: formData.state,
          district: formData.district,
          neighborhood: landmarkText,
          distanceKm: randDist
        },
        sellerName: user?.name || 'Urban Farmer',
        sellerAvatar: user?.profilePicture || '',
        _id: 'surplus_' + Date.now(),
        createdAt: new Date().toISOString(),
        status: 'available',
      });

      onClose();
    } catch (err) {
      console.error('Surplus listing submit error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const currentDistricts = INDIA_STATES_DISTRICTS[formData.state] || [];

  return (
    <div className="surplus-modal-overlay" onClick={onClose}>
      <div className="surplus-modal-card-2col" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="surplus-modal-header">
          <div className="modal-title-group">
            <span className="modal-icon">
              <Sprout size={22} style={{ color: '#2d6a4f' }} />
            </span>
            <div>
              <h3>{t('surplus.formTitle', 'Post Surplus Harvest to Neighbors')}</h3>
              <p>{t('surplus.formSub', 'Share extra produce, flowers, or garden items in your district')}</p>
            </div>
          </div>
          <button 
            type="button" 
            className="modal-close-btn" 
            onClick={onClose} 
            aria-label="Close modal"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* 2-Column Form Layout */}
        <form onSubmit={handleSubmit} className="surplus-2col-form-body">
          {/* Left Column: Photo Preview & Upload */}
          <div className="form-col-left">
            <label className="photo-label">{t('surplus.photoLabel', 'Surplus Photo')}</label>
            <div className="modal-photo-preview-container">
              <img src={previewUrl} alt="Harvest Preview" />
            </div>

            <div className="photo-actions-block">
              <label className="btn-upload-photo-custom">
                <ImagePlus size={16} /> {t('surplus.uploadPhoto', 'Upload Custom Photo')}
                <input type="file" accept="image/*" onChange={handleFileChange} hidden />
              </label>
              <p className="photo-preset-note">
                {t('surplus.photoNote', 'Auto-preset shown for selected category or upload your own photo above.')}
              </p>
            </div>
          </div>

          {/* Right Column: All Fields */}
          <div className="form-col-right">
            {/* Title */}
            <div className="form-field-group">
              <label>{t('surplus.itemNameLabel', 'Item Name / Title *')}</label>
              <input
                type="text"
                placeholder={t('surplus.itemNamePlaceholder', 'e.g. Fresh Sweet Cherry Tomatoes (Organic)')}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            {/* Category & Quantity Row */}
            <div className="form-row-2col">
              <div className="form-field-group">
                <label>{t('surplus.categoryLabel', 'Category *')}</label>
                <select
                  value={formData.category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                >
                  <option value="vegetables">{t('surplus.catVegetablesGreens', 'Vegetables & Greens')}</option>
                  <option value="fruits">{t('surplus.catFreshFruits', 'Fresh Fruits')}</option>
                  <option value="flowers">{t('surplus.catFlowersBlossoms', 'Flowers & Blossoms')}</option>
                  <option value="herbs">{t('surplus.catHerbsMicrogreens', 'Herbs & Microgreens')}</option>
                  <option value="seeds">{t('surplus.catSeedsSeedlings', 'Seeds & Seedlings')}</option>
                  <option value="compost">{t('surplus.catCompostFertilizer', 'Compost & Fertilizer')}</option>
                  <option value="tools">{t('surplus.catToolsPots', 'Garden Tools & Pots')}</option>
                </select>
              </div>

              <div className="form-field-group">
                <label>{t('surplus.quantityLabel', 'Quantity *')}</label>
                <input
                  type="text"
                  placeholder={t('surplus.quantityPlaceholder', 'e.g. 2 kg, 4 bunches')}
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Auto-Detect Location Quick Button */}
            <div style={{ marginBottom: '0.45rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={detecting}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: '#f0fdf4',
                  color: '#15803d',
                  border: '1px solid #86efac',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '20px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
                }}
              >
                <LocateFixed size={14} style={{ color: '#16a34a' }} />
                {detecting ? t('surplus.detecting', 'Detecting Location...') : t('surplus.autoDetect', 'Auto-Detect My Location')}
              </button>
            </div>

            {/* State & District Row */}
            <div className="form-row-2col">
              <div className="form-field-group">
                <label>{t('surplus.stateLabel', 'State *')}</label>
                <select
                  value={formData.state}
                  onChange={(e) => handleStateChange(e.target.value)}
                >
                  {Object.keys(INDIA_STATES_DISTRICTS).map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div className="form-field-group">
                <label>{t('surplus.districtLabel', 'District *')} ({currentDistricts.length})</label>
                <select
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                >
                  {currentDistricts.map((dst) => (
                    <option key={dst} value={dst}>{dst}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Price Type, Price & Unit Row */}
            <div className="form-row-2col">
              <div className="form-field-group">
                <label>{t('surplus.pricingModelLabel', 'Pricing Model')}</label>
                <select
                  value={formData.priceType}
                  onChange={(e) => setFormData({ ...formData, priceType: e.target.value })}
                >
                  <option value="fixed">{t('surplus.priceFixed', 'Fixed Price (₹)')}</option>
                  <option value="free">{t('surplus.priceFree', 'FREE Gift to Neighbor')}</option>
                  <option value="swap">{t('surplus.priceSwap', 'Harvest Swap / Trade')}</option>
                  <option value="negotiable">{t('surplus.priceNegotiable', 'Negotiable')}</option>
                </select>
              </div>

              {formData.priceType !== 'free' && formData.priceType !== 'swap' && (
                <div style={{ display: 'flex', gap: '0.5rem', flex: 1 }}>
                  <div className="form-field-group" style={{ flex: 1 }}>
                    <label>{t('surplus.priceLabel', 'Price (₹)')}</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="40"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    />
                  </div>

                  <div className="form-field-group" style={{ flex: 1 }}>
                    <label>{t('surplus.unitLabel', 'Price Unit')}</label>
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    >
                      <option value="kg">/ kg (per kg)</option>
                      <option value="pc">/ pc (per piece)</option>
                      <option value="dozen">/ dozen (12 pcs)</option>
                      <option value="bunch">/ bunch</option>
                      <option value="pack">/ pack</option>
                      <option value="bag">/ bag</option>
                      <option value="total">total (flat)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Local Area Landmark */}
            <div className="form-field-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <MapPin size={14} style={{ color: '#16a34a' }} /> {t('surplus.landmarkLabel', 'Local Area / Landmark / Gate')}
              </label>
              <input
                type="text"
                placeholder={t('surplus.landmarkPlaceholder', 'e.g. Block B, Main Gate / Park Sector')}
                value={formData.neighborhood}
                onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
              />
            </div>

            {/* Description */}
            <div className="form-field-group">
              <label>{t('surplus.descLabel', 'Description & Details')}</label>
              <textarea
                rows="2"
                placeholder={t('surplus.descPlaceholder', 'Harvested fresh today! 100% organic without chemicals.')}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              ></textarea>
            </div>

            {/* Actions Footer */}
            <div className="modal-actions-right">
              <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>
                {t('surplus.cancel', 'Cancel')}
              </button>
              <button type="submit" className="btn-primary" disabled={submitting} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <Plus size={16} /> {submitting ? t('surplus.publishing', 'Publishing...') : t('surplus.postToNeighbors', 'Post Surplus to Neighbors')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SurplusFormModal;

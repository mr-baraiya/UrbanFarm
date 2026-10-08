import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { getPlantById, updatePlant, addTimelineEntry, uploadImage, waterPlant } from '../../services/plantService';
import { useNotification } from '../../hooks/useNotification';
import { formatDate, getStatusColor, getPlantImage } from '../../utils/helpers';
import { getLocalizedDynamicText } from '../../utils/localizationHelper';
import QRCodeModal from '../Common/QRCodeModal';
import HarvestTrackerModal from './HarvestTrackerModal';
import IoTSensorCard from '../Common/IoTSensorCard';
import './PlantDetail.css';

const PlantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showHarvest, setShowHarvest] = useState(false);
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [editData, setEditData] = useState({});
  const [uploadingImg, setUploadingImg] = useState(false);
  const [wateringLoading, setWateringLoading] = useState(false);
  const [timelineDate, setTimelineDate] = useState(new Date().toISOString().split('T')[0]);
  const [newHeight, setNewHeight] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [submittingTimeline, setSubmittingTimeline] = useState(false);
  const { addNotification } = useNotification();

  const todayStr = new Date().toISOString().split('T')[0];

  const isOwner = Boolean(
    user && (
      user.role === 'admin' ||
      (plant?.userId?._id && String(plant.userId._id) === String(user._id || user.id)) || 
      (plant?.userId && String(plant.userId) === String(user._id || user.id)) ||
      (plant?.userId?.email && user.email && plant.userId.email.toLowerCase() === user.email.toLowerCase()) ||
      (plant?.userId?.name && user.name && plant.userId.name.trim().toLowerCase() === user.name.trim().toLowerCase())
    )
  );

  useEffect(() => {
    loadPlant();
  }, [id]);

  const loadPlant = async () => {
    setLoading(true);
    try {
      const data = await getPlantById(id);
      setPlant(data);
      setEditData({
        ...data,
        lastWatered: data.lastWatered ? new Date(data.lastWatered).toISOString().split('T')[0] : '',
        waterFrequency: data.waterFrequency ?? 3
      });
    } catch (error) {
      console.error('Failed to load plant:', error);
      addNotification(t('plants.emptyTitle', 'Plant not found'), 'error');
      if (user) {
        navigate('/app/plants');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickWaterNow = async () => {
    if (wateringLoading) return;
    setWateringLoading(true);
    try {
      const res = await waterPlant(id);
      if (res && res.plant) {
        setPlant(res.plant);
        setEditData(prev => ({
          ...prev,
          lastWatered: new Date().toISOString().split('T')[0],
          nextWateringDate: res.plant.nextWateringDate
        }));
      } else {
        await loadPlant();
      }
      addNotification(t('plants.wateredSuccess', 'Watering recorded successfully! Next date updated.'), 'success');
    } catch (error) {
      console.error('Error watering plant:', error);
      addNotification(t('messages.operationFailed', 'Failed to update watering date'), 'error');
    } finally {
      setWateringLoading(false);
    }
  };

  const handleDetailImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImg(true);
    try {
      const uploadedUrl = await uploadImage(file);
      if (uploadedUrl) {
        setEditData((prev) => ({ ...prev, imageUrl: uploadedUrl }));
        addNotification('Image uploaded successfully!', 'success');
      }
    } catch (err) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditData((prev) => ({ ...prev, imageUrl: reader.result }));
        addNotification('Image set locally!', 'success');
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingImg(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate lastWatered not in the future
      if (editData.lastWatered) {
        const selDate = new Date(editData.lastWatered);
        const now = new Date();
        if (selDate > now) {
          addNotification('Last watered date cannot be in the future', 'error');
          return;
        }
      }

      const payload = {
        ...editData,
        waterFrequency: parseInt(editData.waterFrequency, 10) || 3
      };

      const updated = await updatePlant(id, payload);
      setPlant(updated || { ...plant, ...payload });
      addNotification(t('messages.savedSuccessfully', 'Plant updated successfully!'), 'success');
      setEditing(false);
      window.dispatchEvent(new CustomEvent('urbanfarm:refresh-data'));
    } catch (error) {
      addNotification(t('messages.operationFailed', 'Update failed'), 'error');
    }
  };

  const handleAddTimeline = async (e) => {
    if (e) e.preventDefault();
    if (!newHeight && !newNotes) return;
    setSubmittingTimeline(true);
    try {
      await addTimelineEntry(id, {
        date: timelineDate ? new Date(timelineDate) : new Date(),
        height: parseFloat(newHeight) || 0,
        notes: newNotes
      });
      addNotification(t('messages.savedSuccessfully', 'Growth entry added!'), 'success');
      setNewHeight('');
      setNewNotes('');
      setTimelineDate(todayStr);
      setShowTimelineModal(false);
      loadPlant();
    } catch (error) {
      addNotification(t('messages.operationFailed', 'Failed to add entry'), 'error');
    } finally {
      setSubmittingTimeline(false);
    }
  };

  if (loading) {
    return <div className="plant-detail-loading">{t('common.loading', 'Loading...')}</div>;
  }

  if (!plant) {
    return <div className="plant-detail-error">{t('plants.emptyTitle', 'Plant not found')}</div>;
  }

  const getHealthDisplay = (h) => {
    if (h === 'healthy') return { label: t('plants.healthy', 'Healthy'), color: '#2d6a4f', bg: '#eaf4f4' };
    if (h === 'warning') return { label: t('plants.needsWater', 'Needs Attention'), color: '#b45309', bg: '#fef3c7' };
    if (h === 'unhealthy') return { label: t('plants.atRisk', 'At Risk'), color: '#b91c1c', bg: '#fee2e2' };
    return { label: t('plants.healthy', 'Healthy'), color: '#2d6a4f', bg: '#eaf4f4' };
  };

  const getGrowthStageDisplay = (s) => {
    if (s === 'seedling') return t('plants.seedling', 'Seedling');
    if (s === 'growing') return t('plants.statusGrowing', 'Growing');
    if (s === 'mature') return t('plants.statusMature', 'Mature');
    if (s === 'harvested') return t('plants.harvested', 'Harvesting');
    if (s === 'dead') return t('plants.statusDead', 'Ended');
    return t('plants.statusGrowing', 'Growing');
  };

  // Day-boundary safe watering check
  const isWateredToday = (date) => {
    if (!date) return false;
    return new Date(date).toDateString() === new Date().toDateString();
  };

  const getWateringStatus = () => {
    const wateredToday = isWateredToday(plant.lastWatered);
    if (wateredToday) {
      return { 
        status: 'ok', 
        label: t('plants.wateredToday', 'Watered today'), 
        isOverdue: false, 
        badgeBg: '#eaf4f4', 
        badgeColor: '#2d6a4f' 
      };
    }
    if (!plant.nextWateringDate) {
      return { 
        status: 'normal', 
        label: t('plants.everyDays', 'Every {{days}}d', { days: plant.waterFrequency ?? 3 }), 
        isOverdue: false, 
        badgeBg: '#eaf4f4', 
        badgeColor: '#2d6a4f' 
      };
    }
    const nextDate = new Date(plant.nextWateringDate);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const nextDateOnly = new Date(nextDate);
    nextDateOnly.setHours(0, 0, 0, 0);

    const diffDays = Math.round((nextDateOnly.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { 
        status: 'overdue', 
        label: t('plants.waterOverdue', 'Overdue by {{count}}d', { count: Math.abs(diffDays) }), 
        isOverdue: true, 
        badgeBg: '#fee2e2', 
        badgeColor: '#b91c1c' 
      };
    }
    if (diffDays === 0) {
      return { 
        status: 'due-today', 
        label: t('plants.waterDueToday', 'Due today'), 
        isOverdue: false, 
        badgeBg: '#fef3c7', 
        badgeColor: '#b45309' 
      };
    }
    return { 
      status: 'scheduled', 
      label: t('plants.waterDueIn', 'Due in {{count}}d', { count: diffDays }), 
      isOverdue: false, 
      badgeBg: '#eaf4f4', 
      badgeColor: '#2d6a4f' 
    };
  };

  const statusColor = getStatusColor(plant.status);
  const plantImg = getPlantImage(plant);
  const health = getHealthDisplay(plant.health);
  const growthLabel = getGrowthStageDisplay(plant.status);
  const wateringStatus = getWateringStatus();

  return (
    <div className="plant-detail">
      {/* Header */}
      <div className="detail-header">
        <button className="back-btn" onClick={() => navigate(user ? '/app/plants' : '/')}>
          &larr; {user ? t('plants.backToPlants', 'Back to Plants') : t('navigation.backToHome', 'Back to Home')}
        </button>
        <div className="detail-actions">
          {isOwner && (
            <button className="btn-secondary" onClick={() => setShowHarvest(true)}>
              {t('plants.logHarvest', 'Log Harvest')}
            </button>
          )}
          <button className="btn-secondary" onClick={() => setShowQR(true)}>
            {t('plants.qrCodeShare', 'QR Code / Share')}
          </button>
          {isOwner && (
            <button className="btn-secondary" onClick={() => setEditing(!editing)}>
              {editing ? t('common.cancel', 'Cancel') : t('common.edit', 'Edit Details')}
            </button>
          )}
          <button className="btn-primary" onClick={() => navigate(user ? `/app/diagnose?plant=${plant._id}` : `/login`)}>
            {t('navigation.diagnose', 'Diagnose')}
          </button>
        </div>
      </div>

      {/* Plant Info */}
      <div className="detail-content">
        <div className="detail-main">
          <div className="plant-header">
            <div className="plant-avatar" style={{ background: statusColor + '22' }}>
              {plantImg ? (
                <img src={plantImg} alt={getLocalizedDynamicText(plant.name, i18n.language)} />
              ) : (
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#6b9080' }}>
                  {(plant.name || 'P').charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="plant-title">
              <h2>{getLocalizedDynamicText(plant.name, i18n.language)}</h2>
              {plant.variety && (
                <span className="variety">{getLocalizedDynamicText(plant.variety, i18n.language)}</span>
              )}
              {plant.scientificName && (
                <span className="scientific">{getLocalizedDynamicText(plant.scientificName, i18n.language)}</span>
              )}
              <div className="plant-badges">
                <span className="status-badge" style={{ background: statusColor + '22', color: statusColor }}>
                  {growthLabel}
                </span>
                <span className="health-badge" style={{ color: health.color, background: health.bg, padding: '0.2rem 0.6rem', borderRadius: '8px', fontWeight: 600 }}>
                  <span className={`health-dot ${plant.health || 'healthy'}`} />
                  {health.label}
                </span>
                <span className="watering-badge" style={{ color: wateringStatus.badgeColor, background: wateringStatus.badgeBg, padding: '0.2rem 0.6rem', borderRadius: '8px', fontWeight: 600, fontSize: '0.8rem' }}>
                  {wateringStatus.label}
                </span>
              </div>
            </div>
          </div>

          {/* Live Virtual IoT Sensor Component */}
          <div className="my-4">
            <IoTSensorCard plantId={plant._id || 'tomato-01'} plantName={plant.name} deviceId="ESP32-TOMATO-01" />
          </div>

          {/* Quick Water Action Card */}
          <div className="watering-action-card" style={{ background: 'linear-gradient(135deg, #f6fff8 0%, #eaf4f4 100%)', border: '1px solid #cce3de', borderRadius: '16px', padding: '1.25rem', margin: '1.5rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b9080', fontWeight: 700, marginBottom: '0.25rem' }}>
                Watering Status & Schedule
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 600, color: '#1f3a30' }}>
                {wateringStatus.label}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#6b9080', marginTop: '0.2rem' }}>
                Last watered: {plant.lastWatered ? formatDate(plant.lastWatered, i18n.language) : 'Never'} &bull; Interval: every {plant.waterFrequency ?? 3} days &bull; Next: {plant.nextWateringDate ? formatDate(plant.nextWateringDate, i18n.language) : 'Pending'}
              </div>
            </div>
            {isOwner && (
              <button 
                type="button" 
                className="btn-primary" 
                onClick={handleQuickWaterNow} 
                disabled={wateringLoading}
                style={{ padding: '0.65rem 1.3rem', fontSize: '0.9rem', fontWeight: 600 }}
              >
                {wateringLoading ? t('common.loading', 'Updating...') : t('plants.markWateredNow', 'Mark Watered Now')}
              </button>
            )}
          </div>

          {/* Edit Form */}
          {editing ? (
            <form onSubmit={handleEditSubmit} className="edit-form">
              <div className="form-row">
                <div className="form-group">
                  <label>{t('common.name', 'Name')}</label>
                  <input
                    value={editData.name || ''}
                    onChange={(e) => setEditData({...editData, name: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>{t('plants.plantName', 'Variety')}</label>
                  <input
                    value={editData.variety || ''}
                    onChange={(e) => setEditData({...editData, variety: e.target.value})}
                  />
                </div>
              </div>

              {/* Watering schedule inputs */}
              <div className="form-row">
                <div className="form-group">
                  <label>{t('plants.lastWatered', 'Last Watered Date')}</label>
                  <input
                    type="date"
                    max={todayStr}
                    value={editData.lastWatered || ''}
                    onChange={(e) => setEditData({...editData, lastWatered: e.target.value})}
                  />
                  <small style={{ color: '#6b9080', fontSize: '0.75rem', marginTop: '0.2rem', display: 'block' }}>
                    Cannot be set to a future date
                  </small>
                </div>
                <div className="form-group">
                  <label>{t('plants.waterFrequency', 'Watering Interval (Days)')}</label>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={editData.waterFrequency || 3}
                    onChange={(e) => setEditData({...editData, waterFrequency: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>{t('diagnose.uploadImage', 'Plant Photo')}</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.25rem' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '10px', overflow: 'hidden', background: statusColor + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid #cce3de' }}>
                    {editData.imageUrl ? (
                      <img src={editData.imageUrl} alt="Plant" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '1.2rem', color: '#6b9080', fontWeight: 700 }}>P</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <label htmlFor="detailImageUpload" className="btn-secondary" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', padding: '0.4rem 0.9rem', margin: 0 }}>
                      {uploadingImg ? t('common.loading', 'Uploading...') : t('diagnose.uploadImage', 'Upload Photo')}
                    </label>
                    <input
                      id="detailImageUpload"
                      type="file"
                      accept="image/*"
                      onChange={handleDetailImageUpload}
                      style={{ display: 'none' }}
                      disabled={uploadingImg}
                    />
                    {editData.imageUrl && (
                      <button 
                        type="button" 
                        onClick={() => setEditData({ ...editData, imageUrl: '' })}
                        style={{ background: 'none', border: 'none', color: '#b91c1c', cursor: 'pointer', fontSize: '0.82rem', padding: '0.2rem 0.4rem' }}
                      >
                        {t('common.delete', 'Remove')}
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label>{t('plants.notes', 'Notes')}</label>
                <textarea
                  value={editData.notes || ''}
                  onChange={(e) => setEditData({...editData, notes: e.target.value})}
                  rows="2"
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {t('common.save', 'Save Changes')}
                </button>
              </div>
            </form>
          ) : (
            <>
              {/* Details Grid */}
              <div className="detail-grid">
                {plant.userId && (
                  <div className="detail-item">
                    <span className="label">{t('plants.plantedBy', 'PLANTED BY')}</span>
                    <span className="value">{getLocalizedDynamicText(plant.userId.name || 'Urban Gardener', i18n.language)}</span>
                  </div>
                )}
                <div className="detail-item">
                  <span className="label">{t('navigation.gardens', 'GARDEN')}</span>
                  <span className="value">{getLocalizedDynamicText(plant.gardenId?.name || t('common.none', 'None'), i18n.language)}</span>
                </div>
                <div className="detail-item">
                  <span className="label">{t('plants.plantedDate', 'PLANTED')}</span>
                  <span className="value">{plant.plantingDate ? formatDate(plant.plantingDate, i18n.language) : t('common.none', 'Not set')}</span>
                </div>
                <div className="detail-item">
                  <span className="label">{t('plants.lastWatered', 'LAST WATERED')}</span>
                  <span className="value">{plant.lastWatered ? formatDate(plant.lastWatered, i18n.language) : t('common.none', 'Never')}</span>
                </div>
                <div className="detail-item">
                  <span className="label">{t('plants.nextWatering', 'NEXT WATERING')}</span>
                  <span className="value">{plant.nextWateringDate ? formatDate(plant.nextWateringDate, i18n.language) : t('common.none', 'Not set')}</span>
                </div>
                <div className="detail-item">
                  <span className="label">{t('plants.waterFrequency', 'WATER INTERVAL')}</span>
                  <span className="value">{t('plants.everyDays', 'Every {{days}} days', { days: plant.waterFrequency !== undefined && plant.waterFrequency !== null ? plant.waterFrequency : 3 })}</span>
                </div>
                <div className="detail-item">
                  <span className="label">{t('crops.selectSunlight', 'SUNLIGHT')}</span>
                  <span className="value">
                    {plant.sunlight === 'full' ? (
                      t('plants.fullSun', 'Full Sun')
                    ) : plant.sunlight === 'partial' ? (
                      t('plants.partialShade', 'Partial Shade')
                    ) : (
                      t('plants.shade', 'Shade')
                    )}
                  </span>
                </div>
              </div>

              {plant.notes && (
                <div className="plant-notes">
                  <h4>{t('plants.notes', 'Notes')}</h4>
                  <p>{getLocalizedDynamicText(plant.notes, i18n.language)}</p>
                </div>
              )}
            </>
          )}

          {/* Growth Timeline */}
          <div className="growth-timeline">
            <div className="growth-timeline-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <h4 style={{ margin: 0 }}>
                {t('plants.growthTimeline', 'Growth Timeline')}
              </h4>
              {isOwner && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowTimelineModal(true)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.85rem', fontSize: '0.85rem', cursor: 'pointer', borderRadius: '12px' }}
                >
                  + {t('plants.addTimelineEntry', 'Add Growth Entry')}
                </button>
              )}
            </div>

            {plant.growthTimeline?.length === 0 ? (
              <p className="no-timeline">{t('plants.noTimeline', 'No growth entries yet.')}</p>
            ) : (
              <div className="timeline-list">
                {plant.growthTimeline?.map((entry, idx) => (
                  <div key={idx} className="timeline-item">
                    <span className="timeline-date">{formatDate(entry.date, i18n.language)}</span>
                    {entry.height && (
                      <span className="timeline-height">
                        {entry.height} cm
                      </span>
                    )}
                    {entry.notes && <span className="timeline-notes">{getLocalizedDynamicText(entry.notes, i18n.language)}</span>}
                  </div>
                ))}
              </div>
            )}

            {isOwner && (
              <form onSubmit={handleAddTimeline} className="add-timeline" style={{ marginTop: '1.25rem' }}>
                <input
                  type="number"
                  placeholder="Height (cm)"
                  value={newHeight}
                  onChange={(e) => setNewHeight(e.target.value)}
                  step="0.1"
                />
                <input
                  type="text"
                  placeholder={t('plants.notes', 'Notes')}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                />
                <button type="submit" className="btn-primary">
                  + {t('plants.addTimelineEntry', 'Add Entry')}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Add Timeline Modal */}
      {showTimelineModal && (
        <div 
          className="modal-overlay" 
          onClick={() => setShowTimelineModal(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}
        >
          <div 
            className="modal-container"
            onClick={(e) => e.stopPropagation()}
            style={{ background: 'var(--surface-primary, #ffffff)', borderRadius: '20px', padding: '1.75rem', width: '100%', maxWidth: '480px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', border: '1px solid var(--border)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {t('plants.addTimelineEntry', 'Add Growth Entry')}
              </h3>
              <button 
                onClick={() => setShowTimelineModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleAddTimeline} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                  {t('common.date', 'Date')}
                </label>
                <input
                  type="date"
                  value={timelineDate}
                  onChange={(e) => setTimelineDate(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '12px', border: '1px solid var(--border)', boxSizing: 'border-box', background: 'var(--bg-primary)' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                  Height (cm)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 28.5"
                  value={newHeight}
                  onChange={(e) => setNewHeight(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '12px', border: '1px solid var(--border)', boxSizing: 'border-box', background: 'var(--bg-primary)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                  {t('plants.notes', 'Notes / Observations')}
                </label>
                <textarea
                  placeholder="e.g. Healthy new leaves sprouted, ready for trimming"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  rows="3"
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '12px', border: '1px solid var(--border)', boxSizing: 'border-box', background: 'var(--bg-primary)', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem' }}>
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => setShowTimelineModal(false)}
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={submittingTimeline || (!newHeight && !newNotes)}
                >
                  {submittingTimeline ? t('common.loading', 'Adding...') : t('plants.addTimelineEntry', 'Add Entry')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQR && (
        <QRCodeModal
          plant={plant}
          onClose={() => setShowQR(false)}
        />
      )}

      {/* Harvest Tracker Modal */}
      {showHarvest && (
        <HarvestTrackerModal
          plant={plant}
          onClose={() => setShowHarvest(false)}
          onHarvestLogged={loadPlant}
        />
      )}
    </div>
  );
};

export default PlantDetail;
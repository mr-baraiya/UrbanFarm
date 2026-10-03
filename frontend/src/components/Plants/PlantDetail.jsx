import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  RiArrowLeftLine, 
  RiShoppingBasketLine, 
  RiQrCodeLine, 
  RiEditLine, 
  RiCloseLine, 
  RiMicroscopeLine, 
  RiSunLine, 
  RiSunCloudyLine, 
  RiFileTextLine, 
  RiLineChartLine, 
  RiRulerLine,
  RiSaveLine,
  RiAddLine,
  RiCameraLine,
  RiCalendarEventLine
} from 'react-icons/ri';
import { TbPlant2 } from 'react-icons/tb';
import { useAuth } from '../../hooks/useAuth';
import { getPlantById, updatePlant, addTimelineEntry, uploadImage } from '../../services/plantService';
import { useNotification } from '../../hooks/useNotification';
import { formatDate, getStatusColor, getPlantImage } from '../../utils/helpers';
import { getLocalizedDynamicText } from '../../utils/localizationHelper';
import QRCodeModal from '../Common/QRCodeModal';
import HarvestTrackerModal from './HarvestTrackerModal';
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
  const [timelineDate, setTimelineDate] = useState(new Date().toISOString().split('T')[0]);
  const [newHeight, setNewHeight] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [submittingTimeline, setSubmittingTimeline] = useState(false);
  const { addNotification } = useNotification();

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
      setEditData(data);
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
      await updatePlant(id, editData);
      setPlant({ ...plant, ...editData });
      addNotification(t('messages.savedSuccessfully', 'Plant updated successfully!'), 'success');
      setEditing(false);
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
      setTimelineDate(new Date().toISOString().split('T')[0]);
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
    if (h === 'healthy') return { label: t('plants.healthy', 'Healthy'), color: '#10b981' };
    if (h === 'warning') return { label: t('plants.needsWater', 'Needs Attention'), color: '#f59e0b' };
    if (h === 'unhealthy') return { label: t('plants.atRisk', 'At Risk'), color: '#ef4444' };
    return { label: t('plants.healthy', 'Healthy'), color: '#10b981' };
  };

  const getGrowthStageDisplay = (s) => {
    if (s === 'seedling') return t('plants.seedling', 'Seedling');
    if (s === 'growing') return t('plants.statusGrowing', 'Growing');
    if (s === 'mature') return t('plants.statusMature', 'Mature');
    if (s === 'harvested') return t('plants.harvested', 'Harvesting');
    if (s === 'dead') return t('plants.statusDead', 'Ended');
    return t('plants.statusGrowing', 'Growing');
  };

  const statusColor = getStatusColor(plant.status);
  const plantImg = getPlantImage(plant);
  const health = getHealthDisplay(plant.health);
  const growthLabel = getGrowthStageDisplay(plant.status);

  return (
    <div className="plant-detail">
      {/* Header */}
      <div className="detail-header">
        <button className="back-btn" onClick={() => navigate(user ? '/app/plants' : '/')}>
          <RiArrowLeftLine /> {user ? t('plants.backToPlants', 'Back to Plants') : t('navigation.backToHome', 'Back to Home')}
        </button>
        <div className="detail-actions">
          {isOwner && (
            <button className="btn-secondary" onClick={() => setShowHarvest(true)}>
              <RiShoppingBasketLine /> {t('plants.logHarvest', 'Log Harvest')}
            </button>
          )}
          <button className="btn-secondary" onClick={() => setShowQR(true)}>
            <RiQrCodeLine /> {t('plants.qrCodeShare', 'QR Code / Share')}
          </button>
          {isOwner && (
            <button className="btn-secondary" onClick={() => setEditing(!editing)}>
              {editing ? <><RiCloseLine /> {t('common.cancel', 'Cancel')}</> : <><RiEditLine /> {t('common.edit', 'Edit')}</>}
            </button>
          )}
          <button className="btn-primary" onClick={() => navigate(user ? `/app/diagnose?plant=${plant._id}` : `/login`)}>
            <RiMicroscopeLine /> {t('navigation.diagnose', 'Diagnose')}
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
                <TbPlant2 className="plant-avatar-icon" />
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
                <span className={`health-badge ${plant.health || 'healthy'}`} style={{ color: health.color }}>
                  <span className={`health-dot ${plant.health || 'healthy'}`} />
                  {health.label}
                </span>
              </div>
            </div>
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
              <div className="form-group">
                <label>{t('diagnose.uploadImage', 'Plant Photo')}</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.25rem' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '10px', overflow: 'hidden', background: statusColor + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid var(--border-light, rgba(0,0,0,0.1))' }}>
                    {editData.imageUrl ? (
                      <img src={editData.imageUrl} alt="Plant" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <TbPlant2 style={{ fontSize: '1.6rem', color: '#2d6a4f' }} />
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <label htmlFor="detailImageUpload" className="btn-secondary" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', padding: '0.4rem 0.9rem', margin: 0 }}>
                      <RiCameraLine /> {uploadingImg ? t('common.loading', 'Uploading...') : t('diagnose.uploadImage', 'Upload Photo')}
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
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.82rem', padding: '0.2rem 0.4rem' }}
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
                  <RiSaveLine /> {t('common.save', 'Save Changes')}
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
                  <span className="label">{t('plants.waterFrequency', 'WATER FREQUENCY')}</span>
                  <span className="value">{t('plants.everyDays', 'Every {{days}} days', { days: plant.waterFrequency !== undefined && plant.waterFrequency !== null ? plant.waterFrequency : 3 })}</span>
                </div>
                <div className="detail-item">
                  <span className="label">{t('crops.selectSunlight', 'SUNLIGHT')}</span>
                  <span className="value">
                    {plant.sunlight === 'full' ? (
                      <><RiSunLine className="meta-icon sun" /> {t('plants.fullSun', 'Full Sun')}</>
                    ) : plant.sunlight === 'partial' ? (
                      <><RiSunCloudyLine className="meta-icon shade" /> {t('plants.partialShade', 'Partial Shade')}</>
                    ) : (
                      <><RiSunCloudyLine className="meta-icon shade" /> {t('plants.shade', 'Shade')}</>
                    )}
                  </span>
                </div>
              </div>

              {plant.notes && (
                <div className="plant-notes">
                  <h4>
                    <RiFileTextLine className="section-icon" /> {t('plants.notes', 'Notes')}
                  </h4>
                  <p>{getLocalizedDynamicText(plant.notes, i18n.language)}</p>
                </div>
              )}
            </>
          )}

          {/* Growth Timeline */}
          <div className="growth-timeline">
            <div className="growth-timeline-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <h4 style={{ margin: 0 }}>
                <RiLineChartLine className="section-icon" /> {t('plants.growthTimeline', 'Growth Timeline')}
              </h4>
              {isOwner && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowTimelineModal(true)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.85rem', fontSize: '0.85rem', cursor: 'pointer', borderRadius: '12px' }}
                >
                  <RiAddLine /> {t('plants.addTimelineEntry', 'Add Growth Entry')}
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
                        <RiRulerLine className="ruler-icon" /> {entry.height} cm
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
                  <RiAddLine /> {t('plants.addTimelineEntry', 'Add Entry')}
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
                <RiLineChartLine style={{ color: 'var(--sage, #6b9080)' }} /> {t('plants.addTimelineEntry', 'Add Growth Entry')}
              </h3>
              <button 
                onClick={() => setShowTimelineModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <RiCloseLine />
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
                  <RiAddLine /> {submittingTimeline ? t('common.loading', 'Adding...') : t('plants.addTimelineEntry', 'Add Entry')}
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
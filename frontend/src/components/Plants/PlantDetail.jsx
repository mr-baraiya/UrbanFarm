import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  RiCameraLine
} from 'react-icons/ri';
import { TbPlant2 } from 'react-icons/tb';
import { useAuth } from '../../hooks/useAuth';
import { getPlantById, updatePlant, addTimelineEntry, uploadImage } from '../../services/plantService';
import { useNotification } from '../../hooks/useNotification';
import { formatDate, getStatusColor, getPlantImage } from '../../utils/helpers';
import QRCodeModal from '../Common/QRCodeModal';
import HarvestTrackerModal from './HarvestTrackerModal';
import './PlantDetail.css';

const PlantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showHarvest, setShowHarvest] = useState(false);
  const [editData, setEditData] = useState({});
  const [uploadingImg, setUploadingImg] = useState(false);
  const [newHeight, setNewHeight] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const { addNotification } = useNotification();

  const isOwner = user && plant && (
    (plant.userId?._id && plant.userId._id === user._id) || 
    plant.userId === user._id || 
    user.role === 'admin'
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
      addNotification('Plant not found', 'error');
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
        addNotification('Image uploaded to Cloudinary successfully!', 'success');
      }
    } catch (err) {
      // Fallback to local base64 preview if Cloudinary fails
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
      addNotification('Plant updated successfully!', 'success');
      setEditing(false);
    } catch (error) {
      addNotification('Update failed', 'error');
    }
  };

  const handleAddTimeline = async (e) => {
    e.preventDefault();
    if (!newHeight && !newNotes) return;
    try {
      await addTimelineEntry(id, { height: parseFloat(newHeight) || 0, notes: newNotes });
      addNotification('Growth entry added!', 'success');
      setNewHeight('');
      setNewNotes('');
      loadPlant();
    } catch (error) {
      addNotification('Failed to add entry', 'error');
    }
  };

  if (loading) {
    return <div className="plant-detail-loading">Loading...</div>;
  }

  if (!plant) {
    return <div className="plant-detail-error">Plant not found</div>;
  }

  const statusColor = getStatusColor(plant.status);
  const plantImg = getPlantImage(plant);

  return (
    <div className="plant-detail">
      {/* Header */}
      <div className="detail-header">
        <button className="back-btn" onClick={() => navigate(user ? '/app/plants' : '/')}>
          <RiArrowLeftLine /> {user ? 'Back to Plants' : 'Back to Home'}
        </button>
        <div className="detail-actions">
          {isOwner && (
            <button className="btn-secondary" onClick={() => setShowHarvest(true)}>
              <RiShoppingBasketLine /> Log Harvest
            </button>
          )}
          <button className="btn-secondary" onClick={() => setShowQR(true)}>
            <RiQrCodeLine /> QR Code / Share
          </button>
          {isOwner && (
            <button className="btn-secondary" onClick={() => setEditing(!editing)}>
              {editing ? <><RiCloseLine /> Cancel</> : <><RiEditLine /> Edit</>}
            </button>
          )}
          <button className="btn-primary" onClick={() => navigate(user ? `/app/diagnose?plant=${plant._id}` : `/login`)}>
            <RiMicroscopeLine /> Diagnose
          </button>
        </div>
      </div>

      {/* Plant Info */}
      <div className="detail-content">
        <div className="detail-main">
          <div className="plant-header">
            <div className="plant-avatar" style={{ background: statusColor + '22' }}>
              {plantImg ? (
                <img src={plantImg} alt={plant.name} />
              ) : (
                <TbPlant2 className="plant-avatar-icon" />
              )}
            </div>
            <div className="plant-title">
              <h2>{plant.name}</h2>
              {plant.variety && <span className="variety">{plant.variety}</span>}
              {plant.scientificName && (
                <span className="scientific">{plant.scientificName}</span>
              )}
              <div className="plant-badges">
                <span className="status-badge" style={{ background: statusColor + '22', color: statusColor }}>
                  {plant.status}
                </span>
                <span className={`health-badge ${plant.health || 'healthy'}`}>
                  <span className={`health-dot ${plant.health || 'healthy'}`} />
                  {plant.health === 'healthy' ? 'Healthy' : 
                   plant.health === 'warning' ? 'Needs Attention' : 
                   'At Risk'}
                </span>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          {editing ? (
            <form onSubmit={handleEditSubmit} className="edit-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Name</label>
                  <input
                    value={editData.name || ''}
                    onChange={(e) => setEditData({...editData, name: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Variety</label>
                  <input
                    value={editData.variety || ''}
                    onChange={(e) => setEditData({...editData, variety: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Plant Photo</label>
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
                      <RiCameraLine /> {uploadingImg ? 'Uploading...' : 'Upload Photo'}
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
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={editData.notes || ''}
                  onChange={(e) => setEditData({...editData, notes: e.target.value})}
                  rows="2"
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  <RiSaveLine /> Save Changes
                </button>
              </div>
            </form>
          ) : (
            <>
              {/* Details Grid */}
              <div className="detail-grid">
                {plant.userId && (
                  <div className="detail-item">
                    <span className="label">Planted By</span>
                    <span className="value">{plant.userId.name || 'Urban Gardener'}</span>
                  </div>
                )}
                <div className="detail-item">
                  <span className="label">Garden</span>
                  <span className="value">{plant.gardenId?.name || 'None'}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Planted</span>
                  <span className="value">{plant.plantingDate ? formatDate(plant.plantingDate) : 'Not set'}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Water Frequency</span>
                  <span className="value">Every {plant.waterFrequency !== undefined && plant.waterFrequency !== null ? plant.waterFrequency : 3} days</span>
                </div>
                <div className="detail-item">
                  <span className="label">Sunlight</span>
                  <span className="value">
                    {plant.sunlight === 'full' ? (
                      <><RiSunLine className="meta-icon sun" /> Full Sun</>
                    ) : plant.sunlight === 'partial' ? (
                      <><RiSunCloudyLine className="meta-icon shade" /> Partial Shade</>
                    ) : (
                      <><RiSunCloudyLine className="meta-icon shade" /> Shade</>
                    )}
                  </span>
                </div>
              </div>

              {plant.notes && (
                <div className="plant-notes">
                  <h4>
                    <RiFileTextLine className="section-icon" /> Notes
                  </h4>
                  <p>{plant.notes}</p>
                </div>
              )}
            </>
          )}

          {/* Growth Timeline */}
          <div className="growth-timeline">
            <h4>
              <RiLineChartLine className="section-icon" /> Growth Timeline
            </h4>
            {plant.growthTimeline?.length === 0 ? (
              <p className="no-timeline">No growth entries yet.</p>
            ) : (
              <div className="timeline-list">
                {plant.growthTimeline?.map((entry, idx) => (
                  <div key={idx} className="timeline-item">
                    <span className="timeline-date">{formatDate(entry.date)}</span>
                    {entry.height && (
                      <span className="timeline-height">
                        <RiRulerLine className="ruler-icon" /> {entry.height} cm
                      </span>
                    )}
                    {entry.notes && <span className="timeline-notes">{entry.notes}</span>}
                  </div>
                ))}
              </div>
            )}
            {isOwner && (
              <form onSubmit={handleAddTimeline} className="add-timeline">
                <input
                  type="number"
                  placeholder="Height (cm)"
                  value={newHeight}
                  onChange={(e) => setNewHeight(e.target.value)}
                  step="0.1"
                />
                <input
                  type="text"
                  placeholder="Notes"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                />
                <button type="submit" className="btn-primary">
                  <RiAddLine /> Add Entry
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

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
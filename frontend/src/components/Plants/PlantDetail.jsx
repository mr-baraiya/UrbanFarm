import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPlantById, updatePlant, addTimelineEntry } from '../../services/plantService';
import { useNotification } from '../../hooks/useNotification';
import { formatDate, getStatusColor } from '../../utils/helpers';
import './PlantDetail.css';

const PlantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [newHeight, setNewHeight] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const { addNotification } = useNotification();

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
      navigate('/app/plants');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (field, value) => {
    try {
      await updatePlant(id, { [field]: value });
      setPlant({ ...plant, [field]: value });
      addNotification('Plant updated!', 'success');
    } catch (error) {
      addNotification('Update failed', 'error');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await updatePlant(id, editData);
      setPlant({ ...plant, ...editData });
      addNotification('Plant updated!', 'success');
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
      addNotification('Timeline entry added!', 'success');
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

  return (
    <div className="plant-detail">
      {/* Header */}
      <div className="detail-header">
        <button className="back-btn" onClick={() => navigate('/app/plants')}>
          ← Back to Plants
        </button>
        <div className="detail-actions">
          <button className="btn-secondary" onClick={() => setEditing(!editing)}>
            {editing ? '✕ Cancel' : '✏️ Edit'}
          </button>
          <button className="btn-primary" onClick={() => navigate(`/app/diagnose?plant=${plant._id}`)}>
            🔬 Diagnose
          </button>
        </div>
      </div>

      {/* Plant Info */}
      <div className="detail-content">
        <div className="detail-main">
          <div className="plant-header">
            <div className="plant-avatar" style={{ background: statusColor + '44' }}>
              {plant.imageUrl ? (
                <img src={plant.imageUrl} alt={plant.name} />
              ) : (
                <span>🌱</span>
              )}
            </div>
            <div className="plant-title">
              <h2>{plant.name}</h2>
              {plant.variety && <span className="variety">{plant.variety}</span>}
              {plant.scientificName && (
                <span className="scientific">{plant.scientificName}</span>
              )}
              <div className="plant-badges">
                <span className="status-badge" style={{ background: statusColor + '33', color: statusColor }}>
                  {plant.status}
                </span>
                <span className="health-badge">
                  {plant.health === 'healthy' ? '🟢 Healthy' : 
                   plant.health === 'warning' ? '🟡 Needs Attention' : 
                   '🔴 At Risk'}
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
                <label>Notes</label>
                <textarea
                  value={editData.notes || ''}
                  onChange={(e) => setEditData({...editData, notes: e.target.value})}
                  rows="2"
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">Save Changes</button>
              </div>
            </form>
          ) : (
            <>
              {/* Details Grid */}
              <div className="detail-grid">
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
                  <span className="value">Every {plant.waterFrequency || 3} days</span>
                </div>
                <div className="detail-item">
                  <span className="label">Sunlight</span>
                  <span className="value">
                    {plant.sunlight === 'full' ? '☀️ Full Sun' : 
                     plant.sunlight === 'partial' ? '⛅ Partial Shade' : 
                     '🌥️ Shade'}
                  </span>
                </div>
              </div>

              {plant.notes && (
                <div className="plant-notes">
                  <h4>📝 Notes</h4>
                  <p>{plant.notes}</p>
                </div>
              )}
            </>
          )}

          {/* Growth Timeline */}
          <div className="growth-timeline">
            <h4>📈 Growth Timeline</h4>
            {plant.growthTimeline?.length === 0 ? (
              <p className="no-timeline">No growth entries yet.</p>
            ) : (
              <div className="timeline-list">
                {plant.growthTimeline?.map((entry, idx) => (
                  <div key={idx} className="timeline-item">
                    <span className="timeline-date">{formatDate(entry.date)}</span>
                    {entry.height && <span className="timeline-height">📏 {entry.height} cm</span>}
                    {entry.notes && <span className="timeline-notes">{entry.notes}</span>}
                  </div>
                ))}
              </div>
            )}
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
              <button type="submit" className="btn-primary">Add Entry</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlantDetail;
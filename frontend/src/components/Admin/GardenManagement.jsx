import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useNotification } from '../../hooks/useNotification';
import ConfirmModal from '../Common/ConfirmModal';
import { validateGardenForm, validatePlantForm } from '../../utils/validators';
import {
  FaSeedling,
  FaSearch,
  FaFileCsv,
  FaTrash,
  FaEye,
  FaEdit,
  FaPlus,
  FaFilter,
  FaTree,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimes,
  FaCheck,
  FaWater,
  FaSun,
  FaMapMarkerAlt,
  FaRulerCombined,
  FaExclamationCircle,
} from 'react-icons/fa';
import './GardenManagement.css';

const GardenManagement = () => {
  const [activeTab, setActiveTab] = useState('gardens');
  const [gardens, setGardens] = useState([]);
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addNotification } = useNotification();

  // Filters
  const [search, setSearch] = useState('');
  const [healthFilter, setHealthFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Custom Confirm Modal State
  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Modals state
  const [viewingGarden, setViewingGarden] = useState(null);
  const [editingGarden, setEditingGarden] = useState(null);
  const [showCreateGardenModal, setShowCreateGardenModal] = useState(false);
  const [newGarden, setNewGarden] = useState({ name: '', location: '', size: 0, description: '' });
  const [gardenErrors, setGardenErrors] = useState({});

  const [viewingPlant, setViewingPlant] = useState(null);
  const [editingPlant, setEditingPlant] = useState(null);
  const [showCreatePlantModal, setShowCreatePlantModal] = useState(false);
  const [newPlant, setNewPlant] = useState({
    name: '',
    scientificName: '',
    variety: '',
    gardenId: '',
    health: 'healthy',
    status: 'seedling',
    sunlight: 'full',
    waterFrequency: 3,
    notes: '',
  });
  const [plantErrors, setPlantErrors] = useState({});

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'gardens') {
        const res = await api.get(`/admin/gardens?search=${search}`);
        setGardens(res.data.gardens || []);
      } else {
        const [plantsRes, gardensRes] = await Promise.all([
          api.get(`/admin/plants?search=${search}&health=${healthFilter}&status=${statusFilter}`),
          api.get('/admin/gardens'),
        ]);
        setPlants(plantsRes.data.plants || []);
        setGardens(gardensRes.data.gardens || []);
      }
    } catch (error) {
      console.error('Failed to fetch admin garden/plant data:', error);
      addNotification('Failed to fetch records', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const promptDeleteGarden = (id, name) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Delete Garden Space',
      message: `Are you sure you want to permanently delete garden "${name}"? This action will also delete all associated plants.`,
      onConfirm: async () => {
        try {
          await api.delete(`/admin/gardens/${id}`);
          addNotification('Garden deleted successfully', 'success');
          fetchData();
        } catch (error) {
          addNotification(error.response?.data?.message || 'Failed to delete garden', 'error');
        }
      },
    });
  };

  const promptDeletePlant = (id, name) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Delete Plant Record',
      message: `Are you sure you want to delete plant "${name}" from the inventory?`,
      onConfirm: async () => {
        try {
          await api.delete(`/admin/plants/${id}`);
          addNotification('Plant deleted successfully', 'success');
          fetchData();
        } catch (error) {
          addNotification(error.response?.data?.message || 'Failed to delete plant', 'error');
        }
      },
    });
  };

  const validateGarden = () => {
    const { isValid, errors: formErrors } = validateGardenForm(newGarden);
    setGardenErrors(formErrors);
    return isValid;
  };

  const handleCreateGarden = async (e) => {
    e.preventDefault();
    if (!validateGarden()) return;
    try {
      await api.post('/admin/gardens', newGarden);
      addNotification('New garden space created successfully!', 'success');
      setShowCreateGardenModal(false);
      setNewGarden({ name: '', location: '', size: 0, description: '' });
      setGardenErrors({});
      fetchData();
    } catch (error) {
      addNotification(error.response?.data?.message || 'Failed to create garden', 'error');
    }
  };

  const validatePlant = () => {
    const { isValid, errors: formErrors } = validatePlantForm(newPlant);
    setPlantErrors(formErrors);
    return isValid;
  };

  const handleCreatePlant = async (e) => {
    e.preventDefault();
    if (!validatePlant()) return;
    try {
      await api.post('/admin/plants', newPlant);
      addNotification('New plant added to inventory successfully!', 'success');
      setShowCreatePlantModal(false);
      setNewPlant({
        name: '',
        scientificName: '',
        variety: '',
        gardenId: '',
        health: 'healthy',
        status: 'seedling',
        sunlight: 'full',
        waterFrequency: 3,
        notes: '',
      });
      setPlantErrors({});
      fetchData();
    } catch (error) {
      addNotification(error.response?.data?.message || 'Failed to add plant', 'error');
    }
  };

  const handleSaveEditGarden = async (e) => {
    e.preventDefault();
    if (!editingGarden) return;
    try {
      await api.put(`/admin/gardens/${editingGarden._id}`, {
        name: editingGarden.name,
        description: editingGarden.description,
        location: editingGarden.location,
        size: editingGarden.size,
        isActive: editingGarden.isActive,
      });
      addNotification('Garden updated successfully!', 'success');
      setEditingGarden(null);
      fetchData();
    } catch (error) {
      addNotification(error.response?.data?.message || 'Failed to update garden', 'error');
    }
  };

  const handleSaveEditPlant = async (e) => {
    e.preventDefault();
    if (!editingPlant) return;
    try {
      await api.put(`/admin/plants/${editingPlant._id}`, {
        name: editingPlant.name,
        scientificName: editingPlant.scientificName,
        variety: editingPlant.variety,
        health: editingPlant.health,
        status: editingPlant.status,
        sunlight: editingPlant.sunlight,
        waterFrequency: editingPlant.waterFrequency,
        notes: editingPlant.notes,
      });
      addNotification('Plant details updated successfully!', 'success');
      setEditingPlant(null);
      fetchData();
    } catch (error) {
      addNotification(error.response?.data?.message || 'Failed to update plant', 'error');
    }
  };

  const handleExportCSV = async (type) => {
    try {
      const response = await api.get(`/admin/export/${type}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `urbanfarm_${type}_export.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      addNotification(`${type.toUpperCase()} exported successfully!`, 'success');
    } catch (error) {
      addNotification('Failed to export CSV', 'error');
    }
  };

  return (
    <div className="garden-mgmt-container">
      {/* Reusable Confirm Modal */}
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
      />

      <div className="admin-page-header">
        <div>
          <h2>Platform Gardens & Plants Database</h2>
          <p>Monitor, search, view, edit, add new, and export all garden spaces and plant records.</p>
        </div>
        <div className="admin-header-actions">
          {activeTab === 'gardens' ? (
            <button className="admin-btn admin-btn-primary" onClick={() => setShowCreateGardenModal(true)}>
              <FaPlus /> Add New Garden
            </button>
          ) : (
            <button className="admin-btn admin-btn-primary" onClick={() => setShowCreatePlantModal(true)}>
              <FaPlus /> Add New Plant
            </button>
          )}
          <button className="admin-btn admin-btn-outline" onClick={() => handleExportCSV(activeTab)}>
            <FaFileCsv /> Export {activeTab.toUpperCase()} CSV
          </button>
        </div>
      </div>

      <div className="admin-tab-row">
        <button
          className={`admin-tab-btn ${activeTab === 'gardens' ? 'active' : ''}`}
          onClick={() => setActiveTab('gardens')}
        >
          <FaTree /> Gardens Database ({gardens.length})
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'plants' ? 'active' : ''}`}
          onClick={() => setActiveTab('plants')}
        >
          <FaSeedling /> Plants Inventory ({plants.length})
        </button>
      </div>

      <div className="admin-filter-bar">
        <form onSubmit={handleSearchSubmit} className="admin-search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder={
              activeTab === 'gardens'
                ? 'Search gardens by name or location...'
                : 'Search plants by name or variety...'
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="admin-btn admin-btn-sm">Search</button>
        </form>

        {activeTab === 'plants' && (
          <div className="admin-filters">
            <div className="filter-group">
              <FaFilter />
              <label>Health:</label>
              <select value={healthFilter} onChange={(e) => setHealthFilter(e.target.value)}>
                <option value="all">All Health</option>
                <option value="healthy">Healthy</option>
                <option value="warning">Warning</option>
                <option value="unhealthy">Unhealthy</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Status:</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All Growth Stages</option>
                <option value="seedling">Seedling</option>
                <option value="growing">Growing</option>
                <option value="mature">Mature</option>
                <option value="harvested">Harvested</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="admin-loading-spinner">Loading database records...</div>
      ) : activeTab === 'gardens' ? (
        <div className="admin-table-wrapper">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>Garden Name</th>
                <th>Owner Email</th>
                <th>Location</th>
                <th>Size (m²)</th>
                <th>Plants Count</th>
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {gardens.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">No gardens found matching query.</td>
                </tr>
              ) : (
                gardens.map((g) => (
                  <tr key={g._id}>
                    <td><strong>{g.name}</strong></td>
                    <td>{g.userId?.email || 'System User'}</td>
                    <td>{g.location || 'N/A'}</td>
                    <td>{g.size || 0}</td>
                    <td><span className="badge badge-info">{g.plants?.length || 0} Plants</span></td>
                    <td>{new Date(g.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="action-btns">
                        <button className="admin-action-icon approve" title="View Garden Details" onClick={() => setViewingGarden(g)}><FaEye /></button>
                        <button className="admin-action-icon edit" title="Edit Garden" onClick={() => setEditingGarden({ ...g })}><FaEdit /></button>
                        <button className="admin-action-icon delete" title="Delete Garden" onClick={() => promptDeleteGarden(g._id, g.name)}><FaTrash /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>Plant Name</th>
                <th>Scientific Name</th>
                <th>Garden</th>
                <th>Owner</th>
                <th>Health</th>
                <th>Growth Stage</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {plants.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">No plants found matching filter.</td>
                </tr>
              ) : (
                plants.map((p) => (
                  <tr key={p._id}>
                    <td><strong>{p.name}</strong></td>
                    <td><em>{p.scientificName || 'N/A'}</em></td>
                    <td>{p.gardenId?.name || 'N/A'}</td>
                    <td>{p.userId?.email || 'N/A'}</td>
                    <td>
                      <span className={`health-badge ${p.health}`}>
                        {p.health === 'healthy' && <FaCheckCircle />}
                        {p.health === 'warning' && <FaExclamationTriangle />}
                        {p.health}
                      </span>
                    </td>
                    <td><span className="badge badge-secondary">{p.status}</span></td>
                    <td>
                      <div className="action-btns">
                        <button className="admin-action-icon approve" title="View Plant Details" onClick={() => setViewingPlant(p)}><FaEye /></button>
                        <button className="admin-action-icon edit" title="Edit Plant" onClick={() => setEditingPlant({ ...p })}><FaEdit /></button>
                        <button className="admin-action-icon delete" title="Delete Plant" onClick={() => promptDeletePlant(p._id, p.name)}><FaTrash /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create New Garden Modal */}
      {showCreateGardenModal && (
        <div className="admin-modal-overlay" onClick={() => setShowCreateGardenModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3><FaPlus /> Add New Garden Space</h3>
              <button className="modal-close" onClick={() => setShowCreateGardenModal(false)}><FaTimes /></button>
            </div>
            <form onSubmit={handleCreateGarden} className="admin-modal-form" noValidate>
              <div className="form-group">
                <label>Garden Name <span className="required">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. Rooftop Vegetable Bed"
                  value={newGarden.name}
                  onChange={(e) => setNewGarden({ ...newGarden, name: e.target.value })}
                  className={gardenErrors.name ? 'input-error' : ''}
                />
                {gardenErrors.name && <span className="error-text"><FaExclamationCircle /> {gardenErrors.name}</span>}
              </div>
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  placeholder="e.g. South Balcony, Raised Bed #2"
                  value={newGarden.location}
                  onChange={(e) => setNewGarden({ ...newGarden, location: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Size (Square Meters)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={newGarden.size}
                  onChange={(e) => setNewGarden({ ...newGarden, size: parseFloat(e.target.value) || 0 })}
                />
                {gardenErrors.size && <span className="error-text"><FaExclamationCircle /> {gardenErrors.size}</span>}
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  style={{ padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', minHeight: '70px' }}
                  placeholder="Describe soil type, light exposure, or bed notes..."
                  value={newGarden.description}
                  onChange={(e) => setNewGarden({ ...newGarden, description: e.target.value })}
                />
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-outline" onClick={() => setShowCreateGardenModal(false)}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn-primary"><FaCheck /> Create Garden</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create New Plant Modal */}
      {showCreatePlantModal && (
        <div className="admin-modal-overlay" onClick={() => setShowCreatePlantModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3><FaPlus /> Add New Plant Record</h3>
              <button className="modal-close" onClick={() => setShowCreatePlantModal(false)}><FaTimes /></button>
            </div>
            <form onSubmit={handleCreatePlant} className="admin-modal-form" noValidate>
              <div className="form-group">
                <label>Plant Name <span className="required">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. Cherry Tomato"
                  value={newPlant.name}
                  onChange={(e) => setNewPlant({ ...newPlant, name: e.target.value })}
                  className={plantErrors.name ? 'input-error' : ''}
                />
                {plantErrors.name && <span className="error-text"><FaExclamationCircle /> {plantErrors.name}</span>}
              </div>
              <div className="form-group">
                <label>Assigned Garden Space <span className="required">*</span></label>
                <select
                  value={newPlant.gardenId}
                  onChange={(e) => setNewPlant({ ...newPlant, gardenId: e.target.value })}
                  className={plantErrors.gardenId ? 'input-error' : ''}
                >
                  <option value="">-- Select Target Garden --</option>
                  {gardens.map((g) => (
                    <option key={g._id} value={g._id}>{g.name} ({g.userId?.email || 'System'})</option>
                  ))}
                </select>
                {plantErrors.gardenId && <span className="error-text"><FaExclamationCircle /> {plantErrors.gardenId}</span>}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Scientific Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Solanum lycopersicum"
                    value={newPlant.scientificName}
                    onChange={(e) => setNewPlant({ ...newPlant, scientificName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Variety</label>
                  <input
                    type="text"
                    placeholder="e.g. Sweet 100"
                    value={newPlant.variety}
                    onChange={(e) => setNewPlant({ ...newPlant, variety: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Health Condition</label>
                  <select value={newPlant.health} onChange={(e) => setNewPlant({ ...newPlant, health: e.target.value })}>
                    <option value="healthy">Healthy</option>
                    <option value="warning">Warning</option>
                    <option value="unhealthy">Unhealthy</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Growth Stage</label>
                  <select value={newPlant.status} onChange={(e) => setNewPlant({ ...newPlant, status: e.target.value })}>
                    <option value="seedling">Seedling</option>
                    <option value="growing">Growing</option>
                    <option value="mature">Mature</option>
                    <option value="harvested">Harvested</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Sunlight Need</label>
                  <select value={newPlant.sunlight} onChange={(e) => setNewPlant({ ...newPlant, sunlight: e.target.value })}>
                    <option value="full">Full Sun</option>
                    <option value="partial">Partial Sun</option>
                    <option value="shade">Shade</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Water Frequency (Days)</label>
                  <input
                    type="number"
                    min="0"
                    value={newPlant.waterFrequency}
                    onChange={(e) => {
                      const val = e.target.value === '' ? '' : parseInt(e.target.value);
                      setNewPlant({ ...newPlant, waterFrequency: val });
                    }}
                  />
                  {plantErrors.waterFrequency && <span className="error-text"><FaExclamationCircle /> {plantErrors.waterFrequency}</span>}
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-outline" onClick={() => setShowCreatePlantModal(false)}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn-primary"><FaCheck /> Create Plant</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Garden Modal */}
      {viewingGarden && (
        <div className="admin-modal-overlay" onClick={() => setViewingGarden(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3><FaTree /> Garden Space Details</h3>
              <button className="modal-close" onClick={() => setViewingGarden(null)}><FaTimes /></button>
            </div>
            <div className="admin-modal-form">
              <div>
                <h4 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text)' }}>{viewingGarden.name}</h4>
                <p style={{ margin: '0.25rem 0', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{viewingGarden.description || 'No description provided.'}</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', padding: '1rem', background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div><label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>LOCATION</label><strong><FaMapMarkerAlt style={{ color: 'var(--sage)' }} /> {viewingGarden.location || 'N/A'}</strong></div>
                <div><label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>SIZE</label><strong><FaRulerCombined style={{ color: 'var(--sage)' }} /> {viewingGarden.size || 0} m²</strong></div>
                <div><label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>OWNER</label><span>{viewingGarden.userId?.name || 'User'} ({viewingGarden.userId?.email || 'N/A'})</span></div>
                <div><label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>TOTAL PLANTS</label><span className="badge badge-info">{viewingGarden.plants?.length || 0} Plants</span></div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-outline" onClick={() => { setEditingGarden({ ...viewingGarden }); setViewingGarden(null); }}><FaEdit /> Edit Garden</button>
                <button type="button" className="admin-btn admin-btn-primary" onClick={() => setViewingGarden(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Garden Modal */}
      {editingGarden && (
        <div className="admin-modal-overlay" onClick={() => setEditingGarden(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3><FaEdit /> Edit Garden Information</h3>
              <button className="modal-close" onClick={() => setEditingGarden(null)}><FaTimes /></button>
            </div>
            <form onSubmit={handleSaveEditGarden} className="admin-modal-form" noValidate>
              <div className="form-group">
                <label>Garden Name</label>
                <input type="text" value={editingGarden.name} onChange={(e) => setEditingGarden({ ...editingGarden, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input type="text" value={editingGarden.location || ''} onChange={(e) => setEditingGarden({ ...editingGarden, location: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Size (Square Meters)</label>
                <input type="number" min="0" step="0.1" value={editingGarden.size || 0} onChange={(e) => setEditingGarden({ ...editingGarden, size: parseFloat(e.target.value) || 0 })} />
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-outline" onClick={() => setEditingGarden(null)}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn-primary"><FaCheck /> Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Plant Modal */}
      {viewingPlant && (
        <div className="admin-modal-overlay" onClick={() => setViewingPlant(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3><FaSeedling /> Plant Details</h3>
              <button className="modal-close" onClick={() => setViewingPlant(null)}><FaTimes /></button>
            </div>
            <div className="admin-modal-form">
              <div>
                <h4 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text)' }}>{viewingPlant.name}</h4>
                <em style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{viewingPlant.scientificName || 'No scientific name'}</em>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', padding: '1rem', background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div><label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>HEALTH STATUS</label><span className={`health-badge ${viewingPlant.health}`}>{viewingPlant.health}</span></div>
                <div><label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>GROWTH STAGE</label><span className="badge badge-secondary">{viewingPlant.status}</span></div>
                <div><label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>GARDEN</label><span>{viewingPlant.gardenId?.name || 'N/A'}</span></div>
                <div><label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>WATER FREQUENCY</label><span>Every {viewingPlant.waterFrequency !== undefined && viewingPlant.waterFrequency !== null ? viewingPlant.waterFrequency : 3} days</span></div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-outline" onClick={() => { setEditingPlant({ ...viewingPlant }); setViewingPlant(null); }}><FaEdit /> Edit Plant</button>
                <button type="button" className="admin-btn admin-btn-primary" onClick={() => setViewingPlant(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Plant Modal */}
      {editingPlant && (
        <div className="admin-modal-overlay" onClick={() => setEditingPlant(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3><FaEdit /> Edit Plant Attributes</h3>
              <button className="modal-close" onClick={() => setEditingPlant(null)}><FaTimes /></button>
            </div>
            <form onSubmit={handleSaveEditPlant} className="admin-modal-form" noValidate>
              <div className="form-group">
                <label>Plant Name</label>
                <input type="text" value={editingPlant.name} onChange={(e) => setEditingPlant({ ...editingPlant, name: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Health Condition</label>
                  <select value={editingPlant.health} onChange={(e) => setEditingPlant({ ...editingPlant, health: e.target.value })}>
                    <option value="healthy">Healthy</option>
                    <option value="warning">Warning</option>
                    <option value="unhealthy">Unhealthy</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Growth Stage</label>
                  <select value={editingPlant.status} onChange={(e) => setEditingPlant({ ...editingPlant, status: e.target.value })}>
                    <option value="seedling">Seedling</option>
                    <option value="growing">Growing</option>
                    <option value="mature">Mature</option>
                    <option value="harvested">Harvested</option>
                  </select>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-outline" onClick={() => setEditingPlant(null)}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn-primary"><FaCheck /> Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GardenManagement;

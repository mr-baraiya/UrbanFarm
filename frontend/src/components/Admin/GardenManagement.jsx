import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { useNotification } from '../../hooks/useNotification';
import ConfirmModal from '../Common/ConfirmModal';
import { validateGardenForm, validatePlantForm } from '../../utils/validators';
import AdminPagination from './AdminPagination';
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
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('gardens');
  const [gardens, setGardens] = useState([]);
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addNotification } = useNotification();

  // Pagination State for Gardens and Plants
  const [gardenPage, setGardenPage] = useState(1);
  const [gardenPageSize, setGardenPageSize] = useState(10);
  const [plantPage, setPlantPage] = useState(1);
  const [plantPageSize, setPlantPageSize] = useState(10);

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

  // Reset pagination on filter or tab change
  useEffect(() => {
    setGardenPage(1);
    setPlantPage(1);
  }, [search, healthFilter, statusFilter, activeTab]);

  const totalGardenPages = Math.max(1, Math.ceil(gardens.length / gardenPageSize));
  useEffect(() => {
    if (gardenPage > totalGardenPages) {
      setGardenPage(totalGardenPages);
    }
  }, [totalGardenPages, gardenPage]);

  const totalPlantPages = Math.max(1, Math.ceil(plants.length / plantPageSize));
  useEffect(() => {
    if (plantPage > totalPlantPages) {
      setPlantPage(totalPlantPages);
    }
  }, [totalPlantPages, plantPage]);

  const paginatedGardens = useMemo(() => {
    const startIdx = (gardenPage - 1) * gardenPageSize;
    return gardens.slice(startIdx, startIdx + gardenPageSize);
  }, [gardens, gardenPage, gardenPageSize]);

  const paginatedPlants = useMemo(() => {
    const startIdx = (plantPage - 1) * plantPageSize;
    return plants.slice(startIdx, startIdx + plantPageSize);
  }, [plants, plantPage, plantPageSize]);

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
      addNotification(t('admin.gardens.fetchFailed', 'Failed to fetch records'), 'error');
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
      title: t('admin.gardens.deleteGardenTitle', 'Delete Garden Space'),
      message: t(
        'admin.gardens.deleteGardenMsg',
        'Are you sure you want to permanently delete garden "{{name}}"? This action will also delete all associated plants.',
        { name }
      ),
      onConfirm: async () => {
        try {
          await api.delete(`/admin/gardens/${id}`);
          addNotification(t('admin.gardens.gardenDeletedSuccess', 'Garden deleted successfully'), 'success');
          fetchData();
        } catch (error) {
          addNotification(error.response?.data?.message || t('admin.gardens.gardenDeletedFailed', 'Failed to delete garden'), 'error');
        }
      },
    });
  };

  const promptDeletePlant = (id, name) => {
    setConfirmConfig({
      isOpen: true,
      title: t('admin.gardens.deletePlantTitle', 'Delete Plant Record'),
      message: t(
        'admin.gardens.deletePlantMsg',
        'Are you sure you want to delete plant "{{name}}" from the inventory?',
        { name }
      ),
      onConfirm: async () => {
        try {
          await api.delete(`/admin/plants/${id}`);
          addNotification(t('admin.gardens.plantDeletedSuccess', 'Plant deleted successfully'), 'success');
          fetchData();
        } catch (error) {
          addNotification(error.response?.data?.message || t('admin.gardens.plantDeletedFailed', 'Failed to delete plant'), 'error');
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
      addNotification(t('admin.gardens.gardenCreatedSuccess', 'New garden space created successfully!'), 'success');
      setShowCreateGardenModal(false);
      setNewGarden({ name: '', location: '', size: 0, description: '' });
      setGardenErrors({});
      fetchData();
    } catch (error) {
      addNotification(error.response?.data?.message || t('admin.gardens.gardenCreatedFailed', 'Failed to create garden'), 'error');
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
      addNotification(t('admin.gardens.plantCreatedSuccess', 'New plant added to inventory successfully!'), 'success');
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
      addNotification(error.response?.data?.message || t('admin.gardens.plantCreatedFailed', 'Failed to add plant'), 'error');
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
      addNotification(t('admin.gardens.gardenUpdatedSuccess', 'Garden updated successfully!'), 'success');
      setEditingGarden(null);
      fetchData();
    } catch (error) {
      addNotification(error.response?.data?.message || t('admin.gardens.gardenUpdatedFailed', 'Failed to update garden'), 'error');
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
      addNotification(t('admin.gardens.plantUpdatedSuccess', 'Plant details updated successfully!'), 'success');
      setEditingPlant(null);
      fetchData();
    } catch (error) {
      addNotification(error.response?.data?.message || t('admin.gardens.plantUpdatedFailed', 'Failed to update plant'), 'error');
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
      addNotification(
        t('admin.gardens.exportSuccess', '{{type}} exported successfully!', { type: type.toUpperCase() }),
        'success'
      );
    } catch (error) {
      addNotification(t('admin.gardens.exportFailed', 'Failed to export CSV'), 'error');
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
          <h2>{t('admin.gardens.title', 'Platform Gardens & Plants Database')}</h2>
          <p>{t('admin.gardens.subtitle', 'Monitor, search, view, edit, add new, and export all garden spaces and plant records.')}</p>
        </div>
        <div className="admin-header-actions">
          {activeTab === 'gardens' ? (
            <button className="admin-btn admin-btn-primary" onClick={() => setShowCreateGardenModal(true)}>
              <FaPlus /> {t('admin.gardens.addNewGarden', 'Add New Garden')}
            </button>
          ) : (
            <button className="admin-btn admin-btn-primary" onClick={() => setShowCreatePlantModal(true)}>
              <FaPlus /> {t('admin.gardens.addNewPlant', 'Add New Plant')}
            </button>
          )}
          <button className="admin-btn admin-btn-outline" onClick={() => handleExportCSV(activeTab)}>
            <FaFileCsv /> {t('admin.gardens.exportCSV', 'Export {{type}} CSV', { type: activeTab.toUpperCase() })}
          </button>
        </div>
      </div>

      <div className="admin-tab-row">
        <button
          className={`admin-tab-btn ${activeTab === 'gardens' ? 'active' : ''}`}
          onClick={() => setActiveTab('gardens')}
        >
          <FaTree /> {t('admin.gardens.gardensTab', 'Gardens Database')} ({gardens.length})
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'plants' ? 'active' : ''}`}
          onClick={() => setActiveTab('plants')}
        >
          <FaSeedling /> {t('admin.gardens.plantsTab', 'Plants Inventory')} ({plants.length})
        </button>
      </div>

      <div className="admin-filter-bar">
        <form onSubmit={handleSearchSubmit} className="admin-search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder={
              activeTab === 'gardens'
                ? t('admin.gardens.searchGardensPlaceholder', 'Search gardens by name or location...')
                : t('admin.gardens.searchPlantsPlaceholder', 'Search plants by name or variety...')
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="admin-btn admin-btn-sm">{t('admin.gardens.search', 'Search')}</button>
        </form>

        {activeTab === 'plants' && (
          <div className="admin-filters">
            <div className="filter-group">
              <FaFilter />
              <label>{t('admin.gardens.health', 'Health:')}</label>
              <select value={healthFilter} onChange={(e) => setHealthFilter(e.target.value)}>
                <option value="all">{t('admin.gardens.allHealth', 'All Health')}</option>
                <option value="healthy">{t('admin.gardens.healthStatus.healthy', 'Healthy')}</option>
                <option value="warning">{t('admin.gardens.healthStatus.warning', 'Warning')}</option>
                <option value="unhealthy">{t('admin.gardens.healthStatus.unhealthy', 'Unhealthy')}</option>
              </select>
            </div>
            <div className="filter-group">
              <label>{t('admin.gardens.status', 'Status:')}</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">{t('admin.gardens.allStages', 'All Growth Stages')}</option>
                <option value="seedling">{t('admin.gardens.stages.seedling', 'Seedling')}</option>
                <option value="growing">{t('admin.gardens.stages.growing', 'Growing')}</option>
                <option value="mature">{t('admin.gardens.stages.mature', 'Mature')}</option>
                <option value="harvested">{t('admin.gardens.stages.harvested', 'Harvested')}</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="admin-loading-spinner">{t('admin.gardens.loading', 'Loading database records...')}</div>
      ) : activeTab === 'gardens' ? (
        <div className="admin-table-wrapper">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>{t('admin.gardens.thGardenName', 'Garden Name')}</th>
                <th>{t('admin.gardens.thOwnerEmail', 'Owner Email')}</th>
                <th>{t('admin.gardens.thLocation', 'Location')}</th>
                <th>{t('admin.gardens.thSize', 'Size (m²)')}</th>
                <th>{t('admin.gardens.thPlantsCount', 'Plants Count')}</th>
                <th>{t('admin.gardens.thCreatedDate', 'Created Date')}</th>
                <th>{t('common.actions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {gardens.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">{t('admin.gardens.noGardensFound', 'No gardens found matching query.')}</td>
                </tr>
              ) : (
                paginatedGardens.map((g) => (
                  <tr key={g._id}>
                    <td><strong>{g.name}</strong></td>
                    <td>{g.userId?.email || t('admin.gardens.systemUser', 'System User')}</td>
                    <td>{g.location || 'N/A'}</td>
                    <td>{g.size || 0}</td>
                    <td><span className="badge badge-info">{t('admin.gardens.plantsCountBadge', '{{count}} Plants', { count: g.plants?.length || 0 })}</span></td>
                    <td>{new Date(g.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="action-btns">
                        <button className="admin-action-icon approve" title={t('admin.gardens.viewGardenDetails', 'View Garden Details')} onClick={() => setViewingGarden(g)}><FaEye /></button>
                        <button className="admin-action-icon edit" title={t('admin.gardens.editGarden', 'Edit Garden')} onClick={() => setEditingGarden({ ...g })}><FaEdit /></button>
                        <button className="admin-action-icon delete" title={t('admin.gardens.deleteGarden', 'Delete Garden')} onClick={() => promptDeleteGarden(g._id, g.name)}><FaTrash /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <AdminPagination
            currentPage={gardenPage}
            totalItems={gardens.length}
            pageSize={gardenPageSize}
            onPageChange={setGardenPage}
            onPageSizeChange={setGardenPageSize}
          />
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>{t('admin.gardens.thPlantName', 'Plant Name')}</th>
                <th>{t('admin.gardens.thScientificName', 'Scientific Name')}</th>
                <th>{t('admin.gardens.thGarden', 'Garden')}</th>
                <th>{t('admin.gardens.thOwner', 'Owner')}</th>
                <th>{t('admin.gardens.thHealth', 'Health')}</th>
                <th>{t('admin.gardens.thGrowthStage', 'Growth Stage')}</th>
                <th>{t('common.actions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {plants.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">{t('admin.gardens.noPlantsFound', 'No plants found matching filter.')}</td>
                </tr>
              ) : (
                paginatedPlants.map((p) => (
                  <tr key={p._id}>
                    <td><strong>{p.name}</strong></td>
                    <td><em>{p.scientificName || 'N/A'}</em></td>
                    <td>{p.gardenId?.name || 'N/A'}</td>
                    <td>{p.userId?.email || 'N/A'}</td>
                    <td>
                      <span className={`health-badge ${p.health}`}>
                        {p.health === 'healthy' && <FaCheckCircle />}
                        {p.health === 'warning' && <FaExclamationTriangle />}
                        {t(`admin.gardens.healthStatus.${p.health}`, p.health)}
                      </span>
                    </td>
                    <td><span className="badge badge-secondary">{t(`admin.gardens.stages.${p.status}`, p.status)}</span></td>
                    <td>
                      <div className="action-btns">
                        <button className="admin-action-icon approve" title={t('admin.gardens.viewPlantDetails', 'View Plant Details')} onClick={() => setViewingPlant(p)}><FaEye /></button>
                        <button className="admin-action-icon edit" title={t('admin.gardens.editPlant', 'Edit Plant')} onClick={() => setEditingPlant({ ...p })}><FaEdit /></button>
                        <button className="admin-action-icon delete" title={t('admin.gardens.deletePlant', 'Delete Plant')} onClick={() => promptDeletePlant(p._id, p.name)}><FaTrash /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <AdminPagination
            currentPage={plantPage}
            totalItems={plants.length}
            pageSize={plantPageSize}
            onPageChange={setPlantPage}
            onPageSizeChange={setPlantPageSize}
          />
        </div>
      )}

      {/* Create New Garden Modal */}
      {showCreateGardenModal && (
        <div className="admin-modal-overlay" onClick={() => setShowCreateGardenModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3><FaPlus /> {t('admin.gardens.addGardenModalTitle', 'Add New Garden Space')}</h3>
              <button className="modal-close" onClick={() => setShowCreateGardenModal(false)}><FaTimes /></button>
            </div>
            <form onSubmit={handleCreateGarden} className="admin-modal-form" noValidate>
              <div className="form-group">
                <label>{t('admin.gardens.gardenName', 'Garden Name')} <span className="required">*</span></label>
                <input
                  type="text"
                  placeholder={t('admin.gardens.gardenNamePlaceholder', 'e.g. Rooftop Vegetable Bed')}
                  value={newGarden.name}
                  onChange={(e) => setNewGarden({ ...newGarden, name: e.target.value })}
                  className={gardenErrors.name ? 'input-error' : ''}
                />
                {gardenErrors.name && <span className="error-text"><FaExclamationCircle /> {gardenErrors.name}</span>}
              </div>
              <div className="form-group">
                <label>{t('admin.gardens.location', 'Location')}</label>
                <input
                  type="text"
                  placeholder={t('admin.gardens.locationPlaceholder', 'e.g. South Balcony, Raised Bed #2')}
                  value={newGarden.location}
                  onChange={(e) => setNewGarden({ ...newGarden, location: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>{t('admin.gardens.sizeSqMeters', 'Size (Square Meters)')}</label>
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
                <label>{t('admin.gardens.description', 'Description')}</label>
                <textarea
                  style={{ padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', minHeight: '70px' }}
                  placeholder={t('admin.gardens.descPlaceholder', 'Describe soil type, light exposure, or bed notes...')}
                  value={newGarden.description}
                  onChange={(e) => setNewGarden({ ...newGarden, description: e.target.value })}
                />
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-outline" onClick={() => setShowCreateGardenModal(false)}>{t('common.cancel', 'Cancel')}</button>
                <button type="submit" className="admin-btn admin-btn-primary"><FaCheck /> {t('admin.gardens.createGardenBtn', 'Create Garden')}</button>
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
              <h3><FaPlus /> {t('admin.gardens.addPlantModalTitle', 'Add New Plant Record')}</h3>
              <button className="modal-close" onClick={() => setShowCreatePlantModal(false)}><FaTimes /></button>
            </div>
            <form onSubmit={handleCreatePlant} className="admin-modal-form" noValidate>
              <div className="form-group">
                <label>{t('admin.gardens.plantName', 'Plant Name')} <span className="required">*</span></label>
                <input
                  type="text"
                  placeholder={t('admin.gardens.plantNamePlaceholder', 'e.g. Cherry Tomato')}
                  value={newPlant.name}
                  onChange={(e) => setNewPlant({ ...newPlant, name: e.target.value })}
                  className={plantErrors.name ? 'input-error' : ''}
                />
                {plantErrors.name && <span className="error-text"><FaExclamationCircle /> {plantErrors.name}</span>}
              </div>
              <div className="form-group">
                <label>{t('admin.gardens.assignedGardenSpace', 'Assigned Garden Space')} <span className="required">*</span></label>
                <select
                  value={newPlant.gardenId}
                  onChange={(e) => setNewPlant({ ...newPlant, gardenId: e.target.value })}
                  className={plantErrors.gardenId ? 'input-error' : ''}
                >
                  <option value="">{t('admin.gardens.selectTargetGarden', '-- Select Target Garden --')}</option>
                  {gardens.map((g) => (
                    <option key={g._id} value={g._id}>{g.name} ({g.userId?.email || t('admin.gardens.systemUser', 'System')})</option>
                  ))}
                </select>
                {plantErrors.gardenId && <span className="error-text"><FaExclamationCircle /> {plantErrors.gardenId}</span>}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>{t('admin.gardens.scientificName', 'Scientific Name')}</label>
                  <input
                    type="text"
                    placeholder={t('admin.gardens.sciNamePlaceholder', 'e.g. Solanum lycopersicum')}
                    value={newPlant.scientificName}
                    onChange={(e) => setNewPlant({ ...newPlant, scientificName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>{t('admin.gardens.variety', 'Variety')}</label>
                  <input
                    type="text"
                    placeholder={t('admin.gardens.varietyPlaceholder', 'e.g. Sweet 100')}
                    value={newPlant.variety}
                    onChange={(e) => setNewPlant({ ...newPlant, variety: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>{t('admin.gardens.healthCondition', 'Health Condition')}</label>
                  <select value={newPlant.health} onChange={(e) => setNewPlant({ ...newPlant, health: e.target.value })}>
                    <option value="healthy">{t('admin.gardens.healthStatus.healthy', 'Healthy')}</option>
                    <option value="warning">{t('admin.gardens.healthStatus.warning', 'Warning')}</option>
                    <option value="unhealthy">{t('admin.gardens.healthStatus.unhealthy', 'Unhealthy')}</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>{t('admin.gardens.growthStage', 'Growth Stage')}</label>
                  <select value={newPlant.status} onChange={(e) => setNewPlant({ ...newPlant, status: e.target.value })}>
                    <option value="seedling">{t('admin.gardens.stages.seedling', 'Seedling')}</option>
                    <option value="growing">{t('admin.gardens.stages.growing', 'Growing')}</option>
                    <option value="mature">{t('admin.gardens.stages.mature', 'Mature')}</option>
                    <option value="harvested">{t('admin.gardens.stages.harvested', 'Harvested')}</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>{t('admin.gardens.sunlightNeed', 'Sunlight Need')}</label>
                  <select value={newPlant.sunlight} onChange={(e) => setNewPlant({ ...newPlant, sunlight: e.target.value })}>
                    <option value="full">{t('admin.gardens.sunlight.full', 'Full Sun')}</option>
                    <option value="partial">{t('admin.gardens.sunlight.partial', 'Partial Sun')}</option>
                    <option value="shade">{t('admin.gardens.sunlight.shade', 'Shade')}</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>{t('admin.gardens.waterFrequencyDays', 'Water Frequency (Days)')}</label>
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
                <button type="button" className="admin-btn admin-btn-outline" onClick={() => setShowCreatePlantModal(false)}>{t('common.cancel', 'Cancel')}</button>
                <button type="submit" className="admin-btn admin-btn-primary"><FaCheck /> {t('admin.gardens.createPlantBtn', 'Create Plant')}</button>
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
              <h3><FaTree /> {t('admin.gardens.gardenSpaceDetails', 'Garden Space Details')}</h3>
              <button className="modal-close" onClick={() => setViewingGarden(null)}><FaTimes /></button>
            </div>
            <div className="admin-modal-form">
              <div>
                <h4 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text)' }}>{viewingGarden.name}</h4>
                <p style={{ margin: '0.25rem 0', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{viewingGarden.description || t('admin.gardens.noDescProvided', 'No description provided.')}</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', padding: '1rem', background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div><label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>{t('admin.gardens.labelLocation', 'LOCATION')}</label><strong><FaMapMarkerAlt style={{ color: 'var(--sage)' }} /> {viewingGarden.location || 'N/A'}</strong></div>
                <div><label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>{t('admin.gardens.labelSize', 'SIZE')}</label><strong><FaRulerCombined style={{ color: 'var(--sage)' }} /> {viewingGarden.size || 0} m²</strong></div>
                <div><label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>{t('admin.gardens.labelOwner', 'OWNER')}</label><span>{viewingGarden.userId?.name || t('auth.gardener', 'User')} ({viewingGarden.userId?.email || 'N/A'})</span></div>
                <div><label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>{t('admin.gardens.labelTotalPlants', 'TOTAL PLANTS')}</label><span className="badge badge-info">{t('admin.gardens.plantsCountBadge', '{{count}} Plants', { count: viewingGarden.plants?.length || 0 })}</span></div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-outline" onClick={() => { setEditingGarden({ ...viewingGarden }); setViewingGarden(null); }}><FaEdit /> {t('admin.gardens.editGarden', 'Edit Garden')}</button>
                <button type="button" className="admin-btn admin-btn-primary" onClick={() => setViewingGarden(null)}>{t('common.close', 'Close')}</button>
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
              <h3><FaEdit /> {t('admin.gardens.editGardenInfo', 'Edit Garden Information')}</h3>
              <button className="modal-close" onClick={() => setEditingGarden(null)}><FaTimes /></button>
            </div>
            <form onSubmit={handleSaveEditGarden} className="admin-modal-form" noValidate>
              <div className="form-group">
                <label>{t('admin.gardens.gardenName', 'Garden Name')}</label>
                <input type="text" value={editingGarden.name} onChange={(e) => setEditingGarden({ ...editingGarden, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>{t('admin.gardens.location', 'Location')}</label>
                <input type="text" value={editingGarden.location || ''} onChange={(e) => setEditingGarden({ ...editingGarden, location: e.target.value })} />
              </div>
              <div className="form-group">
                <label>{t('admin.gardens.sizeSqMeters', 'Size (Square Meters)')}</label>
                <input type="number" min="0" step="0.1" value={editingGarden.size || 0} onChange={(e) => setEditingGarden({ ...editingGarden, size: parseFloat(e.target.value) || 0 })} />
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-outline" onClick={() => setEditingGarden(null)}>{t('common.cancel', 'Cancel')}</button>
                <button type="submit" className="admin-btn admin-btn-primary"><FaCheck /> {t('common.saveChanges', 'Save Changes')}</button>
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
              <h3><FaSeedling /> {t('admin.gardens.plantDetails', 'Plant Details')}</h3>
              <button className="modal-close" onClick={() => setViewingPlant(null)}><FaTimes /></button>
            </div>
            <div className="admin-modal-form">
              <div>
                <h4 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text)' }}>{viewingPlant.name}</h4>
                <em style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{viewingPlant.scientificName || t('admin.gardens.noSciName', 'No scientific name')}</em>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', padding: '1rem', background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div><label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>{t('admin.gardens.labelHealthStatus', 'HEALTH STATUS')}</label><span className={`health-badge ${viewingPlant.health}`}>{t(`admin.gardens.healthStatus.${viewingPlant.health}`, viewingPlant.health)}</span></div>
                <div><label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>{t('admin.gardens.labelGrowthStage', 'GROWTH STAGE')}</label><span className="badge badge-secondary">{t(`admin.gardens.stages.${viewingPlant.status}`, viewingPlant.status)}</span></div>
                <div><label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>{t('admin.gardens.labelGarden', 'GARDEN')}</label><span>{viewingPlant.gardenId?.name || 'N/A'}</span></div>
                <div><label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>{t('admin.gardens.labelWaterFreq', 'WATER FREQUENCY')}</label><span>{t('admin.gardens.waterFrequencyEvery', 'Every {{days}} days', { days: viewingPlant.waterFrequency !== undefined && viewingPlant.waterFrequency !== null ? viewingPlant.waterFrequency : 3 })}</span></div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-outline" onClick={() => { setEditingPlant({ ...viewingPlant }); setViewingPlant(null); }}><FaEdit /> {t('admin.gardens.editPlant', 'Edit Plant')}</button>
                <button type="button" className="admin-btn admin-btn-primary" onClick={() => setViewingPlant(null)}>{t('common.close', 'Close')}</button>
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
              <h3><FaEdit /> {t('admin.gardens.editPlantAttributes', 'Edit Plant Attributes')}</h3>
              <button className="modal-close" onClick={() => setEditingPlant(null)}><FaTimes /></button>
            </div>
            <form onSubmit={handleSaveEditPlant} className="admin-modal-form" noValidate>
              <div className="form-group">
                <label>{t('admin.gardens.plantName', 'Plant Name')}</label>
                <input type="text" value={editingPlant.name} onChange={(e) => setEditingPlant({ ...editingPlant, name: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>{t('admin.gardens.healthCondition', 'Health Condition')}</label>
                  <select value={editingPlant.health} onChange={(e) => setEditingPlant({ ...editingPlant, health: e.target.value })}>
                    <option value="healthy">{t('admin.gardens.healthStatus.healthy', 'Healthy')}</option>
                    <option value="warning">{t('admin.gardens.healthStatus.warning', 'Warning')}</option>
                    <option value="unhealthy">{t('admin.gardens.healthStatus.unhealthy', 'Unhealthy')}</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>{t('admin.gardens.growthStage', 'Growth Stage')}</label>
                  <select value={editingPlant.status} onChange={(e) => setEditingPlant({ ...editingPlant, status: e.target.value })}>
                    <option value="seedling">{t('admin.gardens.stages.seedling', 'Seedling')}</option>
                    <option value="growing">{t('admin.gardens.stages.growing', 'Growing')}</option>
                    <option value="mature">{t('admin.gardens.stages.mature', 'Mature')}</option>
                    <option value="harvested">{t('admin.gardens.stages.harvested', 'Harvested')}</option>
                  </select>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-outline" onClick={() => setEditingPlant(null)}>{t('common.cancel', 'Cancel')}</button>
                <button type="submit" className="admin-btn admin-btn-primary"><FaCheck /> {t('common.saveChanges', 'Save Changes')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GardenManagement;

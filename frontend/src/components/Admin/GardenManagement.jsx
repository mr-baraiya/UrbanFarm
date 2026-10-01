import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  FaSeedling,
  FaSearch,
  FaFileCsv,
  FaTrash,
  FaEye,
  FaFilter,
  FaTree,
  FaExclamationTriangle,
  FaCheckCircle,
} from 'react-icons/fa';
import './GardenManagement.css';

const GardenManagement = () => {
  const [activeTab, setActiveTab] = useState('gardens');
  const [gardens, setGardens] = useState([]);
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [healthFilter, setHealthFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

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
        const res = await api.get(
          `/admin/plants?search=${search}&health=${healthFilter}&status=${statusFilter}`
        );
        setPlants(res.data.plants || []);
      }
    } catch (error) {
      console.error('Failed to fetch admin garden/plant data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleDeleteGarden = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete garden "${name}"? This will also remove all associated plants.`)) {
      try {
        await api.delete(`/admin/gardens/${id}`);
        fetchData();
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete garden');
      }
    }
  };

  const handleDeletePlant = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete plant "${name}"?`)) {
      try {
        await api.delete(`/admin/plants/${id}`);
        fetchData();
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete plant');
      }
    }
  };

  const handleExportCSV = async (type) => {
    try {
      const response = await api.get(`/admin/export/${type}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `urbanfarm_${type}_export.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Failed to export CSV');
    }
  };

  return (
    <div className="garden-mgmt-container">
      <div className="admin-page-header">
        <div>
          <h2>Platform Gardens & Plants Database</h2>
          <p>Monitor, search, manage, and export all garden spaces and plant records.</p>
        </div>
        <div className="admin-header-actions">
          <button
            className="admin-btn admin-btn-outline"
            onClick={() => handleExportCSV(activeTab)}
          >
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
          <button type="submit" className="admin-btn admin-btn-sm">
            Search
          </button>
        </form>

        {activeTab === 'plants' && (
          <div className="admin-filters">
            <div className="filter-group">
              <FaFilter />
              <label>Health:</label>
              <select
                value={healthFilter}
                onChange={(e) => setHealthFilter(e.target.value)}
              >
                <option value="all">All Health</option>
                <option value="healthy">Healthy</option>
                <option value="warning">Warning</option>
                <option value="unhealthy">Unhealthy</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
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
                  <td colSpan="7" className="text-center py-4">
                    No gardens found matching query.
                  </td>
                </tr>
              ) : (
                gardens.map((g) => (
                  <tr key={g._id}>
                    <td>
                      <strong>{g.name}</strong>
                    </td>
                    <td>{g.userId?.email || 'System User'}</td>
                    <td>{g.location || 'N/A'}</td>
                    <td>{g.size || 0}</td>
                    <td>
                      <span className="badge badge-info">
                        {g.plants?.length || 0} Plants
                      </span>
                    </td>
                    <td>{new Date(g.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="admin-action-icon delete"
                        title="Delete Garden"
                        onClick={() => handleDeleteGarden(g._id, g.name)}
                      >
                        <FaTrash />
                      </button>
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
                  <td colSpan="7" className="text-center py-4">
                    No plants found matching filter.
                  </td>
                </tr>
              ) : (
                plants.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <strong>{p.name}</strong>
                    </td>
                    <td>
                      <em>{p.scientificName || 'N/A'}</em>
                    </td>
                    <td>{p.gardenId?.name || 'N/A'}</td>
                    <td>{p.userId?.email || 'N/A'}</td>
                    <td>
                      <span className={`health-badge ${p.health}`}>
                        {p.health === 'healthy' && <FaCheckCircle />}
                        {p.health === 'warning' && <FaExclamationTriangle />}
                        {p.health}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-secondary">{p.status}</span>
                    </td>
                    <td>
                      <button
                        className="admin-action-icon delete"
                        title="Delete Plant"
                        onClick={() => handleDeletePlant(p._id, p.name)}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default GardenManagement;

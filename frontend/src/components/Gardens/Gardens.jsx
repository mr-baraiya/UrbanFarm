import React, { useState, useEffect } from 'react';
import { 
  RiPlantLine, 
  RiDownload2Line, 
  RiAddLine, 
  RiSearchLine, 
  RiArrowLeftSLine, 
  RiArrowRightSLine 
} from 'react-icons/ri';
import { getGardens, createGarden, updateGarden, deleteGarden } from '../../services/plantService';
import { getWeather } from '../../services/weatherService';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import ConfirmModal from '../Common/ConfirmModal';
import GardenCard from './GardenCard';
import GardenForm from './GardenForm';
import GardenFilters from './GardenFilters';
import GardenLayoutModal from './GardenLayoutModal';
import EmptyGardens from './EmptyGardens';
import './Gardens.css';

const Gardens = () => {
  const { user } = useAuth();
  const [gardens, setGardens] = useState([]);
  const [filteredGardens, setFilteredGardens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGarden, setEditingGarden] = useState(null);
  const [layoutGarden, setLayoutGarden] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [weatherMap, setWeatherMap] = useState({});
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const gardensPerPage = 9;

  // Custom Confirm Modal state
  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const { addNotification } = useNotification();

  useEffect(() => {
    loadGardens();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [gardens, searchTerm, filterType]);

  const loadGardens = async () => {
    setLoading(true);
    try {
      const data = await getGardens();
      setGardens(data || []);
      // Load weather for gardens with location
      loadWeatherForGardens(data || []);
    } catch (error) {
      console.error('Failed to load gardens:', error);
      addNotification('Failed to load gardens', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadWeatherForGardens = async (gardensList) => {
    setWeatherLoading(true);
    const weatherData = {};
    
    // Group gardens by location to avoid duplicate API calls
    const locations = [...new Set(gardensList.map(g => g.location || user?.location?.city).filter(Boolean))];
    
    await Promise.all(
      locations.map(async (loc) => {
        try {
          const w = await getWeather(loc);
          weatherData[loc] = w;
        } catch (err) {
          console.error(`Failed to fetch weather for ${loc}:`, err);
        }
      })
    );
    
    setWeatherMap(weatherData);
    setWeatherLoading(false);
  };

  const applyFilters = () => {
    let result = [...gardens];

    // Filter by type
    if (filterType !== 'all') {
      result = result.filter(g => g.type === filterType);
    }

    // Filter by search term (name or location)
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(g => 
        g.name.toLowerCase().includes(term) ||
        (g.location && g.location.toLowerCase().includes(term)) ||
        (g.description && g.description.toLowerCase().includes(term))
      );
    }

    setFilteredGardens(result);
    setCurrentPage(1);
  };

  const handleCreateGarden = async (formData) => {
    try {
      const newGarden = await createGarden(formData);
      setGardens([...gardens, newGarden]);
      addNotification('Garden created successfully!', 'success');
      setShowForm(false);
      // Fetch weather if location provided
      if (newGarden.location) {
        loadWeatherForGardens([...gardens, newGarden]);
      }
    } catch (error) {
      addNotification('Failed to create garden', 'error');
    }
  };

  const handleUpdateGarden = async (id, formData) => {
    try {
      const updated = await updateGarden(id, formData);
      setGardens(gardens.map(g => g._id === id ? updated : g));
      addNotification('Garden updated!', 'success');
      setEditingGarden(null);
      if (updated.location) {
        loadWeatherForGardens(gardens.map(g => g._id === id ? updated : g));
      }
    } catch (error) {
      addNotification('Failed to update garden', 'error');
    }
  };

  const promptDeleteGarden = (id) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Delete Garden',
      message: 'Are you sure you want to delete this garden? All plant associations will be cleared.',
      onConfirm: async () => {
        try {
          await deleteGarden(id);
          setGardens(gardens.filter(g => g._id !== id));
          addNotification('Garden deleted successfully', 'success');
        } catch (error) {
          addNotification('Failed to delete garden', 'error');
        }
      },
    });
  };

  const handleExportData = (format) => {
    if (gardens.length === 0) {
      addNotification('No garden records to export', 'error');
      return;
    }
    if (format === 'json') {
      const jsonStr = JSON.stringify(gardens, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `urbanfarm_gardens_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      addNotification('Exported gardens as JSON!', 'success');
    } else if (format === 'csv') {
      const headers = ['Name', 'Type', 'Location', 'Size (m2)', 'Sunlight', 'Soil Type', 'Created Date'];
      const rows = gardens.map(g => [
        `"${(g.name || '').replace(/"/g, '""')}"`,
        g.type || 'balcony',
        `"${(g.location || '').replace(/"/g, '""')}"`,
        g.size || 0,
        g.sunlight || 'full',
        g.soilType || 'potting_mix',
        new Date(g.createdAt).toLocaleDateString()
      ]);
      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `urbanfarm_gardens_${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      addNotification('Exported gardens as CSV!', 'success');
    }
  };

  const getGardenWeather = (gardenId) => {
    const garden = gardens.find(g => g._id === gardenId);
    if (!garden) return null;
    const loc = garden.location || user?.location?.city;
    return loc ? weatherMap[loc] : null;
  };

  if (loading) {
    return <div className="gardens-loading">Loading your gardens...</div>;
  }

  if (gardens.length === 0 && !showForm) {
    return <EmptyGardens onCreateClick={() => setShowForm(true)} />;
  }

  return (
    <div className="gardens-page">
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
      />
      {/* Header */}
      <div className="gardens-header">
        <div className="header-left">
          <h2>
            <RiPlantLine className="gardens-header-icon" /> My Gardens
          </h2>
          <span className="garden-count">{gardens.length} gardens</span>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={() => handleExportData('csv')}>
            <RiDownload2Line /> Export CSV
          </button>
          <button className="btn-secondary" onClick={() => handleExportData('json')}>
            <RiDownload2Line /> Export JSON
          </button>
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            <RiAddLine /> New Garden
          </button>
        </div>
      </div>

      {/* Filters & Controls */}
      <GardenFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterType={filterType}
        onFilterChange={setFilterType}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalGardens={filteredGardens.length}
      />

      {/* Gardens Grid/List */}
      {filteredGardens.length === 0 ? (
        <div className="no-results">
          <span className="no-results-icon">
            <RiSearchLine />
          </span>
          <h3>No gardens found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      ) : (
        <>
          <div className={`gardens-container ${viewMode}`}>
            {filteredGardens.slice((currentPage - 1) * gardensPerPage, currentPage * gardensPerPage).map((garden) => (
              <GardenCard
                key={garden._id}
                garden={garden}
                viewMode={viewMode}
                onEdit={() => setEditingGarden(garden)}
                onDelete={() => promptDeleteGarden(garden._id)}
                onOpenLayout={() => setLayoutGarden(garden)}
                weather={getGardenWeather(garden._id)}
                weatherLoading={weatherLoading}
              />
            ))}
          </div>

          {/* Pagination */}
          {Math.ceil(filteredGardens.length / gardensPerPage) > 1 && (
            <div className="pagination-bar" style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
              <button 
                className="btn-secondary" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              >
                <RiArrowLeftSLine /> Prev
              </button>
              <span style={{ display: 'flex', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Page {currentPage} of {Math.ceil(filteredGardens.length / gardensPerPage)}
              </span>
              <button 
                className="btn-secondary" 
                disabled={currentPage === Math.ceil(filteredGardens.length / gardensPerPage)}
                onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredGardens.length / gardensPerPage), p + 1))}
              >
                Next <RiArrowRightSLine />
              </button>
            </div>
          )}
        </>
      )}

      {/* Create/Edit Modal */}
      {showForm && (
        <GardenForm
          onClose={() => setShowForm(false)}
          onSubmit={handleCreateGarden}
        />
      )}

      {editingGarden && (
        <GardenForm
          garden={editingGarden}
          onClose={() => setEditingGarden(null)}
          onSubmit={(data) => handleUpdateGarden(editingGarden._id, data)}
        />
      )}

      {layoutGarden && (
        <GardenLayoutModal
          garden={layoutGarden}
          onClose={() => setLayoutGarden(null)}
          onGardenUpdated={loadGardens}
        />
      )}
    </div>
  );
};

export default Gardens;
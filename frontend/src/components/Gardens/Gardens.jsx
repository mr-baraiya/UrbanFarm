import React, { useState, useEffect } from 'react';
import { getGardens, createGarden, deleteGarden, updateGarden } from '../../services/plantService';
import { getWeather } from '../../services/weatherService';
import { useNotification } from '../../hooks/useNotification';
import { useAuth } from '../../hooks/useAuth';
import GardenForm from './GardenForm';
import GardenCard from './GardenCard';
import GardenFilters from './GardenFilters';
import EmptyGardens from './EmptyGardens';
import './Gardens.css';

const Gardens = () => {
  const { user } = useAuth();
  const [gardens, setGardens] = useState([]);
  const [filteredGardens, setFilteredGardens] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingGarden, setEditingGarden] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [weatherData, setWeatherData] = useState({});
  const [weatherLoading, setWeatherLoading] = useState(false);
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
      
      // Fetch weather for each garden with location
      const gardensWithLocation = data.filter(g => g.location);
      if (gardensWithLocation.length > 0) {
        setWeatherLoading(true);
        const weatherPromises = gardensWithLocation.map(async (garden) => {
          try {
            const weather = await getWeather(garden.location);
            return { gardenId: garden._id, weather };
          } catch (error) {
            console.error(`Failed to fetch weather for ${garden.location}:`, error);
            return { gardenId: garden._id, weather: null };
          }
        });
        
        const results = await Promise.all(weatherPromises);
        const weatherMap = {};
        results.forEach(result => {
          weatherMap[result.gardenId] = result.weather;
        });
        setWeatherData(weatherMap);
        setWeatherLoading(false);
      }
    } catch (error) {
      console.error('Failed to load gardens:', error);
      addNotification('Failed to load gardens', 'error');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...gardens];
    
    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(g => 
        g.name.toLowerCase().includes(term) || 
        (g.location && g.location.toLowerCase().includes(term))
      );
    }
    
    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(g => g.type === filterType);
    }
    
    setFilteredGardens(filtered);
  };

  const handleCreateGarden = async (gardenData) => {
    try {
      const newGarden = await createGarden(gardenData);
      setGardens([...gardens, newGarden]);
      addNotification('Garden created successfully! 🌿', 'success');
      setShowForm(false);
    } catch (error) {
      addNotification('Failed to create garden', 'error');
    }
  };

  const handleUpdateGarden = async (id, data) => {
    try {
      const updated = await updateGarden(id, data);
      setGardens(gardens.map(g => g._id === id ? updated : g));
      addNotification('Garden updated!', 'success');
      setEditingGarden(null);
    } catch (error) {
      addNotification('Failed to update garden', 'error');
    }
  };

  const handleDeleteGarden = async (id) => {
    if (!window.confirm('Are you sure you want to delete this garden? This action cannot be undone.')) return;
    try {
      await deleteGarden(id);
      setGardens(gardens.filter(g => g._id !== id));
      addNotification('Garden deleted', 'success');
    } catch (error) {
      addNotification('Failed to delete garden', 'error');
    }
  };

  const getGardenWeather = (gardenId) => {
    return weatherData[gardenId] || null;
  };

  if (loading) {
    return <div className="gardens-loading">Loading your gardens...</div>;
  }

  if (gardens.length === 0 && !showForm) {
    return <EmptyGardens onCreateClick={() => setShowForm(true)} />;
  }

  return (
    <div className="gardens-page">
      {/* Header */}
      <div className="gardens-header">
        <div className="header-left">
          <h2>🌿 My Gardens</h2>
          <span className="garden-count">{gardens.length} gardens</span>
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            + New Garden
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
          <span className="no-results-icon">🔍</span>
          <h3>No gardens found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className={`gardens-container ${viewMode}`}>
          {filteredGardens.map((garden) => (
            <GardenCard
              key={garden._id}
              garden={garden}
              viewMode={viewMode}
              onEdit={() => setEditingGarden(garden)}
              onDelete={() => handleDeleteGarden(garden._id)}
              weather={getGardenWeather(garden._id)}
              weatherLoading={weatherLoading}
            />
          ))}
        </div>
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
    </div>
  );
};

export default Gardens;
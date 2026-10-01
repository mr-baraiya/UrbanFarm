import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getPlants, getGardens, addPlant, deletePlant, updatePlant } from '../../services/plantService';
import { useNotification } from '../../hooks/useNotification';
import PlantCard from './PlantCard';
import PlantForm from '../GrowthTracker/PlantForm';
import PlantFilters from './PlantFilters';
import EmptyPlants from './EmptyPlants';
import BulkActions from './BulkActions';
import './Plants.css';

const Plants = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const gardenIdParam = searchParams.get('garden');
  const actionParam = searchParams.get('action');
  
  const [plants, setPlants] = useState([]);
  const [filteredPlants, setFilteredPlants] = useState([]);
  const [gardens, setGardens] = useState([]);
  const [selectedGarden, setSelectedGarden] = useState(gardenIdParam || '');
  const [showForm, setShowForm] = useState(actionParam === 'add');
  const [editingPlant, setEditingPlant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [selectedPlants, setSelectedPlants] = useState([]);
  const [selectMode, setSelectMode] = useState(false);
  const { addNotification } = useNotification();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [plants, searchTerm, selectedGarden, filterStatus, filterType, sortBy]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [plantsData, gardensData] = await Promise.all([
        getPlants(),
        getGardens(),
      ]);
      setPlants(plantsData || []);
      setGardens(gardensData || []);
    } catch (error) {
      console.error('Failed to load data:', error);
      addNotification('Failed to load plants', 'error');
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...plants];
    
    // Garden filter
    if (selectedGarden) {
      filtered = filtered.filter(p => p.gardenId?._id === selectedGarden || p.gardenId === selectedGarden);
    }
    
    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(term) || 
        (p.variety && p.variety.toLowerCase().includes(term)) ||
        (p.scientificName && p.scientificName.toLowerCase().includes(term))
      );
    }
    
    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(p => p.status === filterStatus);
    }
    
    // Type filter (if we had a type field, but we'll use variety or status)
    if (filterType !== 'all') {
      // This could filter by plant type/category
      // For now, we'll skip this or implement based on available data
    }
    
    // Sort
    switch (sortBy) {
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'recent':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'health':
        const healthOrder = { healthy: 0, warning: 1, unhealthy: 2 };
        filtered.sort((a, b) => (healthOrder[a.health] || 0) - (healthOrder[b.health] || 0));
        break;
      case 'status':
        const statusOrder = { seedling: 0, growing: 1, mature: 2, harvested: 3, dead: 4 };
        filtered.sort((a, b) => (statusOrder[a.status] || 0) - (statusOrder[b.status] || 0));
        break;
      default:
        break;
    }
    
    setFilteredPlants(filtered);
  };

  const handleAddPlant = async (plantData) => {
    try {
      const newPlant = await addPlant(plantData);
      setPlants([...plants, newPlant]);
      addNotification('Plant added successfully! 🌱', 'success');
      setShowForm(false);
    } catch (error) {
      addNotification('Failed to add plant', 'error');
    }
  };

  const handleUpdatePlant = async (id, data) => {
    try {
      const updated = await updatePlant(id, data);
      setPlants(plants.map(p => p._id === id ? updated : p));
      addNotification('Plant updated!', 'success');
      setEditingPlant(null);
    } catch (error) {
      addNotification('Failed to update plant', 'error');
    }
  };

  const handleDeletePlant = async (id) => {
    if (!window.confirm('Delete this plant?')) return;
    try {
      await deletePlant(id);
      setPlants(plants.filter(p => p._id !== id));
      addNotification('Plant deleted', 'success');
    } catch (error) {
      addNotification('Failed to delete plant', 'error');
    }
  };

  const handleBulkAction = async (action, data) => {
    switch (action) {
      case 'delete':
        if (!window.confirm(`Delete ${selectedPlants.length} plants?`)) return;
        try {
          await Promise.all(selectedPlants.map(id => deletePlant(id)));
          setPlants(plants.filter(p => !selectedPlants.includes(p._id)));
          addNotification(`Deleted ${selectedPlants.length} plants`, 'success');
          setSelectedPlants([]);
          setSelectMode(false);
        } catch (error) {
          addNotification('Bulk delete failed', 'error');
        }
        break;
      case 'water':
        // Log watering for selected plants
        addNotification(`Watered ${selectedPlants.length} plants`, 'success');
        setSelectedPlants([]);
        setSelectMode(false);
        break;
      case 'move':
        if (!data) return;
        try {
          await Promise.all(selectedPlants.map(id => updatePlant(id, { gardenId: data })));
          loadData();
          addNotification(`Moved ${selectedPlants.length} plants`, 'success');
          setSelectedPlants([]);
          setSelectMode(false);
        } catch (error) {
          addNotification('Move failed', 'error');
        }
        break;
      default:
        break;
    }
  };

  const handleViewDetails = (plantId) => {
    navigate(`/app/plants/${plantId}`);
  };

  const handleQuickWater = async (plantId) => {
    try {
      // Log watering - you can implement this with a watering log
      addNotification('💧 Watering logged!', 'success');
      // You could also update lastWatered timestamp here
    } catch (error) {
      addNotification('Failed to log watering', 'error');
    }
  };

  const handleQuickDiagnose = (plantId) => {
    navigate(`/app/diagnose?plant=${plantId}`);
  };

  if (loading) {
    return <div className="plants-loading">Loading your plants...</div>;
  }

  if (plants.length === 0 && !showForm) {
    return (
      <EmptyPlants 
        onCreateClick={() => setShowForm(true)} 
        gardenName={gardens.find(g => g._id === selectedGarden)?.name}
      />
    );
  }

  return (
    <div className="plants-page">
      {/* Header */}
      <div className="plants-header">
        <div className="header-left">
          <h2>🌱 My Plants</h2>
          <span className="plant-count">{filteredPlants.length} plants</span>
        </div>
        <div className="header-actions">
          {selectedPlants.length > 0 && (
            <BulkActions
              selectedCount={selectedPlants.length}
              onAction={handleBulkAction}
              gardens={gardens}
              onCancel={() => {
                setSelectedPlants([]);
                setSelectMode(false);
              }}
            />
          )}
          <button 
            className="btn-primary" 
            onClick={() => setShowForm(true)}
          >
            + Add Plant
          </button>
        </div>
      </div>

      {/* Filters */}
      <PlantFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedGarden={selectedGarden}
        onGardenChange={setSelectedGarden}
        filterStatus={filterStatus}
        onStatusChange={setFilterStatus}
        filterType={filterType}
        onTypeChange={setFilterType}
        sortBy={sortBy}
        onSortChange={setSortBy}
        gardens={gardens}
        selectMode={selectMode}
        onSelectModeToggle={() => {
          setSelectMode(!selectMode);
          if (selectMode) setSelectedPlants([]);
        }}
        totalPlants={filteredPlants.length}
      />

      {/* Plants Grid */}
      {filteredPlants.length === 0 ? (
        <div className="no-results">
          <span className="no-results-icon">🔍</span>
          <h3>No plants found</h3>
          <p>Try adjusting your search or filters</p>
          <button className="btn-secondary" onClick={() => {
            setSearchTerm('');
            setSelectedGarden('');
            setFilterStatus('all');
          }}>
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="plants-grid">
          {filteredPlants.map((plant) => (
            <PlantCard
              key={plant._id}
              plant={plant}
              selectMode={selectMode}
              isSelected={selectedPlants.includes(plant._id)}
              onSelect={(id) => {
                if (selectedPlants.includes(id)) {
                  setSelectedPlants(selectedPlants.filter(p => p !== id));
                } else {
                  setSelectedPlants([...selectedPlants, id]);
                }
              }}
              onEdit={() => setEditingPlant(plant)}
              onDelete={() => handleDeletePlant(plant._id)}
              onViewDetails={() => handleViewDetails(plant._id)}
              onQuickWater={() => handleQuickWater(plant._id)}
              onQuickDiagnose={() => handleQuickDiagnose(plant._id)}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showForm && (
        <PlantForm
          onClose={() => setShowForm(false)}
          onSubmit={handleAddPlant}
          gardens={gardens}
          selectedGardenId={selectedGarden}
        />
      )}

      {editingPlant && (
        <PlantForm
          plant={editingPlant}
          onClose={() => setEditingPlant(null)}
          onSubmit={(data) => handleUpdatePlant(editingPlant._id, data)}
          gardens={gardens}
        />
      )}
    </div>
  );
};

export default Plants;
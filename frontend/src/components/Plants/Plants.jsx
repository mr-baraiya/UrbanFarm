import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  RiDownload2Line, 
  RiAddLine, 
  RiSearchLine, 
  RiArrowLeftSLine, 
  RiArrowRightSLine 
} from 'react-icons/ri';
import { TbPlant2 } from 'react-icons/tb';
import { getPlants, getGardens, addPlant, deletePlant, updatePlant } from '../../services/plantService';
import { useNotification } from '../../hooks/useNotification';
import ConfirmModal from '../Common/ConfirmModal';
import QRCodeModal from '../Common/QRCodeModal';
import HarvestTrackerModal from './HarvestTrackerModal';
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
  const [activeQRPlant, setActiveQRPlant] = useState(null);
  const [activeHarvestPlant, setActiveHarvestPlant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [selectedPlants, setSelectedPlants] = useState([]);
  const [selectMode, setSelectMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const plantsPerPage = 12;

  // Custom Confirm Modal state
  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

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
    
    if (selectedGarden) {
      filtered = filtered.filter(p => p.gardenId?._id === selectedGarden || p.gardenId === selectedGarden);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(term) || 
        (p.variety && p.variety.toLowerCase().includes(term)) ||
        (p.scientificName && p.scientificName.toLowerCase().includes(term))
      );
    }
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(p => p.status === filterStatus);
    }
    
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
    setCurrentPage(1);
  };

  const handleAddPlant = async (plantData) => {
    try {
      const newPlant = await addPlant(plantData);
      setPlants([...plants, newPlant]);
      addNotification('Plant added successfully!', 'success');
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

  const handleExportData = (format) => {
    if (plants.length === 0) {
      addNotification('No plant data to export', 'error');
      return;
    }
    if (format === 'json') {
      const jsonStr = JSON.stringify(plants, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `urbanfarm_plants_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      addNotification('Exported plant records as JSON!', 'success');
    } else if (format === 'csv') {
      const headers = ['Name', 'Variety', 'Scientific Name', 'Status', 'Health', 'Garden', 'Water Frequency', 'Created Date'];
      const rows = plants.map(p => [
        `"${(p.name || '').replace(/"/g, '""')}"`,
        `"${(p.variety || '').replace(/"/g, '""')}"`,
        `"${(p.scientificName || '').replace(/"/g, '""')}"`,
        p.status || 'growing',
        p.health || 'healthy',
        `"${(p.gardenId?.name || '').replace(/"/g, '""')}"`,
        p.waterFrequency !== undefined && p.waterFrequency !== null ? p.waterFrequency : 3,
        new Date(p.createdAt).toLocaleDateString()
      ]);
      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `urbanfarm_plants_${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      addNotification('Exported plant records as CSV!', 'success');
    }
  };

  const promptDeletePlant = (id) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Delete Plant Record',
      message: 'Are you sure you want to delete this plant from your garden?',
      onConfirm: async () => {
        try {
          await deletePlant(id);
          setPlants(plants.filter((p) => p._id !== id));
          addNotification('Plant deleted successfully', 'success');
        } catch (error) {
          addNotification('Failed to delete plant', 'error');
        }
      },
    });
  };

  const handleBulkAction = async (action, data) => {
    switch (action) {
      case 'delete':
        setConfirmConfig({
          isOpen: true,
          title: 'Bulk Delete Plants',
          message: `Are you sure you want to delete ${selectedPlants.length} selected plants?`,
          onConfirm: async () => {
            try {
              await Promise.all(selectedPlants.map((id) => deletePlant(id)));
              setPlants(plants.filter((p) => !selectedPlants.includes(p._id)));
              addNotification(`Deleted ${selectedPlants.length} plants`, 'success');
              setSelectedPlants([]);
              setSelectMode(false);
            } catch (error) {
              addNotification('Bulk delete failed', 'error');
            }
          },
        });
        break;
      case 'water':
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
      addNotification('Watering logged!', 'success');
    } catch (error) {
      addNotification('Failed to log watering', 'error');
    }
  };

  const handleQuickDiagnose = (plantId) => {
    navigate(`/app/diagnose?plant=${plantId}`);
  };

  // Pagination calculation
  const indexOfLastPlant = currentPage * plantsPerPage;
  const indexOfFirstPlant = indexOfLastPlant - plantsPerPage;
  const currentPlants = filteredPlants.slice(indexOfFirstPlant, indexOfLastPlant);
  const totalPages = Math.ceil(filteredPlants.length / plantsPerPage);

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
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
      />

      {/* Header */}
      <div className="plants-header">
        <div className="header-left">
          <h2>
            <TbPlant2 className="plants-title-icon" /> My Plants
          </h2>
          <span className="plant-count">{filteredPlants.length} plants</span>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={() => handleExportData('csv')}>
            <RiDownload2Line /> Export CSV
          </button>
          <button className="btn-secondary" onClick={() => handleExportData('json')}>
            <RiDownload2Line /> Export JSON
          </button>
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
            <RiAddLine /> Add Plant
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
          <span className="no-results-icon">
            <RiSearchLine />
          </span>
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
        <>
          <div className="plants-grid">
            {currentPlants.map((plant) => (
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
                onDelete={() => promptDeletePlant(plant._id)}
                onViewDetails={() => handleViewDetails(plant._id)}
                onQuickWater={() => handleQuickWater(plant._id)}
                onQuickDiagnose={() => handleQuickDiagnose(plant._id)}
                onShowQR={() => setActiveQRPlant(plant)}
                onLogHarvest={() => setActiveHarvestPlant(plant)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination-bar" style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
              <button 
                className="btn-secondary" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              >
                <RiArrowLeftSLine /> Prev
              </button>
              <span style={{ display: 'flex', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Page {currentPage} of {totalPages}
              </span>
              <button 
                className="btn-secondary" 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              >
                Next <RiArrowRightSLine />
              </button>
            </div>
          )}
        </>
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

      {/* QR Code Modal */}
      {activeQRPlant && (
        <QRCodeModal
          plant={activeQRPlant}
          onClose={() => setActiveQRPlant(null)}
        />
      )}

      {/* Harvest Tracker Modal */}
      {activeHarvestPlant && (
        <HarvestTrackerModal
          plant={activeHarvestPlant}
          onClose={() => setActiveHarvestPlant(null)}
          onHarvestLogged={loadData}
        />
      )}
    </div>
  );
};

export default Plants;
import React, { useState, useEffect } from 'react';
import { getPlants } from '../../services/plantService';
import PlantForm from './PlantForm';
import TimelineView from './TimelineView';
import './GrowthTracker.css';

const GrowthTracker = () => {
  const [plants, setPlants] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadPlants();
  }, []);

  const loadPlants = async () => {
    try {
      const data = await getPlants();
      setPlants(data);
    } catch (error) {
      console.error('Failed to load plants', error);
    }
  };

  const handleAddPlant = () => {
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    loadPlants();
  };

  return (
    <div className="growth-tracker">
      <div className="tracker-header">
        <h2>🌱 Growth Tracker</h2>
        <button className="btn-primary" onClick={handleAddPlant}>
          + Add Plant
        </button>
      </div>
      <div className="plant-list">
        {plants.map((p) => (
          <div
            key={p._id}
            className={`plant-card ${selectedPlant?._id === p._id ? 'selected' : ''}`}
            onClick={() => setSelectedPlant(p)}
          >
            <div className="plant-avatar">{p.name[0]}</div>
            <div className="plant-info">
              <h4>{p.name}</h4>
              <span className="status-badge" style={{ background: '#a8d5ba' }}>
                {p.status}
              </span>
            </div>
          </div>
        ))}
      </div>
      {selectedPlant && <TimelineView plant={selectedPlant} onUpdate={loadPlants} />}
      {showForm && <PlantForm onClose={handleFormClose} />}
    </div>
  );
};

export default GrowthTracker;
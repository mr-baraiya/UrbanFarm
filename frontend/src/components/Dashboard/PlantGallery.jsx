import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PlantGallery.css';

const PlantGallery = ({ plants }) => {
  const navigate = useNavigate();

  if (!plants || plants.length === 0) {
    return (
      <div className="plant-gallery">
        <h3>🌱 Your Plants</h3>
        <div className="empty-gallery">
          <span className="empty-icon">🌱</span>
          <p>No plants yet. Add your first plant!</p>
          <button className="btn-primary" onClick={() => navigate('/app/plants')}>
            Add Plant
          </button>
        </div>
      </div>
    );
  }

  // Get status color
  const getStatusColor = (status) => {
    const map = {
      seedling: '#f0e8dc',
      growing: '#a8d5ba',
      mature: '#f0d5c0',
      harvested: '#d4b8a0',
      dead: '#c9b0a0',
    };
    return map[status] || '#b8a9c9';
  };

  // Get health indicator
  const getHealthIndicator = (health) => {
    const map = {
      healthy: '🟢',
      warning: '🟡',
      unhealthy: '🔴',
    };
    return map[health] || '🟢';
  };

  return (
    <div className="plant-gallery">
      <div className="gallery-header">
        <h3>🌱 Your Plants</h3>
        <span className="plant-count">{plants.length} plants</span>
      </div>
      <div className="gallery-scroll">
        {plants.slice(0, 6).map((plant) => (
          <div 
            key={plant._id} 
            className="gallery-item"
            onClick={() => navigate(`/app/plants?plant=${plant._id}`)}
          >
            <div className="plant-thumbnail" style={{ background: getStatusColor(plant.status) }}>
              {plant.imageUrl ? (
                <img src={plant.imageUrl} alt={plant.name} />
              ) : (
                <span className="plant-emoji">🌱</span>
              )}
            </div>
            <div className="plant-info">
              <span className="plant-name">{plant.name}</span>
              <div className="plant-meta">
                <span className="plant-status">{plant.status}</span>
                <span className="plant-health">{getHealthIndicator(plant.health)}</span>
              </div>
            </div>
          </div>
        ))}
        {plants.length > 6 && (
          <div className="gallery-more" onClick={() => navigate('/app/plants')}>
            <span>+{plants.length - 6} more</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlantGallery;
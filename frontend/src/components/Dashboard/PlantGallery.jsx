import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RiPlantLine, RiAddLine } from 'react-icons/ri';
import { TbPlant2 } from 'react-icons/tb';
import { getPlantImage } from '../../utils/helpers';
import './PlantGallery.css';

const PlantGallery = ({ plants }) => {
  const navigate = useNavigate();

  if (!plants || plants.length === 0) {
    return (
      <div className="plant-gallery">
        <h3>
          <TbPlant2 className="gallery-header-icon" /> Your Plants
        </h3>
        <div className="empty-gallery">
          <div className="empty-icon-wrap">
            <TbPlant2 />
          </div>
          <p>No plants yet. Add your first plant!</p>
          <button className="btn-primary" onClick={() => navigate('/app/plants')}>
            <RiAddLine /> Add Plant
          </button>
        </div>
      </div>
    );
  }

  // Get status color
  const getStatusColor = (status) => {
    const map = {
      seedling: 'rgba(240, 232, 220, 0.8)',
      growing: 'rgba(168, 213, 186, 0.6)',
      mature: 'rgba(240, 213, 192, 0.7)',
      harvested: 'rgba(212, 184, 160, 0.7)',
      dead: 'rgba(201, 176, 160, 0.5)',
    };
    return map[status] || 'rgba(184, 169, 201, 0.5)';
  };

  return (
    <div className="plant-gallery">
      <div className="gallery-header">
        <h3>
          <TbPlant2 className="gallery-header-icon" /> Your Plants
        </h3>
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
              {getPlantImage(plant) ? (
                <img src={getPlantImage(plant)} alt={plant.name} loading="lazy" />
              ) : (
                <TbPlant2 className="plant-svg-thumb" />
              )}
            </div>
            <div className="plant-info">
              <span className="plant-name">{plant.name}</span>
              <div className="plant-meta">
                <span className="plant-status">{plant.status}</span>
                <span 
                  className={`plant-health-dot ${plant.health || 'healthy'}`} 
                  title={`Health: ${plant.health || 'healthy'}`} 
                />
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
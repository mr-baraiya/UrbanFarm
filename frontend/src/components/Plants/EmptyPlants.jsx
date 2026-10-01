import React from 'react';
import './EmptyPlants.css';

const EmptyPlants = ({ onCreateClick, gardenName }) => {
  return (
    <div className="empty-plants">
      <div className="empty-content">
        <div className="empty-illustration">
          <span className="empty-icon">🌱</span>
          <div className="growing-plants">
            <span className="plant-sprout">🌿</span>
            <span className="plant-sprout">🌱</span>
            <span className="plant-sprout">🌿</span>
          </div>
        </div>
        <h2>No plants found{gardenName ? ` in "${gardenName}"` : ''}</h2>
        <p>
          {gardenName 
            ? `Your garden "${gardenName}" is empty. Let's get growing!` 
            : 'You haven\'t added any plants yet. Let\'s get growing!'}
        </p>
        <div className="empty-actions">
          <button className="btn-primary" onClick={onCreateClick}>
            + Add Your First Plant
          </button>
          <button className="btn-secondary" onClick={() => window.location.href = '/app/gardens'}>
            📍 View Gardens
          </button>
        </div>
        <div className="empty-tips">
          <h4>💡 Quick tips for starting your urban garden:</h4>
          <ul>
            <li>Start with easy-to-grow plants like herbs (basil, mint)</li>
            <li>Match plants to your available sunlight</li>
            <li>Use good quality potting soil with drainage</li>
            <li>Water consistently but don't overwater</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EmptyPlants;
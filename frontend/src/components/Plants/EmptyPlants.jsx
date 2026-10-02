import React from 'react';
import { RiPlantLine, RiAddLine, RiMapPin2Line, RiLightbulbLine } from 'react-icons/ri';
import { TbPlant2 } from 'react-icons/tb';
import './EmptyPlants.css';

const EmptyPlants = ({ onCreateClick, gardenName }) => {
  return (
    <div className="empty-plants">
      <div className="empty-content">
        <div className="empty-illustration">
          <div className="empty-icon-wrap">
            <RiPlantLine className="main-empty-svg" />
          </div>
          <div className="growing-plants">
            <TbPlant2 className="pot-svg" />
            <TbPlant2 className="pot-svg center" />
            <TbPlant2 className="pot-svg" />
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
            <RiAddLine /> Add Your First Plant
          </button>
          <button className="btn-secondary" onClick={() => window.location.href = '/app/gardens'}>
            <RiMapPin2Line /> View Gardens
          </button>
        </div>
        <div className="empty-tips">
          <h4>
            <RiLightbulbLine className="tip-icon" /> Quick tips for starting your urban garden:
          </h4>
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
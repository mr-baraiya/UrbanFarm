import React from 'react';
import { RiPlantLine, RiAddLine, RiDashboardLine, RiLightbulbLine } from 'react-icons/ri';
import { TbPlant2 } from 'react-icons/tb';
import './EmptyGardens.css';

const EmptyGardens = ({ onCreateClick }) => {
  return (
    <div className="empty-gardens">
      <div className="empty-content">
        <div className="empty-illustration">
          <div className="empty-icon-wrap">
            <RiPlantLine className="main-empty-svg" />
          </div>
          <div className="plant-pots">
            <TbPlant2 className="pot-svg" />
            <TbPlant2 className="pot-svg center" />
            <TbPlant2 className="pot-svg" />
          </div>
        </div>
        <h2>You haven't added any gardens yet</h2>
        <p>
          Set up your first balcony, rooftop, or backyard plot to start tracking 
          your urban farming journey!
        </p>
        <div className="empty-actions">
          <button className="btn-primary" onClick={onCreateClick}>
            <RiAddLine /> Create First Garden
          </button>
          <button className="btn-secondary" onClick={() => window.location.href = '/app/dashboard'}>
            <RiDashboardLine /> Go to Dashboard
          </button>
        </div>
        <div className="empty-tips">
          <h4>
            <RiLightbulbLine className="tip-icon" /> Tips for your first garden:
          </h4>
          <ul>
            <li>Start small with a balcony or windowsill garden</li>
            <li>Choose plants that match your sunlight conditions</li>
            <li>Use good quality potting soil for best results</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EmptyGardens;
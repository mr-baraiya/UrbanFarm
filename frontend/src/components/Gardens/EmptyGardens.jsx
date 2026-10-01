import React from 'react';
import './EmptyGardens.css';

const EmptyGardens = ({ onCreateClick }) => {
  return (
    <div className="empty-gardens">
      <div className="empty-content">
        <div className="empty-illustration">
          <span className="empty-icon">🌱</span>
          <div className="plant-pots">
            <span className="pot">🪴</span>
            <span className="pot">🪴</span>
            <span className="pot">🪴</span>
          </div>
        </div>
        <h2>You haven't added any gardens yet</h2>
        <p>
          Set up your first balcony, rooftop, or backyard plot to start tracking 
          your urban farming journey!
        </p>
        <div className="empty-actions">
          <button className="btn-primary" onClick={onCreateClick}>
            + Create First Garden
          </button>
          <button className="btn-secondary" onClick={() => window.location.href = '/app/dashboard'}>
            Go to Dashboard
          </button>
        </div>
        <div className="empty-tips">
          <h4>💡 Tips for your first garden:</h4>
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
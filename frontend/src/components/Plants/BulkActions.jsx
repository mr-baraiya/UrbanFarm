import React, { useState } from 'react';
import './BulkActions.css';

const BulkActions = ({ selectedCount, onAction, gardens, onCancel }) => {
  const [showMoveMenu, setShowMoveMenu] = useState(false);

  return (
    <div className="bulk-actions">
      <span className="bulk-count">{selectedCount} selected</span>
      <div className="bulk-buttons">
        <button 
          className="bulk-btn water"
          onClick={() => onAction('water')}
          title="Water selected plants"
        >
          💧 Water
        </button>
        <div className="bulk-move-wrapper">
          <button 
            className="bulk-btn move"
            onClick={() => setShowMoveMenu(!showMoveMenu)}
            title="Move selected plants"
          >
            📦 Move
          </button>
          {showMoveMenu && (
            <div className="move-dropdown">
              {gardens.map(g => (
                <button 
                  key={g._id}
                  onClick={() => {
                    onAction('move', g._id);
                    setShowMoveMenu(false);
                  }}
                >
                  📍 {g.name}
                </button>
              ))}
            </div>
          )}
        </div>
        <button 
          className="bulk-btn delete"
          onClick={() => onAction('delete')}
          title="Delete selected plants"
        >
          🗑️
        </button>
        <button 
          className="bulk-btn cancel"
          onClick={onCancel}
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default BulkActions;
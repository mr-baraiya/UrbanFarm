import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PlantForm from '../GrowthTracker/PlantForm';
import DiagnoseTab from '../Diagnose/DiagnoseTab';
import './QuickActions.css';

const QuickActions = ({ onActionComplete }) => {
  const navigate = useNavigate();
  const [showPlantForm, setShowPlantForm] = useState(false);
  const [showDiagnose, setShowDiagnose] = useState(false);

  const actions = [
    { 
      id: 'add-plant', 
      label: 'Add Plant', 
      icon: '🌱', 
      color: '#a8d5ba',
      action: () => setShowPlantForm(true)
    },
    { 
      id: 'diagnose', 
      label: 'Diagnose Leaf', 
      icon: '🔬', 
      color: '#d6eaf8',
      action: () => navigate('/app/diagnose')
    },
    { 
      id: 'watering', 
      label: 'Log Watering', 
      icon: '💧', 
      color: '#d6eaf8',
      action: () => navigate('/app/watering')
    },
    { 
      id: 'schedule', 
      label: 'Add Task', 
      icon: '📅', 
      color: '#f0d5c0',
      action: () => navigate('/app/schedule')
    },
  ];

  return (
    <>
      <div className="quick-actions">
        <h3>⚡ Quick Actions</h3>
        <div className="actions-grid">
          {actions.map((action) => (
            <button
              key={action.id}
              className="action-btn"
              style={{ '--action-color': action.color }}
              onClick={action.action}
            >
              <span className="action-icon">{action.icon}</span>
              <span className="action-label">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {showPlantForm && (
        <PlantForm 
          onClose={() => {
            setShowPlantForm(false);
            onActionComplete();
          }}
        />
      )}
    </>
  );
};

export default QuickActions;
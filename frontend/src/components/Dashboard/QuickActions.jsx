import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  RiFlashlightLine, 
  RiMicroscopeLine, 
  RiDropLine, 
  RiCalendarEventLine 
} from 'react-icons/ri';
import { TbPlant2 } from 'react-icons/tb';
import PlantForm from '../GrowthTracker/PlantForm';
import './QuickActions.css';

const QuickActions = ({ onActionComplete }) => {
  const navigate = useNavigate();
  const [showPlantForm, setShowPlantForm] = useState(false);

  const actions = [
    { 
      id: 'add-plant', 
      label: 'Add Plant', 
      icon: <TbPlant2 />, 
      color: '#2d6a4f',
      bg: '#dcfce7',
      action: () => setShowPlantForm(true)
    },
    { 
      id: 'diagnose', 
      label: 'Diagnose Leaf', 
      icon: <RiMicroscopeLine />, 
      color: '#7c3aed',
      bg: '#f3e8ff',
      action: () => navigate('/app/diagnose')
    },
    { 
      id: 'watering', 
      label: 'Log Watering', 
      icon: <RiDropLine />, 
      color: '#0284c7',
      bg: '#e0f2fe',
      action: () => navigate('/app/watering')
    },
    { 
      id: 'schedule', 
      label: 'Add Task', 
      icon: <RiCalendarEventLine />, 
      color: '#d97706',
      bg: '#ffedd5',
      action: () => navigate('/app/schedule')
    },
  ];

  return (
    <>
      <div className="quick-actions">
        <h3>
          <RiFlashlightLine className="qa-header-icon" /> Quick Actions
        </h3>
        <div className="actions-grid">
          {actions.map((action) => (
            <button
              key={action.id}
              className="action-btn"
              style={{ 
                '--action-color': action.color,
                '--action-bg': action.bg 
              }}
              onClick={action.action}
            >
              <div className="action-icon-box">
                {action.icon}
              </div>
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
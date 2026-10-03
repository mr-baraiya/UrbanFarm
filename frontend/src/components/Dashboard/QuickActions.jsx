import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showPlantForm, setShowPlantForm] = useState(false);

  const actions = [
    { 
      id: 'add-plant', 
      labelKey: 'dashboard.addPlant', 
      icon: <TbPlant2 />, 
      color: '#52b788',
      action: () => setShowPlantForm(true)
    },
    { 
      id: 'diagnose', 
      labelKey: 'dashboard.diagnosePlant', 
      icon: <RiMicroscopeLine />, 
      color: '#8b5cf6',
      action: () => navigate('/app/diagnose')
    },
    { 
      id: 'watering', 
      labelKey: 'dashboard.logWatering', 
      icon: <RiDropLine />, 
      color: '#0ea5e9',
      action: () => navigate('/app/watering')
    },
    { 
      id: 'schedule', 
      labelKey: 'dashboard.addTask', 
      icon: <RiCalendarEventLine />, 
      color: '#f59e0b',
      action: () => navigate('/app/schedule')
    },
  ];

  return (
    <>
      <div className="quick-actions">
        <h3>
          <RiFlashlightLine className="qa-header-icon" /> {t('dashboard.quickActions')}
        </h3>
        <div className="actions-grid">
          {actions.map((action) => (
            <button
              key={action.id}
              className="action-btn"
              style={{ '--action-color': action.color }}
              onClick={action.action}
            >
              <span className="action-icon">{action.icon}</span>
              <span className="action-label">{t(action.labelKey)}</span>
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
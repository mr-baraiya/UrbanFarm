import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RiDropLine, RiFolderTransferLine, RiDeleteBinLine, RiCloseLine, RiMapPin2Line } from 'react-icons/ri';
import { getLocalizedDynamicText } from '../../utils/localizationHelper';
import './BulkActions.css';

const BulkActions = ({ selectedCount, onAction, gardens, onCancel }) => {
  const { t, i18n } = useTranslation();
  const [showMoveMenu, setShowMoveMenu] = useState(false);

  return (
    <div className="bulk-actions">
      <span className="bulk-count">
        {t('plants.selectedCount', '{{count}} selected', { count: selectedCount })}
      </span>
      <div className="bulk-buttons">
        <button 
          className="bulk-btn water"
          onClick={() => onAction('water')}
          title={t('plants.quickWater', 'Water selected plants')}
        >
          <RiDropLine className="bulk-icon blue" /> {t('plants.water', 'Water')}
        </button>
        <div className="bulk-move-wrapper">
          <button 
            className="bulk-btn move"
            onClick={() => setShowMoveMenu(!showMoveMenu)}
            title={t('plants.move', 'Move selected plants')}
          >
            <RiFolderTransferLine className="bulk-icon amber" /> {t('plants.move', 'Move')}
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
                  <RiMapPin2Line className="map-icon" /> {getLocalizedDynamicText(g.name, i18n.language)}
                </button>
              ))}
            </div>
          )}
        </div>
        <button 
          className="bulk-btn delete"
          onClick={() => onAction('delete')}
          title={t('common.delete', 'Delete selected plants')}
          aria-label={t('common.delete', 'Delete selected plants')}
        >
          <RiDeleteBinLine />
        </button>
        <button 
          className="bulk-btn cancel"
          onClick={onCancel}
          title={t('common.cancel', 'Cancel selection')}
          aria-label={t('common.cancel', 'Cancel selection')}
        >
          <RiCloseLine />
        </button>
      </div>
    </div>
  );
};

export default BulkActions;
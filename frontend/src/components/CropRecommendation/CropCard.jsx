import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getLocalizedDynamicText } from '../../utils/localizationHelper';
import './CropCard.css';

const CropCard = ({ crop, spaceAvailable, existingPlants = [], onAddToPlants }) => {
  const { t, i18n } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  // Determine container suitability
  const getContainerSuitability = (cropName) => {
    const containerFriendly = ['tomato', 'pepper', 'lettuce', 'basil', 'mint', 'chili', 'eggplant', 'strawberry', 'herbs'];
    const deepRoot = ['carrot', 'potato', 'onion', 'garlic', 'parsnip'];
    
    const name = (cropName || '').toLowerCase();
    if (containerFriendly.some(c => name.includes(c))) {
      return { label: t('crops.greatForContainers', 'Container Friendly'), color: '#2d6a4f', bg: '#cce3de' };
    }
    if (deepRoot.some(c => name.includes(c))) {
      return { label: t('crops.needsDeepRoot', 'Needs Deep Bed'), color: '#92400e', bg: '#fef3c7' };
    }
    return { label: t('crops.adaptable', 'Adaptable Space'), color: '#1f3a30', bg: '#eaf4f4' };
  };

  const containerSuitability = getContainerSuitability(crop.cropName);

  // Get space suitability
  const getSpaceSuitability = () => {
    const spaceMap = {
      small: { label: t('crops.spaceSmallDesc', 'Compact Space'), color: '#2d6a4f', bg: '#cce3de' },
      medium: { label: t('crops.spaceMediumDesc', 'Medium Garden'), color: '#1f3a30', bg: '#eaf4f4' },
      large: { label: t('crops.spaceLargeDesc', 'Needs Wide Space'), color: '#92400e', bg: '#fef3c7' },
    };
    return spaceMap[spaceAvailable] || spaceMap.medium;
  };

  const spaceSuitability = getSpaceSuitability();

  const localizedCropName = getLocalizedDynamicText(crop.cropName, i18n.language);
  const confidencePercent = Math.round((crop.confidence || 0.85) * 100);

  return (
    <div className="crop-card">
      <div className="crop-card-header">
        <div className="crop-title-group">
          <span className="crop-badge-category">AI Recommendation</span>
          <h3 className="crop-name">{localizedCropName}</h3>
        </div>
        <div className="crop-confidence-pill">
          {confidencePercent}% match
        </div>
      </div>

      <div className="crop-tags-row">
        <span 
          className="crop-tag" 
          style={{ color: containerSuitability.color, backgroundColor: containerSuitability.bg }}
        >
          {containerSuitability.label}
        </span>
        <span 
          className="crop-tag" 
          style={{ color: spaceSuitability.color, backgroundColor: spaceSuitability.bg }}
        >
          {spaceSuitability.label}
        </span>
      </div>

      {/* Soil Compatibility Spotlight */}
      {crop.soilSuitability && (
        <div className="crop-soil-badge-box">
          <span className="crop-soil-label">Soil Fit:</span>
          <p className="crop-soil-text">{crop.soilSuitability}</p>
        </div>
      )}

      {/* Primary Reason */}
      <p className="crop-reason-text">{crop.reason}</p>

      {/* Expected Yield */}
      {crop.expectedYield && (
        <div className="crop-yield-row">
          <span className="crop-meta-title">Expected Yield:</span>
          <span className="crop-meta-value">{crop.expectedYield}</span>
        </div>
      )}

      {/* Expandable Planting Tips */}
      {crop.plantingTips && (
        <div className="crop-tips-accordion">
          <button 
            type="button" 
            className="crop-tips-toggle" 
            onClick={() => setExpanded(!expanded)}
          >
            <span>{t('crops.plantingTips', 'Planting & Care Guide')}</span>
            <span className="toggle-symbol">{expanded ? '▲' : '▼'}</span>
          </button>
          {expanded && (
            <div className="crop-tips-content">
              <p>{crop.plantingTips}</p>
            </div>
          )}
        </div>
      )}

      <div className="crop-card-footer">
        {onAddToPlants && (
          <button 
            type="button" 
            className="crop-add-btn"
            onClick={onAddToPlants}
          >
            {t('crops.addToGarden', 'Add to My Garden')}
          </button>
        )}
      </div>
    </div>
  );
};

export default CropCard;
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, Sprout, Scale, BookOpen, ChevronUp, ChevronDown, Plus } from 'lucide-react';
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
      return { label: t('crops.greatForContainers', 'Great for Containers'), color: '#065f46', bg: '#ecfdf5', border: '#a7f3d0' };
    }
    if (deepRoot.some(c => name.includes(c))) {
      return { label: t('crops.needsDeepRoot', 'Needs Deep Bed'), color: '#92400e', bg: '#fffbeb', border: '#fde68a' };
    }
    return { label: t('crops.adaptable', 'Adaptable Space'), color: '#1e3a8a', bg: '#eff6ff', border: '#bfdbfe' };
  };

  const containerSuitability = getContainerSuitability(crop.cropName);

  // Get space suitability
  const getSpaceSuitability = () => {
    const spaceMap = {
      small: { label: t('crops.spaceSmallDesc', 'Compact Space'), color: '#065f46', bg: '#ecfdf5', border: '#a7f3d0' },
      medium: { label: t('crops.spaceMediumDesc', 'Medium Garden'), color: '#1f3a30', bg: '#eaf4f4', border: '#cce3de' },
      large: { label: t('crops.spaceLargeDesc', 'Needs Wide Space'), color: '#92400e', bg: '#fffbeb', border: '#fde68a' },
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
          <div className="crop-badge-category">
            <Sparkles size={13} className="category-icon" />
            <span>{t('crops.title', 'AI Crop Choice')}</span>
          </div>
          <h3 className="crop-name">{localizedCropName}</h3>
        </div>
        <div className="crop-confidence-pill">
          <span className="confidence-dot" />
          {confidencePercent}% {t('crops.match', 'match')}
        </div>
      </div>

      <div className="crop-tags-row">
        <span 
          className="crop-tag" 
          style={{ 
            color: containerSuitability.color, 
            backgroundColor: containerSuitability.bg,
            borderColor: containerSuitability.border
          }}
        >
          {containerSuitability.label}
        </span>
        <span 
          className="crop-tag" 
          style={{ 
            color: spaceSuitability.color, 
            backgroundColor: spaceSuitability.bg,
            borderColor: spaceSuitability.border
          }}
        >
          {spaceSuitability.label}
        </span>
      </div>

      {/* Soil Compatibility Spotlight */}
      {crop.soilSuitability && (
        <div className="crop-soil-badge-box">
          <div className="crop-soil-label">
            <Sprout size={13} className="soil-label-icon" />
            <span>{t('crops.soilFit', 'Soil Fit:')}</span>
          </div>
          <p className="crop-soil-text">{getLocalizedDynamicText(crop.soilSuitability, i18n.language)}</p>
        </div>
      )}

      {/* Primary Reason */}
      {crop.reason && (
        <p className="crop-reason-text">{getLocalizedDynamicText(crop.reason, i18n.language)}</p>
      )}

      {/* Expected Yield */}
      {crop.expectedYield && (
        <div className="crop-yield-row">
          <div className="crop-yield-header">
            <Scale size={13} className="yield-icon" />
            <span className="crop-meta-title">{t('crops.expectedYield', 'Expected Yield:')}</span>
          </div>
          <span className="crop-meta-value">{getLocalizedDynamicText(crop.expectedYield, i18n.language)}</span>
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
            <div className="tips-toggle-left">
              <BookOpen size={14} className="guide-icon" />
              <span>{t('crops.plantingTips', 'Planting & Care Guide')}</span>
            </div>
            {expanded ? <ChevronUp size={15} className="toggle-symbol" /> : <ChevronDown size={15} className="toggle-symbol" />}
          </button>
          {expanded && (
            <div className="crop-tips-content">
              <p>{getLocalizedDynamicText(crop.plantingTips, i18n.language)}</p>
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
            <Plus size={16} />
            <span>{t('crops.addToGarden', 'Add to My Garden')}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default CropCard;
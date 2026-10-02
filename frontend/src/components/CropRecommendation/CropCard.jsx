import React, { useState } from 'react';
import { 
  RiAlertLine, 
  RiLeafLine, 
  RiSunLine, 
  RiTempColdLine, 
  RiScales3Line, 
  RiTeamLine, 
  RiCheckLine, 
  RiAddLine, 
  RiArrowUpSLine, 
  RiArrowDownSLine 
} from 'react-icons/ri';
import { TbPlant2, TbBucket } from 'react-icons/tb';
import './CropCard.css';

const CropCard = ({ crop, spaceAvailable, existingPlants = [], onAddToPlants }) => {
  const [expanded, setExpanded] = useState(false);

  // Determine container suitability
  const getContainerSuitability = (cropName) => {
    const containerFriendly = ['tomato', 'pepper', 'lettuce', 'basil', 'mint', 'chili', 'eggplant', 'strawberry', 'herbs'];
    const deepRoot = ['carrot', 'potato', 'onion', 'garlic', 'parsnip'];
    
    const name = cropName.toLowerCase();
    if (containerFriendly.some(c => name.includes(c))) {
      return { label: 'Great for Containers', icon: <TbBucket />, color: '#a8d5ba' };
    }
    if (deepRoot.some(c => name.includes(c))) {
      return { label: 'Needs Deep Root Space', icon: <RiAlertLine />, color: '#f0d5c0' };
    }
    return { label: 'Adaptable', icon: <RiLeafLine />, color: '#d6eaf8' };
  };

  const containerSuitability = getContainerSuitability(crop.cropName);

  // Get space suitability
  const getSpaceSuitability = () => {
    const spaceMap = {
      small: { label: 'Perfect for small spaces', color: '#a8d5ba' },
      medium: { label: 'Good for medium spaces', color: '#d6eaf8' },
      large: { label: 'Needs room to grow', color: '#f0d5c0' },
    };
    return spaceMap[spaceAvailable] || spaceMap.medium;
  };

  const spaceSuitability = getSpaceSuitability();

  // Get climate warnings
  const getClimateWarning = () => {
    const name = crop.cropName.toLowerCase();
    const temp = 25; // This would come from the form
    
    if (name.includes('lettuce') && temp > 30) {
      return { warning: true, icon: <RiSunLine />, message: 'Too hot for optimal growth. Consider shade cloth or switch to amaranth.' };
    }
    if ((name.includes('tomato') || name.includes('pepper')) && temp < 10) {
      return { warning: true, icon: <RiTempColdLine />, message: 'Too cold for optimal growth. Consider starting indoors.' };
    }
    if (name.includes('carrot') && spaceAvailable === 'small') {
      return { warning: true, icon: <RiAlertLine />, message: 'Carrots need deep soil. Use deep containers at least 30cm.' };
    }
    return { warning: false };
  };

  const climateWarning = getClimateWarning();

  // Get companion plants
  const getCompanionPlants = (cropName) => {
    const companions = {
      'tomato': ['basil', 'marigold', 'mint', 'garlic'],
      'basil': ['tomato', 'pepper', 'oregano'],
      'pepper': ['basil', 'onion', 'marigold'],
      'carrot': ['onion', 'garlic', 'rosemary'],
      'lettuce': ['carrot', 'radish', 'strawberry'],
      'strawberry': ['lettuce', 'spinach', 'garlic'],
    };
    
    const name = cropName.toLowerCase();
    for (const [key, plants] of Object.entries(companions)) {
      if (name.includes(key)) {
        return plants;
      }
    }
    return [];
  };

  const companions = getCompanionPlants(crop.cropName);

  // Find matching existing plants
  const matchingCompanions = companions.filter(c => 
    existingPlants.some(p => p.name.toLowerCase().includes(c.toLowerCase()))
  );

  return (
    <div className="crop-card" onClick={() => setExpanded(!expanded)}>
      <div className="crop-card-header">
        <h4>{crop.cropName}</h4>
        <span className="container-badge" style={{ background: containerSuitability.color + '33', color: containerSuitability.color.includes('#') ? containerSuitability.color : '#4a3f3a', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          {containerSuitability.icon} {containerSuitability.label}
        </span>
      </div>
      
      <div className="crop-confidence">
        Confidence: {Math.round(crop.confidence * 100)}%
        <div className="confidence-bar-mini">
          <div 
            className="confidence-fill-mini" 
            style={{ 
              width: `${Math.round(crop.confidence * 100)}%`,
              background: crop.confidence > 0.7 ? '#a8d5ba' : crop.confidence > 0.4 ? '#f0d5c0' : '#e8b4b4'
            }}
          />
        </div>
      </div>
      
      <p className="crop-reason">{crop.reason}</p>
      
      <div className="crop-badges">
        <span className="space-badge" style={{ background: spaceSuitability.color + '33' }}>
          {spaceSuitability.label}
        </span>
      </div>

      {climateWarning.warning && (
        <div className="climate-warning" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {climateWarning.icon} {climateWarning.message}
        </div>
      )}

      {expanded && (
        <div className="crop-expanded">
          <div className="crop-tips">
            <strong style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <RiLeafLine /> Planting Tips:
            </strong>
            <p>{crop.plantingTips}</p>
          </div>
          
          <div className="crop-yield">
            <strong style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <RiScales3Line /> Expected Yield:
            </strong>
            <span>{crop.expectedYield}</span>
          </div>

          {companions.length > 0 && (
            <div className="crop-companions">
              <strong style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <RiTeamLine /> Companion Plants:
              </strong>
              <div className="companion-tags">
                {companions.map((c, i) => (
                  <span key={i} className={`companion-tag ${matchingCompanions.includes(c) ? 'has' : ''}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    {c} {matchingCompanions.includes(c) && <RiCheckLine style={{ color: '#10b981' }} />}
                  </span>
                ))}
              </div>
              {matchingCompanions.length > 0 && (
                <div className="companion-match">
                  Great! You already grow {matchingCompanions.join(', ')} - they grow well together!
                </div>
              )}
            </div>
          )}

          <button 
            type="button"
            className="btn-primary add-plant-btn"
            onClick={(e) => {
              e.stopPropagation();
              onAddToPlants();
            }}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
          >
            <RiAddLine /> Add to My Plants
          </button>
        </div>
      )}
      
      <div className="crop-expand-hint" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
        {expanded ? <><RiArrowUpSLine /> Show less</> : <><RiArrowDownSLine /> Click for more details</>}
      </div>
    </div>
  );
};

export default CropCard;
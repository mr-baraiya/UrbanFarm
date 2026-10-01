import React, { useState } from 'react';
import './CropCard.css';

const CropCard = ({ crop, spaceAvailable, existingPlants = [], onAddToPlants }) => {
  const [expanded, setExpanded] = useState(false);

  // Determine container suitability
  const getContainerSuitability = (cropName) => {
    const containerFriendly = ['tomato', 'pepper', 'lettuce', 'basil', 'mint', 'chili', 'eggplant', 'strawberry', 'herbs'];
    const deepRoot = ['carrot', 'potato', 'onion', 'garlic', 'parsnip'];
    
    const name = cropName.toLowerCase();
    if (containerFriendly.some(c => name.includes(c))) {
      return { label: '🪣 Great for Containers', color: '#a8d5ba' };
    }
    if (deepRoot.some(c => name.includes(c))) {
      return { label: '⚠️ Needs Deep Root Space', color: '#f0d5c0' };
    }
    return { label: '🌱 Adaptable', color: '#d6eaf8' };
  };

  const containerSuitability = getContainerSuitability(crop.cropName);

  // Get space suitability
  const getSpaceSuitability = () => {
    const spaceMap = {
      small: { label: '🪴 Perfect for small spaces', color: '#a8d5ba' },
      medium: { label: '🌿 Good for medium spaces', color: '#d6eaf8' },
      large: { label: '🌳 Needs room to grow', color: '#f0d5c0' },
    };
    return spaceMap[spaceAvailable] || spaceMap.medium;
  };

  const spaceSuitability = getSpaceSuitability();

  // Get climate warnings
  const getClimateWarning = () => {
    const name = crop.cropName.toLowerCase();
    const temp = 25; // This would come from the form
    
    if (name.includes('lettuce') && temp > 30) {
      return { warning: true, message: '⚠️ Too hot for optimal growth. Consider shade cloth or switch to amaranth.' };
    }
    if ((name.includes('tomato') || name.includes('pepper')) && temp < 10) {
      return { warning: true, message: '❄️ Too cold for optimal growth. Consider starting indoors.' };
    }
    if (name.includes('carrot') && spaceAvailable === 'small') {
      return { warning: true, message: '⚠️ Carrots need deep soil. Use deep containers at least 30cm.' };
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
        <span className="container-badge" style={{ background: containerSuitability.color + '33', color: containerSuitability.color.includes('#') ? containerSuitability.color : '#4a3f3a' }}>
          {containerSuitability.label}
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
        <div className="climate-warning">
          {climateWarning.message}
        </div>
      )}

      {expanded && (
        <div className="crop-expanded">
          <div className="crop-tips">
            <strong>🌱 Planting Tips:</strong>
            <p>{crop.plantingTips}</p>
          </div>
          
          <div className="crop-yield">
            <strong>📊 Expected Yield:</strong>
            <span>{crop.expectedYield}</span>
          </div>

          {companions.length > 0 && (
            <div className="crop-companions">
              <strong>🤝 Companion Plants:</strong>
              <div className="companion-tags">
                {companions.map((c, i) => (
                  <span key={i} className={`companion-tag ${matchingCompanions.includes(c) ? 'has' : ''}`}>
                    {c} {matchingCompanions.includes(c) && '✅'}
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
            className="btn-primary add-plant-btn"
            onClick={(e) => {
              e.stopPropagation();
              onAddToPlants();
            }}
          >
            + Add to My Plants
          </button>
        </div>
      )}
      
      <div className="crop-expand-hint">
        {expanded ? '▲ Show less' : '▼ Click for more details'}
      </div>
    </div>
  );
};

export default CropCard;
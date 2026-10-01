import React from 'react';
import './UrbanPresets.css';

const UrbanPresets = ({ onSelect, currentPreset }) => {
  const presets = [
    {
      id: 'container',
      label: '🏙️ Balcony / Container Garden',
      icon: '🪴',
      description: 'Pots, planters, and containers',
      inputs: {
        soilType: 'Potting Mix',
        ph: 6.5,
        temperature: 25,
        humidity: 60,
        rainfall: 100,
        season: 'Summer',
        region: 'Temperate',
        spaceAvailable: 'small',
      }
    },
    {
      id: 'raised_bed',
      label: '📦 Raised Bed',
      icon: '📦',
      description: 'Elevated garden beds',
      inputs: {
        soilType: 'Loam',
        ph: 6.8,
        temperature: 25,
        humidity: 60,
        rainfall: 100,
        season: 'Summer',
        region: 'Temperate',
        spaceAvailable: 'medium',
      }
    },
    {
      id: 'rooftop',
      label: '☀️ Rooftop Sunny Spot',
      icon: '🏢',
      description: 'Full sun, wind exposure',
      inputs: {
        soilType: 'Sandy Loam',
        ph: 6.5,
        temperature: 28,
        humidity: 55,
        rainfall: 80,
        season: 'Summer',
        region: 'Temperate',
        spaceAvailable: 'large',
      }
    },
    {
      id: 'indoor',
      label: '🪴 Indoor / Windowsill',
      icon: '🏠',
      description: 'Indoor growing, limited light',
      inputs: {
        soilType: 'Potting Mix',
        ph: 6.3,
        temperature: 22,
        humidity: 65,
        rainfall: 50,
        season: 'Spring',
        region: 'Temperate',
        spaceAvailable: 'small',
      }
    },
  ];

  return (
    <div className="urban-presets">
      <h4>🚀 Quick Presets</h4>
      <div className="presets-grid">
        {presets.map((preset) => (
          <button
            key={preset.id}
            className={`preset-btn ${currentPreset === preset.id ? 'active' : ''}`}
            onClick={() => onSelect(preset)}
          >
            <span className="preset-icon">{preset.icon}</span>
            <span className="preset-label">{preset.label}</span>
            <span className="preset-desc">{preset.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default UrbanPresets;
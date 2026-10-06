import React from 'react';
import { useTranslation } from 'react-i18next';
import './UrbanPresets.css';

const UrbanPresets = ({ onSelect, currentPreset }) => {
  const { t } = useTranslation();

  const presets = [
    {
      id: 'container',
      label: t('crops.presetContainer', 'Balcony Containers'),
      tag: 'Pots',
      description: t('crops.presetContainerDesc', 'Pots, planters, and containers'),
      inputs: {
        soilType: 'Potting Mix',
        ph: 6.5,
        temperature: 25,
        humidity: 60,
        rainfall: 100,
        season: 'Summer',
        region: 'Urban Balcony',
        spaceAvailable: 'small',
      }
    },
    {
      id: 'raised_bed',
      label: t('crops.presetRaisedBed', 'Raised Bed'),
      tag: 'Bed',
      description: t('crops.presetRaisedBedDesc', 'Elevated garden beds with deep soil'),
      inputs: {
        soilType: 'Loam',
        ph: 6.8,
        temperature: 25,
        humidity: 60,
        rainfall: 100,
        season: 'Summer',
        region: 'Courtyard',
        spaceAvailable: 'medium',
      }
    },
    {
      id: 'rooftop',
      label: t('crops.presetRooftop', 'Sunny Rooftop'),
      tag: 'Roof',
      description: t('crops.presetRooftopDesc', 'Full sun, wind exposure'),
      inputs: {
        soilType: 'Sandy Loam',
        ph: 6.5,
        temperature: 28,
        humidity: 55,
        rainfall: 80,
        season: 'Summer',
        region: 'Rooftop Terrace',
        spaceAvailable: 'large',
      }
    },
    {
      id: 'indoor',
      label: t('crops.presetIndoor', 'Indoor Window'),
      tag: 'Windowsill',
      description: t('crops.presetIndoorDesc', 'Indirect light, controlled room temp'),
      inputs: {
        soilType: 'Potting Mix',
        ph: 6.2,
        temperature: 22,
        humidity: 50,
        rainfall: 50,
        season: 'Spring',
        region: 'Indoor Living Space',
        spaceAvailable: 'small',
      }
    }
  ];

  return (
    <div className="urban-presets">
      <div className="presets-header">
        <span className="presets-title">{t('crops.quickPresets', 'Quick Urban Presets')}</span>
        <span className="presets-sub">{t('crops.presetsSubtitle', 'One-click configurations')}</span>
      </div>
      <div className="presets-grid">
        {presets.map(p => (
          <button
            key={p.id}
            type="button"
            className={`preset-card ${currentPreset === p.id ? 'active' : ''}`}
            onClick={() => onSelect(p)}
          >
            <div className="preset-top">
              <span className="preset-badge">{p.tag}</span>
              <span className="preset-name">{p.label}</span>
            </div>
            <p className="preset-desc">{p.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default UrbanPresets;
import React from 'react';
import { useTranslation } from 'react-i18next';
import { SlidersHorizontal, Flower2, Layers, Sun, Home } from 'lucide-react';
import './UrbanPresets.css';

const UrbanPresets = ({ onSelect, currentPreset }) => {
  const { t } = useTranslation();

  const presets = [
    {
      id: 'container',
      label: t('crops.presetContainer', 'Balcony Containers'),
      tag: t('crops.presetTagPots', 'Pots'),
      icon: Flower2,
      colorClass: 'preset-emerald',
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
      tag: t('crops.presetTagBed', 'Raised Bed'),
      icon: Layers,
      colorClass: 'preset-amber',
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
      tag: t('crops.presetTagRoof', 'Rooftop'),
      icon: Sun,
      colorClass: 'preset-orange',
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
      tag: t('crops.presetTagIndoor', 'Indoor'),
      icon: Home,
      colorClass: 'preset-blue',
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
        <div className="presets-title-wrap">
          <div className="presets-badge-group">
            <SlidersHorizontal size={16} className="presets-badge-icon" />
            <span className="presets-badge">{t('crops.quickPresets', 'Quick Urban Presets')}</span>
          </div>
          <span className="presets-sub">{t('crops.presetsSubtitle', 'One-click configurations')}</span>
        </div>
      </div>
      <div className="presets-grid">
        {presets.map(p => {
          const isActive = currentPreset === p.id;
          const IconComponent = p.icon;
          return (
            <button
              key={p.id}
              type="button"
              className={`preset-card ${isActive ? 'active' : ''} ${p.colorClass}`}
              onClick={() => onSelect(p)}
            >
              <div className="preset-card-top">
                <div className="preset-icon-box">
                  <IconComponent size={19} className="preset-icon" />
                </div>
                <span className="preset-badge">{p.tag}</span>
              </div>
              <h5 className="preset-name">{p.label}</h5>
              <p className="preset-desc">{p.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default UrbanPresets;
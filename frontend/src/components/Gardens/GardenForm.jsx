import React, { useState } from 'react';
import './GardenForm.css';

const GardenForm = ({ garden, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: garden?.name || '',
    description: garden?.description || '',
    location: garden?.location || '',
    size: garden?.size || '',
    type: garden?.type || 'balcony',
    sunlight: garden?.sunlight || 'full',
    soilType: garden?.soilType || 'potting_mix',
  });
  const [loading, setLoading] = useState(false);

  const gardenTypes = [
    { value: 'balcony', label: '🏠 Balcony' },
    { value: 'rooftop', label: '🏢 Rooftop' },
    { value: 'terrace', label: '🏡 Terrace' },
    { value: 'indoor', label: '🪴 Indoor' },
    { value: 'backyard', label: '🌳 Backyard' },
    { value: 'community', label: '👥 Community' },
  ];

  const sunlightOptions = [
    { value: 'full', label: '☀️ Full Sun (6-8 hrs)' },
    { value: 'partial', label: '⛅ Partial Shade (3-6 hrs)' },
    { value: 'shade', label: '🌥️ Shade (<3 hrs)' },
  ];

  const soilOptions = [
    { value: 'potting_mix', label: '🪴 Potting Mix' },
    { value: 'hydroponics', label: '💧 Hydroponics' },
    { value: 'raised_bed', label: '📦 Raised Bed' },
    { value: 'coco_peat', label: '🥥 Coco Peat' },
    { value: 'loam', label: '🌱 Loam' },
    { value: 'clay', label: '🏺 Clay' },
    { value: 'sandy', label: '🏖️ Sandy' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Garden name is required');
      return;
    }
    setLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content garden-form" onClick={(e) => e.stopPropagation()}>
        <h3>{garden ? 'Edit Garden' : 'Create New Garden'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Garden Name *</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Backyard Garden"
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your garden..."
              rows="2"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Type</label>
              <select name="type" value={formData.type} onChange={handleChange}>
                {gardenTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Location</label>
              <input
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., New York, NY"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Size (m²)</label>
              <input
                name="size"
                type="number"
                value={formData.size}
                onChange={handleChange}
                placeholder="e.g., 20"
                min="1"
                step="0.5"
              />
            </div>
            <div className="form-group">
              <label>Sunlight</label>
              <select name="sunlight" value={formData.sunlight} onChange={handleChange}>
                {sunlightOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Soil / Medium Type</label>
            <select name="soilType" value={formData.soilType} onChange={handleChange}>
              {soilOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : garden ? 'Update Garden' : 'Create Garden'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GardenForm;
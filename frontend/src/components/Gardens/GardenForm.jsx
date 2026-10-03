import React, { useState } from 'react';
import { RiCloseLine, RiPlantLine } from 'react-icons/ri';
import { useTranslation } from 'react-i18next';
import { validateGardenForm } from '../../utils/validators';
import './GardenForm.css';

const GardenForm = ({ garden, onClose, onSubmit }) => {
  const { t } = useTranslation();
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
  const [formError, setFormError] = useState('');

  const gardenTypes = [
    { value: 'balcony', label: t('gardens.form.types.balcony', 'Balcony') },
    { value: 'rooftop', label: t('gardens.form.types.rooftop', 'Rooftop') },
    { value: 'terrace', label: t('gardens.form.types.terrace', 'Terrace') },
    { value: 'indoor', label: t('gardens.form.types.indoor', 'Indoor Window / Room') },
    { value: 'backyard', label: t('gardens.form.types.backyard', 'Backyard Garden') },
    { value: 'community', label: t('gardens.form.types.community', 'Community Garden') },
  ];

  const sunlightOptions = [
    { value: 'full', label: t('gardens.form.sunlight.full', 'Full Sun (6-8 hrs/day)') },
    { value: 'partial', label: t('gardens.form.sunlight.partial', 'Partial Shade (3-6 hrs/day)') },
    { value: 'shade', label: t('gardens.form.sunlight.shade', 'Shade (<3 hrs/day)') },
  ];

  const soilOptions = [
    { value: 'potting_mix', label: t('gardens.form.soil.potting_mix', 'Standard Potting Mix') },
    { value: 'hydroponics', label: t('gardens.form.soil.hydroponics', 'Hydroponics / Aquaponics') },
    { value: 'raised_bed', label: t('gardens.form.soil.raised_bed', 'Raised Bed Garden Mix') },
    { value: 'coco_peat', label: t('gardens.form.soil.coco_peat', 'Coco Peat / Perlite') },
    { value: 'loam', label: t('gardens.form.soil.loam', 'Loam Soil') },
    { value: 'clay', label: t('gardens.form.soil.clay', 'Clay Soil') },
    { value: 'sandy', label: t('gardens.form.soil.sandy', 'Sandy Loam') },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formError) setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { isValid, firstError } = validateGardenForm(formData);
    if (!isValid) {
      setFormError(firstError);
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
        <div className="form-header">
          <h3>
            <RiPlantLine className="form-header-icon" /> {garden ? t('gardens.form.editTitle', 'Edit Garden') : t('gardens.form.createTitle', 'Create New Garden')}
          </h3>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            <RiCloseLine />
          </button>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          {formError && (
            <div style={{ color: '#e63946', backgroundColor: '#fde8e8', padding: '0.6rem 0.9rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.88rem' }}>
              {formError}
            </div>
          )}
          <div className="form-group">
            <label>{t('gardens.form.nameLabel', 'Garden Name *')}</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder={t('gardens.form.namePlaceholder', 'e.g., Rooftop Herb Haven')}
              className={formError ? 'input-error' : ''}
            />
          </div>

          <div className="form-group">
            <label>{t('gardens.form.descLabel', 'Description')}</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder={t('gardens.form.descPlaceholder', 'Describe your garden...')}
              rows="2"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>{t('gardens.form.typeLabel', 'Type')}</label>
              <select name="type" value={formData.type} onChange={handleChange}>
                {gardenTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>{t('gardens.form.locationLabel', 'Location / City')}</label>
              <input
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder={t('gardens.form.locationPlaceholder', 'e.g., Mumbai, India')}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>{t('gardens.form.sizeLabel', 'Size (m²)')}</label>
              <input
                name="size"
                type="number"
                value={formData.size}
                onChange={handleChange}
                placeholder={t('gardens.form.sizePlaceholder', 'e.g., 20')}
                min="1"
                step="0.5"
              />
            </div>
            <div className="form-group">
              <label>{t('gardens.form.sunlightLabel', 'Sunlight Exposure')}</label>
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
            <label>{t('gardens.form.soilLabel', 'Soil / Growing Medium')}</label>
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
              {t('common.cancel', 'Cancel')}
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? t('common.saving', 'Saving...') : garden ? t('gardens.form.updateBtn', 'Update Garden') : t('gardens.form.createBtn', 'Create Garden')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GardenForm;
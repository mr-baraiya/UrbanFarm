import React, { useState, useEffect } from 'react';
import { RiCameraLine, RiCloseLine, RiPlantLine, RiImageLine, RiDeleteBinLine } from 'react-icons/ri';
import { useTranslation } from 'react-i18next';
import { addPlant, updatePlant, getGardens, uploadImage } from '../../services/plantService';
import { useNotification } from '../../hooks/useNotification';
import { validatePlantForm } from '../../utils/validators';
import { getLocalizedDynamicText } from '../../utils/localizationHelper';
import './PlantForm.css';

const PlantForm = ({ onClose, plant, gardens: propGardens, selectedGardenId, onSubmit }) => {
  const { t } = useTranslation();
  const [gardens, setGardens] = useState(propGardens || []);
  const [imagePreview, setImagePreview] = useState(plant?.imageUrl || null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    scientificName: '',
    variety: '',
    gardenId: selectedGardenId || '',
    plantingDate: new Date().toISOString().split('T')[0],
    status: 'seedling',
    waterFrequency: 3,
    sunlight: 'full',
    notes: '',
    imageUrl: '',
  });
  const { addNotification } = useNotification();

  const statusOptions = [
    { value: 'seedling', label: t('plants.form.statuses.seedling', 'Seedling') },
    { value: 'growing', label: t('plants.form.statuses.growing', 'Growing') },
    { value: 'mature', label: t('plants.form.statuses.mature', 'Mature') },
    { value: 'harvested', label: t('plants.form.statuses.harvested', 'Harvested') },
    { value: 'dead', label: t('plants.form.statuses.dead', 'Dead') },
  ];

  const sunlightOptions = [
    { value: 'full', label: t('plants.form.sunlight.full', 'Full Sun') },
    { value: 'partial', label: t('plants.form.sunlight.partial', 'Partial Sun') },
    { value: 'shade', label: t('plants.form.sunlight.shade', 'Shade') },
  ];

  useEffect(() => {
    if (!propGardens) {
      loadGardens();
    }
    if (plant) {
      setFormData({
        name: plant.name || '',
        scientificName: plant.scientificName || '',
        variety: plant.variety || '',
        gardenId: plant.gardenId?._id || plant.gardenId || '',
        plantingDate: plant.plantingDate?.slice(0, 10) || new Date().toISOString().split('T')[0],
        status: plant.status || 'seedling',
        waterFrequency: plant.waterFrequency !== undefined && plant.waterFrequency !== null ? plant.waterFrequency : 3,
        sunlight: plant.sunlight || 'full',
        notes: plant.notes || '',
        imageUrl: plant.imageUrl || '',
      });
      if (plant.imageUrl) {
        setImagePreview(plant.imageUrl);
      }
    }
  }, [plant, propGardens]);

  const loadGardens = async () => {
    try {
      const data = await getGardens();
      setGardens(data || []);
    } catch (error) {
      console.error('Failed to load gardens:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show instant local preview
    const localPreviewUrl = URL.createObjectURL(file);
    setImagePreview(localPreviewUrl);
    setUploadingImage(true);

    try {
      const cloudUrl = await uploadImage(file);
      if (cloudUrl) {
        setFormData((prev) => ({ ...prev, imageUrl: cloudUrl }));
        setImagePreview(cloudUrl);
        addNotification(t('plants.notifications.photoUploaded', 'Photo uploaded to Cloudinary!'), 'success');
      }
    } catch (err) {
      console.warn('Direct upload error, saving local image:', err);
      // Fallback: Read as Base64 so it still persists
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, imageUrl: reader.result }));
        setImagePreview(reader.result);
        addNotification(t('plants.notifications.photoSet', 'Photo set successfully!'), 'success');
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleClearImage = (e) => {
    e.stopPropagation();
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, imageUrl: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { isValid, errors: formErrors } = validatePlantForm(formData);
    if (!isValid) {
      setErrors(formErrors);
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      const payload = {
        ...formData,
        imageUrl: formData.imageUrl || imagePreview || '',
      };

      if (onSubmit) {
        await onSubmit(payload);
      } else if (plant?._id) {
        await updatePlant(plant._id, payload);
        addNotification(t('plants.notifications.plantUpdated', 'Plant updated successfully!'), 'success');
      } else {
        await addPlant(payload);
        addNotification(t('plants.notifications.plantSaved', 'Plant saved successfully!'), 'success');
      }

      onClose();
    } catch (error) {
      addNotification(t('plants.notifications.saveFailed', 'Failed to save plant'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay plant-modal-overlay" onClick={onClose}>
      <div className="modal-content plant-form" onClick={(e) => e.stopPropagation()}>
        <div className="form-header">
          <h3>
            <RiPlantLine className="form-header-icon" /> {plant ? t('plants.form.editTitle', 'Edit Plant') : t('plants.form.createTitle', 'Add New Plant')}
          </h3>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            <RiCloseLine />
          </button>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          {/* Image Upload Area */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label style={{ margin: 0 }}>{t('plants.form.photoLabel', 'Plant Photo')}</label>
              {imagePreview && (
                <button 
                  type="button" 
                  onClick={handleClearImage}
                  style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}
                >
                  <RiDeleteBinLine /> {t('plants.form.removePhoto', 'Remove Photo')}
                </button>
              )}
            </div>
            <div 
              className="image-upload-area" 
              onClick={() => document.getElementById('imageInput').click()}
              style={{ cursor: uploadingImage ? 'wait' : 'pointer' }}
            >
              {uploadingImage ? (
                <div className="upload-placeholder">
                  <span style={{ fontSize: '0.9rem', color: '#2d6a4f', fontWeight: 600 }}>{t('plants.form.uploading', 'Uploading to Cloudinary...')}</span>
                </div>
              ) : imagePreview ? (
                <img src={imagePreview} alt="Plant preview" className="image-preview" />
              ) : (
                <div className="upload-placeholder">
                  <RiCameraLine className="camera-icon" />
                  <span>{t('plants.form.uploadClick', 'Click or drag photo to auto-upload')}</span>
                </div>
              )}
              <input
                id="imageInput"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={uploadingImage}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>{t('plants.form.nameLabel', 'Plant Name *')}</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={t('plants.form.namePlaceholder', 'e.g., Tomato')}
                className={errors.name ? 'input-error' : ''}
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>
            <div className="form-group">
              <label>{t('plants.form.varietyLabel', 'Variety')}</label>
              <input
                name="variety"
                value={formData.variety}
                onChange={handleChange}
                placeholder={t('plants.form.varietyPlaceholder', 'e.g., Cherry, Roma')}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>{t('plants.form.scientificLabel', 'Scientific Name')}</label>
              <input
                name="scientificName"
                value={formData.scientificName}
                onChange={handleChange}
                placeholder={t('plants.form.scientificPlaceholder', 'e.g., Solanum lycopersicum')}
              />
            </div>
            <div className="form-group">
              <label>{t('plants.form.gardenLabel', 'Garden *')}</label>
              <select
                name="gardenId"
                value={formData.gardenId}
                onChange={handleChange}
                className={errors.gardenId ? 'input-error' : ''}
              >
                <option value="" disabled hidden>{t('plants.form.selectGarden', 'Select a garden')}</option>
                {gardens.map((g) => (
                  <option key={g._id} value={g._id}>
                    {getLocalizedDynamicText(g.name)}
                  </option>
                ))}
              </select>
              {errors.gardenId && <span className="error-text">{errors.gardenId}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>{t('plants.form.statusLabel', 'Status')}</label>
              <select name="status" value={formData.status} onChange={handleChange}>
                {statusOptions.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>{t('plants.form.sunlightLabel', 'Sunlight')}</label>
              <select name="sunlight" value={formData.sunlight} onChange={handleChange}>
                {sunlightOptions.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>{t('plants.form.plantingDateLabel', 'Planting Date')}</label>
              <input
                type="date"
                name="plantingDate"
                value={formData.plantingDate}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>{t('plants.form.waterFreqLabel', 'Water Frequency (days)')}</label>
              <input
                type="number"
                name="waterFrequency"
                value={formData.waterFrequency}
                onChange={handleChange}
                min="0"
                className={errors.waterFrequency ? 'input-error' : ''}
              />
              {errors.waterFrequency && <span className="error-text">{errors.waterFrequency}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>{t('plants.form.notesLabel', 'Notes')}</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder={t('plants.form.notesPlaceholder', 'Any special care instructions...')}
              rows="2"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              {t('common.cancel', 'Cancel')}
            </button>
            <button type="submit" className="btn-primary" disabled={loading || uploadingImage}>
              {loading ? t('common.saving', 'Saving...') : plant ? t('plants.form.updateBtn', 'Update Plant') : t('plants.form.addBtn', 'Add Plant')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlantForm;
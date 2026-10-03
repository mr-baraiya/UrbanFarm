import React, { useState, useEffect } from 'react';
import { RiCameraLine, RiCloseLine, RiPlantLine, RiImageLine, RiDeleteBinLine } from 'react-icons/ri';
import { addPlant, updatePlant, getGardens, uploadImage } from '../../services/plantService';
import { PLANT_STATUSES, SUNLIGHT_OPTIONS } from '../../utils/constants';
import { useNotification } from '../../hooks/useNotification';
import { validatePlantForm } from '../../utils/validators';
import './PlantForm.css';

const PlantForm = ({ onClose, plant, gardens: propGardens, selectedGardenId, onSubmit }) => {
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
        addNotification('Photo uploaded to Cloudinary!', 'success');
      }
    } catch (err) {
      console.warn('Direct upload error, saving local image:', err);
      // Fallback: Read as Base64 so it still persists
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, imageUrl: reader.result }));
        setImagePreview(reader.result);
        addNotification('Photo set successfully!', 'success');
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
        addNotification('Plant updated successfully!', 'success');
      } else {
        await addPlant(payload);
        addNotification('Plant saved successfully!', 'success');
      }

      onClose();
    } catch (error) {
      addNotification('Failed to save plant', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content plant-form" onClick={(e) => e.stopPropagation()}>
        <div className="form-header">
          <h3>
            <RiPlantLine className="form-header-icon" /> {plant ? 'Edit Plant' : 'Add New Plant'}
          </h3>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            <RiCloseLine />
          </button>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          {/* Image Upload Area */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label style={{ margin: 0 }}>Plant Photo</label>
              {imagePreview && (
                <button 
                  type="button" 
                  onClick={handleClearImage}
                  style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}
                >
                  <RiDeleteBinLine /> Remove Photo
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
                  <span style={{ fontSize: '0.9rem', color: '#2d6a4f', fontWeight: 600 }}>Uploading to Cloudinary...</span>
                </div>
              ) : imagePreview ? (
                <img src={imagePreview} alt="Plant preview" className="image-preview" />
              ) : (
                <div className="upload-placeholder">
                  <RiCameraLine className="camera-icon" />
                  <span>Click or drag photo to auto-upload</span>
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
              <label>Plant Name *</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Tomato"
                className={errors.name ? 'input-error' : ''}
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>
            <div className="form-group">
              <label>Variety</label>
              <input
                name="variety"
                value={formData.variety}
                onChange={handleChange}
                placeholder="e.g., Cherry, Roma"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Scientific Name</label>
              <input
                name="scientificName"
                value={formData.scientificName}
                onChange={handleChange}
                placeholder="e.g., Solanum lycopersicum"
              />
            </div>
            <div className="form-group">
              <label>Garden *</label>
              <select
                name="gardenId"
                value={formData.gardenId}
                onChange={handleChange}
                className={errors.gardenId ? 'input-error' : ''}
              >
                <option value="" disabled hidden>Select a garden</option>
                {gardens.map((g) => (
                  <option key={g._id} value={g._id}>
                    {g.name}
                  </option>
                ))}
              </select>
              {errors.gardenId && <span className="error-text">{errors.gardenId}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Status</label>
              <select name="status" value={formData.status} onChange={handleChange}>
                {PLANT_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Sunlight</label>
              <select name="sunlight" value={formData.sunlight} onChange={handleChange}>
                {SUNLIGHT_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Planting Date</label>
              <input
                type="date"
                name="plantingDate"
                value={formData.plantingDate}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Water Frequency (days)</label>
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
            <label>Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any special care instructions..."
              rows="2"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading || uploadingImage}>
              {loading ? 'Saving...' : plant ? 'Update Plant' : 'Add Plant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlantForm;
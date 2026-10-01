import React, { useState, useEffect } from 'react';
import { addPlant, getGardens } from '../../services/plantService';
import { PLANT_STATUSES, SUNLIGHT_OPTIONS } from '../../utils/constants';
import { useNotification } from '../../hooks/useNotification';
import './PlantForm.css';

const PlantForm = ({ onClose, plant, gardens: propGardens, selectedGardenId }) => {
  const [gardens, setGardens] = useState(propGardens || []);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
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
        waterFrequency: plant.waterFrequency || 3,
        sunlight: plant.sunlight || 'full',
        notes: plant.notes || '',
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
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      addNotification('Plant name is required', 'error');
      return;
    }
    if (!formData.gardenId) {
      addNotification('Please select a garden', 'error');
      return;
    }

    setLoading(true);
    try {
      // For now, we'll send the data without image upload to Cloudinary
      // The backend will handle image upload separately
      await addPlant(formData);
      addNotification('Plant added successfully! 🌱', 'success');
      onClose();
    } catch (error) {
      addNotification('Failed to add plant', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content plant-form" onClick={(e) => e.stopPropagation()}>
        <h3>{plant ? 'Edit Plant' : 'Add New Plant'}</h3>
        <form onSubmit={handleSubmit}>
          {/* Image Upload */}
          <div className="form-group">
            <label>Plant Photo</label>
            <div className="image-upload-area" onClick={() => document.getElementById('imageInput').click()}>
              {imagePreview ? (
                <img src={imagePreview} alt="Plant preview" className="image-preview" />
              ) : (
                <div className="upload-placeholder">
                  <span>📸</span>
                  <span>Click to upload photo</span>
                </div>
              )}
              <input
                id="imageInput"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
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
                required
              />
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

          <div className="form-group">
            <label>Scientific Name</label>
            <input
              name="scientificName"
              value={formData.scientificName}
              onChange={handleChange}
              placeholder="e.g., Solanum lycopersicum"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Garden *</label>
              <select
                name="gardenId"
                value={formData.gardenId}
                onChange={handleChange}
                required
              >
                <option value="">Select a garden</option>
                {gardens.map((g) => (
                  <option key={g._id} value={g._id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Planting Date</label>
              <input
                type="date"
                name="plantingDate"
                value={formData.plantingDate}
                onChange={handleChange}
              />
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

          <div className="form-group">
            <label>Water Frequency (days)</label>
            <input
              type="number"
              name="waterFrequency"
              value={formData.waterFrequency}
              onChange={handleChange}
              min="1"
              max="10"
            />
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
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : plant ? 'Update Plant' : 'Add Plant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlantForm;
import React, { useState, useEffect } from 'react';
import { createPost, updatePost } from '../../services/plantService';
import { getPlants, getGardens } from '../../services/plantService';
import { useNotification } from '../../hooks/useNotification';
import './PostForm.css';

const PostForm = ({ onClose, user, post = null, onPostSaved }) => {
  const [formData, setFormData] = useState({
    title: post?.title || '',
    content: post?.content || '',
    category: post?.category || 'general',
    tags: post?.tags || [],
    plantId: post?.plantId?._id || post?.plantId || '',
    gardenId: post?.gardenId?._id || post?.gardenId || '',
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(post?.imageUrl || null);
  const [plants, setPlants] = useState([]);
  const [gardens, setGardens] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { addNotification } = useNotification();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [plantsData, gardensData] = await Promise.all([
        getPlants(),
        getGardens(),
      ]);
      setPlants(plantsData || []);
      setGardens(gardensData || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim().toLowerCase())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim().toLowerCase()],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      addNotification('Please fill in all required fields', 'error');
      return;
    }

    setLoading(true);

    try {
      if (post && post._id) {
        // Edit existing post
        const updated = await updatePost(post._id, {
          title: formData.title,
          content: formData.content,
          category: formData.category,
          tags: formData.tags,
        });
        addNotification('Post updated successfully! 🌿', 'success');
        if (onPostSaved) onPostSaved(updated);
      } else {
        // Create new post
        const data = new FormData();
        data.append('title', formData.title);
        data.append('content', formData.content);
        data.append('category', formData.category);
        data.append('tags', JSON.stringify(formData.tags));
        if (formData.plantId) data.append('plantId', formData.plantId);
        if (formData.gardenId) data.append('gardenId', formData.gardenId);
        if (image) data.append('image', image);

        const newPost = await createPost(data);
        addNotification('Post shared successfully! 🌱', 'success');
        if (onPostSaved) onPostSaved(newPost);
      }
      onClose();
    } catch (error) {
      addNotification('Failed to save post', 'error');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: 'showcase', label: '🍅 Harvest Showcase' },
    { value: 'question', label: '🆘 Plant Help / Diagnose Request' },
    { value: 'tip', label: '💡 Urban Tip / DIY' },
    { value: 'event', label: '📅 Community Event' },
    { value: 'general', label: '💬 General' },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content post-form" onClick={(e) => e.stopPropagation()}>
        <h3>{post ? 'Edit Post' : 'Share with the Community'}</h3>
        <form onSubmit={handleSubmit}>
          {/* Category */}
          <div className="form-group">
            <label>Category *</label>
            <select name="category" value={formData.category} onChange={handleChange} required>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div className="form-group">
            <label>Title *</label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="What's your post about?"
              required
            />
          </div>

          {/* Content */}
          <div className="form-group">
            <label>Content *</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Share your urban farming experience..."
              rows="4"
              required
            />
          </div>

          {/* Image Upload - for new post */}
          {!post && (
            <div className="form-group">
              <label>Photo / Harvest Image</label>
              <div className="image-upload-area" onClick={() => document.getElementById('imageInput').click()}>
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="image-preview" />
                ) : (
                  <div className="upload-placeholder">
                    <span>📸</span>
                    <span>Click to upload a photo</span>
                    <span className="upload-sub">(Optional)</span>
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
          )}

          {/* Plant & Garden Tagging */}
          {!post && (
            <div className="form-row">
              <div className="form-group">
                <label>Tag Plant (Optional)</label>
                <select name="plantId" value={formData.plantId} onChange={handleChange}>
                  <option value="">None</option>
                  {plants.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Tag Garden (Optional)</label>
                <select name="gardenId" value={formData.gardenId} onChange={handleChange}>
                  <option value="">None</option>
                  {gardens.map((g) => (
                    <option key={g._id} value={g._id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Tags */}
          <div className="form-group">
            <label>Tags</label>
            <div className="tag-input-group">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add tags (e.g., tomato, balcony)"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              />
              <button type="button" className="btn-secondary add-tag-btn" onClick={handleAddTag}>
                Add
              </button>
            </div>
            {formData.tags.length > 0 && (
              <div className="tag-list">
                {formData.tags.map((tag) => (
                  <span key={tag} className="tag-item">
                    #{tag}
                    <button type="button" onClick={() => handleRemoveTag(tag)}>✕</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : post ? 'Save Changes' : 'Share Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostForm;
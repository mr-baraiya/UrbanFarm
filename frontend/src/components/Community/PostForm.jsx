import React, { useState, useEffect } from 'react';
import { createPost, updatePost, getPlants, getGardens } from '../../services/plantService';
import { useNotification } from '../../hooks/useNotification';
import { validatePostForm } from '../../utils/validators';
import { getInitials } from '../../utils/helpers';
import { 
  RiImageAddLine, 
  RiCloseLine, 
  RiPriceTag3Line, 
  RiPlantLine, 
  RiShareForwardLine,
  RiSendPlane2Fill
} from 'react-icons/ri';
import './PostForm.css';

export const PostComposer = ({ user, onOpenComposer }) => {
  const firstName = user?.name ? user.name.split(' ')[0] : 'Gardener';
  const userAvatar = user?.profilePicture || null;

  return (
    <div className="post-composer-card">
      <div className="composer-top-row">
        <div className="composer-avatar">
          {userAvatar ? (
            <img src={userAvatar} alt={user?.name || 'User'} />
          ) : (
            getInitials(user?.name || 'User')
          )}
        </div>
        <button 
          type="button" 
          className="composer-input-trigger" 
          onClick={() => onOpenComposer()}
        >
          <span>What's growing in your garden, {firstName}?</span>
        </button>
      </div>
      <div className="composer-affordance-row">
        <button 
          type="button" 
          className="composer-chip photo-chip" 
          onClick={() => onOpenComposer('photo')}
          title="Upload a photo for your post"
        >
          <RiImageAddLine className="chip-icon" style={{ color: '#10b981' }} />
          <span>Photo</span>
        </button>
        <button 
          type="button" 
          className="composer-chip tag-chip" 
          onClick={() => onOpenComposer('tag')}
          title="Add tags to categorize your post"
        >
          <RiPriceTag3Line className="chip-icon" style={{ color: '#f59e0b' }} />
          <span>Tag</span>
        </button>
        <button 
          type="button" 
          className="composer-chip location-chip" 
          onClick={() => onOpenComposer('garden')}
          title="Tag a garden or plant"
        >
          <RiPlantLine className="chip-icon" style={{ color: '#06b6d4' }} />
          <span>Garden</span>
        </button>
        <button 
          type="button" 
          className="composer-chip share-chip" 
          onClick={() => onOpenComposer()}
          title="Publish a community post"
        >
          <RiShareForwardLine className="chip-icon" style={{ color: 'var(--primary, #6b9080)' }} />
          <span>Share</span>
        </button>
      </div>
    </div>
  );
};

const PostForm = ({ onClose, user, post = null, onPostSaved, initialFocus = null }) => {
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
  const [errors, setErrors] = useState({});
  const { addNotification } = useNotification();

  useEffect(() => {
    loadData();
    if (initialFocus) {
      const timer = setTimeout(() => {
        if (initialFocus === 'photo') {
          document.getElementById('imageInput')?.click();
        } else if (initialFocus === 'tag') {
          document.getElementById('tagInput')?.focus();
        } else if (initialFocus === 'garden') {
          document.getElementById('gardenSelect')?.focus();
        }
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [initialFocus]);

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
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
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
    const { isValid, errors: formErrors } = validatePostForm(formData);
    if (!isValid) {
      setErrors(formErrors);
      return;
    }

    setErrors({});
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
        addNotification('Post updated successfully!', 'success');
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
        addNotification('Post published successfully!', 'success');
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
    { value: 'showcase', label: '🌾 Harvest Showcase' },
    { value: 'question', label: '🪴 Plant Help / Diagnose Request' },
    { value: 'tip', label: '💡 Urban Tip / DIY' },
    { value: 'event', label: '📅 Community Event' },
    { value: 'general', label: '💬 General Discussion' },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content post-form" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{post ? 'Edit Community Post' : 'Create Community Post'}</h3>
          <button className="close-btn" onClick={onClose} aria-label="Close modal">
            <RiCloseLine />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} noValidate>
          {/* Category & Title Row */}
          <div className="form-row">
            <div className="form-group">
              <label>Category *</label>
              <select name="category" value={formData.category} onChange={handleChange}>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Title *</label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="What's your post about?"
                className={errors.title ? 'input-error' : ''}
              />
              {errors.title && <span className="error-text">{errors.title}</span>}
            </div>
          </div>

          {/* Content */}
          <div className="form-group">
            <label>Content *</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Share your urban farming experience, questions, or tips..."
              rows="3"
              className={errors.content ? 'input-error' : ''}
            />
            {errors.content && <span className="error-text">{errors.content}</span>}
          </div>

          {/* Image Upload - for new post */}
          {!post && (
            <div className="form-group">
              <label>Photo / Harvest Image</label>
              <div 
                className="image-upload-area" 
                onClick={() => document.getElementById('imageInput').click()}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="image-preview" />
                ) : (
                  <div className="upload-placeholder">
                    <RiImageAddLine style={{ fontSize: '28px', color: 'var(--primary, #6b9080)', marginBottom: '4px' }} />
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
                <select id="gardenSelect" name="gardenId" value={formData.gardenId} onChange={handleChange}>
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
            <label>Tags (Topics)</label>
            <div className="tag-input-group">
              <input
                id="tagInput"
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add tags (e.g. tomato, balcony, organic)"
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
                    <button type="button" onClick={() => handleRemoveTag(tag)} aria-label="Remove tag"><RiCloseLine /></button>
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
              <RiSendPlane2Fill style={{ fontSize: '0.95rem' }} />
              {loading ? 'Publishing...' : post ? 'Save Changes' : 'Publish Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostForm;
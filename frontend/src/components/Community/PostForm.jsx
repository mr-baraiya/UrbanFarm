import React, { useState, useEffect, useRef } from 'react';
import { createPost, updatePost, getPlants, getGardens } from '../../services/plantService';
import { useNotification } from '../../hooks/useNotification';
import { validatePostForm } from '../../utils/validators';
import { getInitials } from '../../utils/helpers';
import { useTranslation } from 'react-i18next';
import { getLocalizedDynamicText } from '../../utils/localizationHelper';
import { 
  RiImageAddLine, 
  RiCloseLine, 
  RiPriceTag3Line, 
  RiPlantLine, 
  RiShareForwardLine,
  RiSendPlane2Fill,
  RiShoppingBasketLine,
  RiQuestionLine,
  RiLightbulbLine,
  RiCalendarEventLine,
  RiChat3Line,
  RiArrowDownSLine,
  RiCheckLine
} from 'react-icons/ri';
import './PostForm.css';

export const PostComposer = ({ user, onOpenComposer }) => {
  const { t } = useTranslation();
  const firstName = user?.name ? user.name.split(' ')[0] : t('community.composer.defaultUser', 'Gardener');
  const localizedFirstName = getLocalizedDynamicText(firstName);
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
          <span>{t('community.composer.whatsGrowing', "What's growing in your garden, {{name}}?", { name: localizedFirstName })}</span>
        </button>
      </div>
      <div className="composer-affordance-row">
        <button 
          type="button" 
          className="composer-chip photo-chip" 
          onClick={() => onOpenComposer('photo')}
          title={t('community.composer.photoTooltip', 'Upload a photo for your post')}
        >
          <RiImageAddLine className="chip-icon" style={{ color: '#10b981' }} />
          <span>{t('community.composer.photo', 'Photo')}</span>
        </button>
        <button 
          type="button" 
          className="composer-chip tag-chip" 
          onClick={() => onOpenComposer('tag')}
          title={t('community.composer.tagTooltip', 'Add tags to categorize your post')}
        >
          <RiPriceTag3Line className="chip-icon" style={{ color: '#f59e0b' }} />
          <span>{t('community.composer.tag', 'Tag')}</span>
        </button>
        <button 
          type="button" 
          className="composer-chip location-chip" 
          onClick={() => onOpenComposer('garden')}
          title={t('community.composer.gardenTooltip', 'Tag a garden or plant')}
        >
          <RiPlantLine className="chip-icon" style={{ color: '#06b6d4' }} />
          <span>{t('community.composer.garden', 'Garden')}</span>
        </button>
        <button 
          type="button" 
          className="composer-chip share-chip" 
          onClick={() => onOpenComposer()}
          title={t('community.composer.shareTooltip', 'Publish a community post')}
        >
          <RiShareForwardLine className="chip-icon" style={{ color: 'var(--primary, #6b9080)' }} />
          <span>{t('community.composer.share', 'Share')}</span>
        </button>
      </div>
    </div>
  );
};

const PostForm = ({ onClose, user, post = null, onPostSaved, initialFocus = null }) => {
  const { t } = useTranslation();
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
        addNotification(t('community.notifications.postUpdated', 'Post updated successfully!'), 'success');
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
        addNotification(t('community.notifications.postCreated', 'Post published successfully!'), 'success');
        if (onPostSaved) onPostSaved(newPost);
      }
      onClose();
    } catch (error) {
      addNotification(t('community.notifications.postSaveFailed', 'Failed to save post'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const categoryDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target)) {
        setCategoryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const categoryOptions = [
    { 
      value: 'showcase', 
      label: t('community.form.categories.showcase', 'Harvest Showcase'),
      icon: <RiShoppingBasketLine />,
      colorClass: 'showcase'
    },
    { 
      value: 'question', 
      label: t('community.form.categories.question', 'Plant Help / Diagnose Request'),
      icon: <RiQuestionLine />,
      colorClass: 'question'
    },
    { 
      value: 'tip', 
      label: t('community.form.categories.tip', 'Urban Tip / DIY'),
      icon: <RiLightbulbLine />,
      colorClass: 'tip'
    },
    { 
      value: 'event', 
      label: t('community.form.categories.event', 'Community Event'),
      icon: <RiCalendarEventLine />,
      colorClass: 'event'
    },
    { 
      value: 'general', 
      label: t('community.form.categories.general', 'General Discussion'),
      icon: <RiChat3Line />,
      colorClass: 'general'
    },
  ];

  const selectedCategoryObj = categoryOptions.find((c) => c.value === formData.category) || categoryOptions[4];

  const handleSelectCategory = (val) => {
    setFormData((prev) => ({ ...prev, category: val }));
    setCategoryDropdownOpen(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content post-form" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{post ? t('community.form.editTitle', 'Edit Community Post') : t('community.form.createTitle', 'Create Community Post')}</h3>
          <button className="close-btn" onClick={onClose} aria-label="Close modal">
            <RiCloseLine />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} noValidate>
          {/* Category & Title Row */}
          <div className="form-row">
            <div className="form-group" ref={categoryDropdownRef} style={{ position: 'relative' }}>
              <label>{t('community.form.categoryLabel', 'Category *')}</label>
              <div className="custom-category-select">
                <button
                  type="button"
                  className={`custom-select-trigger ${categoryDropdownOpen ? 'open' : ''}`}
                  onClick={() => setCategoryDropdownOpen((prev) => !prev)}
                  aria-expanded={categoryDropdownOpen}
                  aria-haspopup="listbox"
                >
                  <span className="custom-select-trigger-content">
                    <span className={`category-icon-badge ${selectedCategoryObj.colorClass}`}>
                      {selectedCategoryObj.icon}
                    </span>
                    <span className="category-label-text">{selectedCategoryObj.label}</span>
                  </span>
                  <RiArrowDownSLine className={`custom-select-arrow ${categoryDropdownOpen ? 'open' : ''}`} />
                </button>

                {categoryDropdownOpen && (
                  <div className="custom-select-menu" role="listbox">
                    {categoryOptions.map((cat) => {
                      const isSelected = formData.category === cat.value;
                      return (
                        <button
                          key={cat.value}
                          type="button"
                          className={`custom-select-option ${isSelected ? 'selected' : ''}`}
                          onClick={() => handleSelectCategory(cat.value)}
                          role="option"
                          aria-selected={isSelected}
                        >
                          <span className="custom-select-option-left">
                            <span className={`category-icon-badge ${cat.colorClass}`}>
                              {cat.icon}
                            </span>
                            <span className="custom-select-option-name">{cat.label}</span>
                          </span>
                          {isSelected && <RiCheckLine className="custom-select-check" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            <div className="form-group">
              <label>{t('community.form.titleLabel', 'Title *')}</label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder={t('community.form.titlePlaceholder', "What's your post about?")}
                className={errors.title ? 'input-error' : ''}
              />
              {errors.title && <span className="error-text">{errors.title}</span>}
            </div>
          </div>

          {/* Content */}
          <div className="form-group">
            <label>{t('community.form.contentLabel', 'Content *')}</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder={t('community.form.contentPlaceholder', 'Share your urban farming experience, questions, or tips...')}
              rows="3"
              className={errors.content ? 'input-error' : ''}
            />
            {errors.content && <span className="error-text">{errors.content}</span>}
          </div>

          {/* Image Upload - for new post */}
          {!post && (
            <div className="form-group">
              <label>{t('community.form.photoLabel', 'Photo / Harvest Image')}</label>
              <div 
                className="image-upload-area" 
                onClick={() => document.getElementById('imageInput').click()}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="image-preview" />
                ) : (
                  <div className="upload-placeholder">
                    <RiImageAddLine style={{ fontSize: '28px', color: 'var(--primary, #6b9080)', marginBottom: '4px' }} />
                    <span>{t('community.form.uploadPhoto', 'Click to upload a photo')}</span>
                    <span className="upload-sub">{t('community.form.optional', '(Optional)')}</span>
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
                <label>{t('community.form.tagPlant', 'Tag Plant (Optional)')}</label>
                <select name="plantId" value={formData.plantId} onChange={handleChange}>
                  <option value="">{t('community.form.none', 'None')}</option>
                  {plants.map((p) => (
                    <option key={p._id} value={p._id}>
                      {getLocalizedDynamicText(p.name)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>{t('community.form.tagGarden', 'Tag Garden (Optional)')}</label>
                <select id="gardenSelect" name="gardenId" value={formData.gardenId} onChange={handleChange}>
                  <option value="">{t('community.form.none', 'None')}</option>
                  {gardens.map((g) => (
                    <option key={g._id} value={g._id}>
                      {getLocalizedDynamicText(g.name)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Tags */}
          <div className="form-group">
            <label>{t('community.form.tagsLabel', 'Tags (Topics)')}</label>
            <div className="tag-input-group">
              <input
                id="tagInput"
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder={t('community.form.tagsPlaceholder', 'Add tags (e.g. tomato, balcony, organic)')}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              />
              <button type="button" className="btn-secondary add-tag-btn" onClick={handleAddTag}>
                {t('community.form.addTagBtn', 'Add')}
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
              {t('common.cancel', 'Cancel')}
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              <RiSendPlane2Fill style={{ fontSize: '0.95rem' }} />
              {loading 
                ? t('community.form.publishing', 'Publishing...') 
                : post 
                  ? t('community.form.saveChanges', 'Save Changes') 
                  : t('community.form.publishPost', 'Publish Post')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostForm;
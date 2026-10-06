import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { useNotification } from '../../hooks/useNotification';
import ConfirmModal from '../Common/ConfirmModal';
import { validatePostForm } from '../../utils/validators';
import AdminPagination from './AdminPagination';
import {
  FaShieldAlt,
  FaSearch,
  FaFileCsv,
  FaTrash,
  FaCheck,
  FaFlag,
  FaUndoAlt,
  FaFilter,
  FaEye,
  FaEdit,
  FaPlus,
  FaTimes,
  FaThumbsUp,
  FaComments,
  FaCalendarAlt,
  FaUser,
  FaExclamationCircle,
  FaChevronDown,
} from 'react-icons/fa';
import './ContentModeration.css';

const CategoryFilterDropdown = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const options = [
    { value: 'all', label: 'All Categories' },
    { value: 'question', label: 'Question' },
    { value: 'tip', label: 'Tip' },
    { value: 'showcase', label: 'Showcase' },
    { value: 'event', label: 'Event' },
    { value: 'general', label: 'General' },
  ];

  const currentLabel = options.find((o) => o.value === value)?.label || 'All Categories';

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="custom-admin-dropdown" ref={dropdownRef}>
      <button
        type="button"
        className="custom-dropdown-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{currentLabel}</span>
        <FaChevronDown style={{ fontSize: '0.65rem', marginLeft: '0.4rem', opacity: 0.7 }} />
      </button>

      {isOpen && (
        <div className="custom-dropdown-menu">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`custom-dropdown-item ${value === opt.value ? 'active' : ''}`}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const ContentModeration = () => {
  const { t } = useTranslation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewMode, setViewMode] = useState('all'); // 'all', 'flagged', 'pending'

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals
  const [viewingPost, setViewingPost] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'general', imageUrl: '' });
  const [postErrors, setPostErrors] = useState({});

  const { addNotification } = useNotification();

  useEffect(() => {
    loadPosts();
  }, [viewMode]);

  // Reset page when search, category, or view mode changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter, viewMode]);

  const totalPages = Math.max(1, Math.ceil(posts.length / pageSize));
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginatedPosts = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return posts.slice(startIdx, startIdx + pageSize);
  }, [posts, currentPage, pageSize]);

  const loadPosts = async (overrideSearch, overrideCategory) => {
    setLoading(true);
    const activeSearch = overrideSearch !== undefined ? overrideSearch : search;
    const activeCategory = overrideCategory !== undefined ? overrideCategory : categoryFilter;
    try {
      let endpoint;
      if (viewMode === 'flagged') {
        endpoint = '/admin/flagged-posts';
      } else {
        const params = new URLSearchParams();
        if (activeSearch && activeSearch.trim()) params.append('search', activeSearch.trim());
        if (activeCategory && activeCategory !== 'all') params.append('category', activeCategory);
        if (viewMode === 'flagged') params.append('flagged', 'true');
        endpoint = `/admin/posts?${params.toString()}`;
      }

      const res = await api.get(endpoint);
      let allPosts = res.data.posts || [];

      if (viewMode === 'pending') {
        allPosts = allPosts.filter((p) => !p.isApproved && !p.isFlagged);
      }

      setPosts(allPosts);
    } catch (error) {
      console.error('Failed to load posts:', error);
      addNotification(t('admin.moderation.loadFailed', 'Failed to load posts'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    if (!val.trim()) {
      loadPosts('');
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadPosts(search);
  };

  const validatePost = () => {
    const { isValid, errors: formErrors } = validatePostForm(newPost, true);
    setPostErrors(formErrors);
    return isValid;
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!validatePost()) return;
    try {
      await api.post('/admin/posts', newPost);
      addNotification(t('admin.moderation.createSuccess', 'Community post / announcement created successfully!'), 'success');
      setShowCreatePostModal(false);
      setNewPost({ title: '', content: '', category: 'general', imageUrl: '' });
      setPostErrors({});
      loadPosts();
    } catch (error) {
      addNotification(error.response?.data?.message || t('admin.moderation.createFailed', 'Failed to create post'), 'error');
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/admin/posts/${id}/approve`);
      setPosts(posts.map((p) => (p._id === id ? { ...p, isApproved: true, isFlagged: false } : p)));
      addNotification(t('admin.moderation.approvedSuccess', 'Post approved successfully'), 'success');
    } catch (error) {
      addNotification(t('admin.moderation.approveFailed', 'Failed to approve post'), 'error');
    }
  };

  const handleFlag = async (id) => {
    try {
      await api.put(`/admin/posts/${id}/flag`);
      setPosts(posts.map((p) => (p._id === id ? { ...p, isFlagged: true } : p)));
      addNotification(t('admin.moderation.flaggedSuccess', 'Post flagged for review'), 'warning');
    } catch (error) {
      addNotification(t('admin.moderation.flagFailed', 'Failed to flag post'), 'error');
    }
  };

  const handleUnflag = async (id) => {
    try {
      await api.put(`/admin/posts/${id}/unflag`);
      setPosts(posts.map((p) => (p._id === id ? { ...p, isFlagged: false } : p)));
      addNotification(t('admin.moderation.unflaggedSuccess', 'Flag removed from post'), 'success');
    } catch (error) {
      addNotification(t('admin.moderation.unflagFailed', 'Failed to remove flag'), 'error');
    }
  };

  // Confirm Modal state
  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const promptDeletePost = (id, title) => {
    setConfirmConfig({
      isOpen: true,
      title: t('admin.moderation.deleteConfirm.title', 'Delete Post'),
      message: t('admin.moderation.deleteConfirm.message', 'Are you sure you want to permanently delete post "{{title}}"?', { title }),
      onConfirm: async () => {
        try {
          await api.delete(`/admin/posts/${id}`);
          setPosts(posts.filter((p) => p._id !== id));
          addNotification(t('admin.moderation.deleteSuccess', 'Post deleted permanently'), 'success');
        } catch (error) {
          addNotification(t('admin.moderation.deleteFailed', 'Failed to delete post'), 'error');
        }
      },
    });
  };

  const handleSaveEditPost = async (e) => {
    e.preventDefault();
    if (!editingPost) return;
    try {
      await api.put(`/admin/posts/${editingPost._id}`, {
        isApproved: editingPost.isApproved,
        isFlagged: editingPost.isFlagged,
      });
      setPosts(posts.map((p) => (p._id === editingPost._id ? editingPost : p)));
      addNotification(t('admin.moderation.updateSuccess', 'Post moderation status updated successfully'), 'success');
      setEditingPost(null);
    } catch (error) {
      addNotification(t('admin.moderation.updateFailed', 'Failed to update post status'), 'error');
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await api.get('/admin/export/posts', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'urbanfarm_posts.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      addNotification(t('admin.moderation.exportSuccess', 'Posts CSV exported successfully!'), 'success');
    } catch (error) {
      addNotification(t('admin.moderation.exportFailed', 'Failed to export posts CSV'), 'error');
    }
  };

  return (
    <div className="content-moderation-container">
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
      />
      <div className="admin-page-header">
        <div>
          <h2>{t('admin.moderation.title', 'Community Content Moderation')}</h2>
          <p>{t('admin.moderation.subtitle', 'Review user community posts, manage flags, approve submissions, and create official posts.')}</p>
        </div>
        <div className="admin-header-actions">
          <button className="admin-btn admin-btn-outline" onClick={handleExportCSV}>
            <FaFileCsv /> {t('admin.moderation.exportCSV', 'Export Posts CSV')}
          </button>
          <button className="admin-btn admin-btn-primary" onClick={() => setShowCreatePostModal(true)}>
            <FaPlus /> {t('admin.moderation.createPost', 'Create Post')}
          </button>
        </div>
      </div>

      {/* View mode tabs */}
      <div className="admin-tab-row" style={{ margin: '1.25rem 0' }}>
        <button
          className={`admin-tab-btn ${viewMode === 'all' ? 'active' : ''}`}
          onClick={() => setViewMode('all')}
        >
          {t('admin.moderation.allPosts', 'All Posts')} ({posts.length})
        </button>
        <button
          className={`admin-tab-btn ${viewMode === 'flagged' ? 'active' : ''}`}
          onClick={() => setViewMode('flagged')}
        >
          <FaFlag /> {t('admin.moderation.flaggedPosts', 'Flagged')}
        </button>
        <button
          className={`admin-tab-btn ${viewMode === 'pending' ? 'active' : ''}`}
          onClick={() => setViewMode('pending')}
        >
          <FaShieldAlt /> {t('admin.moderation.pendingApproval', 'Pending Approval')}
        </button>
      </div>

      {/* Filter Bar */}
      <div className="admin-filter-bar">
        <form onSubmit={handleSearchSubmit} className="admin-search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder={t('admin.moderation.searchPlaceholder', 'Search posts by title or content...')}
            value={search}
            onChange={handleSearchChange}
            autoComplete="off"
          />
          <button type="submit" className="admin-btn admin-btn-sm search-submit-btn">{t('common.search', 'Search')}</button>
        </form>
        <div className="admin-filters">
          <div className="filter-group">
            <FaFilter />
            <label>{t('common.category', 'Category')}:</label>
            <CategoryFilterDropdown
              value={categoryFilter}
              onChange={(val) => {
                setCategoryFilter(val);
                loadPosts(undefined, val);
              }}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="admin-loading-spinner">{t('admin.moderation.loading', 'Loading posts...')}</div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>{t('admin.moderation.thPost', 'Post')}</th>
                <th>{t('admin.moderation.thAuthor', 'Author')}</th>
                <th>{t('common.category', 'Category')}</th>
                <th>{t('admin.moderation.thStatus', 'Status')}</th>
                <th>{t('admin.moderation.thDate', 'Date')}</th>
                <th>{t('admin.moderation.thActions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {posts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">{t('admin.moderation.noPosts', 'No posts found.')}</td>
                </tr>
              ) : (
                paginatedPosts.map((post) => (
                  <tr key={post._id} className={post.isFlagged ? 'row-flagged' : ''}>
                    <td data-label={t('admin.moderation.thPost', 'Post')}>
                      <div className="td-cell-content">
                        <div className="post-title-cell">
                          <strong>{post.title}</strong>
                          <small>{post.content.length > 60 ? post.content.substring(0, 60) + '...' : post.content}</small>
                        </div>
                      </div>
                    </td>
                    <td data-label={t('admin.moderation.thAuthor', 'Author')}>
                      <div className="td-cell-content">
                        {post.userId?.name || t('admin.moderation.anonymous', 'Anonymous')}
                      </div>
                    </td>
                    <td data-label={t('common.category', 'Category')}>
                      <div className="td-cell-content">
                        <span className={`category-tag ${post.category}`}>{post.category}</span>
                      </div>
                    </td>
                    <td data-label={t('admin.moderation.thStatus', 'Status')}>
                      <div className="td-cell-content">
                        {post.isFlagged ? (
                          <span className="mod-status-badge flagged"><FaFlag /> {t('admin.moderation.flagged', 'Flagged')}</span>
                        ) : post.isApproved ? (
                          <span className="mod-status-badge approved"><FaCheck /> {t('admin.moderation.approved', 'Approved')}</span>
                        ) : (
                          <span className="mod-status-badge pending">{t('admin.moderation.pending', 'Pending')}</span>
                        )}
                      </div>
                    </td>
                    <td data-label={t('admin.moderation.thDate', 'Date')}>
                      <div className="td-cell-content">
                        <small>{new Date(post.createdAt).toLocaleDateString()}</small>
                      </div>
                    </td>
                    <td data-label={t('admin.moderation.thActions', 'Actions')}>
                      <div className="action-btns">
                        <button
                          className="admin-action-icon approve"
                          title={t('admin.moderation.viewPost', 'View Full Post')}
                          onClick={() => setViewingPost(post)}
                        >
                          <FaEye />
                        </button>
                        <button
                          className="admin-action-icon edit"
                          title={t('admin.moderation.editStatus', 'Edit Moderation Status')}
                          onClick={() => setEditingPost(post)}
                        >
                          <FaEdit />
                        </button>
                        {!post.isApproved && (
                          <button
                            className="admin-action-icon approve"
                            title={t('admin.moderation.approvePost', 'Approve Post')}
                            onClick={() => handleApprove(post._id)}
                          >
                            <FaCheck />
                          </button>
                        )}
                        {post.isFlagged ? (
                          <button
                            className="admin-action-icon unflag"
                            title={t('admin.moderation.removeFlag', 'Remove Flag')}
                            onClick={() => handleUnflag(post._id)}
                          >
                            <FaUndoAlt />
                          </button>
                        ) : (
                          <button
                            className="admin-action-icon flag"
                            title={t('admin.moderation.flagPost', 'Flag Post')}
                            onClick={() => handleFlag(post._id)}
                          >
                            <FaFlag />
                          </button>
                        )}
                        <button
                          className="admin-action-icon delete"
                          title={t('admin.moderation.deletePost', 'Delete Post')}
                          onClick={() => promptDeletePost(post._id, post.title)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <AdminPagination
            currentPage={currentPage}
            totalItems={posts.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      )}

      {/* Create Post Modal */}
      {showCreatePostModal && (
        <div className="admin-modal-overlay" onClick={() => setShowCreatePostModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3><FaPlus /> {t('admin.moderation.createModalTitle', 'Create Official Community Post')}</h3>
              <button className="modal-close" onClick={() => setShowCreatePostModal(false)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleCreatePost} className="admin-modal-form" noValidate>
              <div className="form-group">
                <label>{t('admin.moderation.titleLabel', 'Post Title')} <span className="required">*</span></label>
                <input
                  type="text"
                  placeholder={t('admin.moderation.titlePlaceholder', 'e.g. Spring Planting Guide & Community Contest')}
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  className={postErrors.title ? 'input-error' : ''}
                />
                {postErrors.title && <span className="error-text"><FaExclamationCircle /> {postErrors.title}</span>}
              </div>

              <div className="form-group">
                <label>{t('common.category', 'Category')} <span className="required">*</span></label>
                <select
                  value={newPost.category}
                  onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                >
                  <option value="general">{t('admin.moderation.categories.general', 'General')}</option>
                  <option value="question">{t('admin.moderation.categories.question', 'Question')}</option>
                  <option value="tip">{t('admin.moderation.categories.tip', 'Tip')}</option>
                  <option value="showcase">{t('admin.moderation.categories.showcase', 'Showcase')}</option>
                  <option value="event">{t('admin.moderation.categories.event', 'Event')}</option>
                </select>
              </div>

              <div className="form-group">
                <label>{t('admin.moderation.contentLabel', 'Post Content')} <span className="required">*</span></label>
                <textarea
                  rows="4"
                  placeholder={t('admin.moderation.contentPlaceholder', 'Write announcement or community update text...')}
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  className={postErrors.content ? 'input-error' : ''}
                />
                {postErrors.content && <span className="error-text"><FaExclamationCircle /> {postErrors.content}</span>}
              </div>

              <div className="form-group">
                <label>{t('admin.moderation.imageLabel', 'Cover Image URL (Optional)')}</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newPost.imageUrl}
                  onChange={(e) => setNewPost({ ...newPost, imageUrl: e.target.value })}
                  className={postErrors.imageUrl ? 'input-error' : ''}
                />
                {postErrors.imageUrl && <span className="error-text"><FaExclamationCircle /> {postErrors.imageUrl}</span>}
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-outline" onClick={() => setShowCreatePostModal(false)}>
                  {t('common.cancel', 'Cancel')}
                </button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  <FaCheck /> {t('admin.moderation.publishPost', 'Publish Post')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Post Modal */}
      {viewingPost && (
        <div className="admin-modal-overlay" onClick={() => setViewingPost(null)}>
          <div className="admin-modal admin-post-preview-modal" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header" style={{ padding: '1rem 1.4rem' }}>
              <h3><FaEye /> {t('admin.moderation.previewTitle', 'Community Post Preview')}</h3>
              <button className="modal-close" onClick={() => setViewingPost(null)}>
                <FaTimes />
              </button>
            </div>
            <div className="admin-modal-form" style={{ padding: '1.2rem', gap: '0.85rem' }}>
              <div>
                <span className={`category-tag ${viewingPost.category}`} style={{ marginBottom: '0.35rem' }}>
                  {viewingPost.category.toUpperCase()}
                </span>
                <h4 style={{ margin: '0.15rem 0', fontSize: '1.2rem', color: 'var(--text)', wordBreak: 'break-word' }}>{viewingPost.title}</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem 1rem', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  <span><FaUser /> {viewingPost.userId?.name || t('admin.moderation.anonymous', 'Anonymous')} ({viewingPost.userId?.email || 'N/A'})</span>
                  <span><FaCalendarAlt /> {new Date(viewingPost.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {viewingPost.imageUrl && (
                <div className="admin-post-preview-img-wrapper">
                  <img
                    src={viewingPost.imageUrl}
                    alt={viewingPost.title}
                    className="admin-post-preview-img"
                  />
                </div>
              )}

              <div style={{
                padding: '0.75rem 1rem',
                background: 'var(--surface)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                lineHeight: '1.5',
                fontSize: '0.88rem',
                maxHeight: '140px',
                overflowY: 'auto'
              }}>
                {viewingPost.content}
              </div>

              <div className="admin-post-preview-stats">
                <div>
                  <label>{t('admin.moderation.labelLikes', 'LIKES')}</label>
                  <strong><FaThumbsUp style={{ color: 'var(--sage)' }} /> {viewingPost.likes?.length || 0}</strong>
                </div>
                <div>
                  <label>{t('admin.moderation.labelComments', 'COMMENTS')}</label>
                  <strong><FaComments style={{ color: 'var(--accent)' }} /> {viewingPost.comments?.length || 0}</strong>
                </div>
                <div>
                  <label>{t('admin.moderation.labelModStatus', 'MODERATION STATUS')}</label>
                  {viewingPost.isFlagged ? (
                    <span className="mod-status-badge flagged" style={{ padding: '0.15rem 0.5rem', fontSize: '0.72rem' }}><FaFlag /> {t('admin.moderation.flagged', 'Flagged')}</span>
                  ) : viewingPost.isApproved ? (
                    <span className="mod-status-badge approved" style={{ padding: '0.15rem 0.5rem', fontSize: '0.72rem' }}><FaCheck /> {t('admin.moderation.approved', 'Approved')}</span>
                  ) : (
                    <span className="mod-status-badge pending" style={{ padding: '0.15rem 0.5rem', fontSize: '0.72rem' }}>{t('admin.moderation.pending', 'Pending')}</span>
                  )}
                </div>
              </div>

              <div className="admin-modal-footer" style={{ marginTop: '0.2rem', paddingTop: '0.5rem' }}>
                <button
                  type="button"
                  className="admin-btn admin-btn-outline"
                  onClick={() => {
                    setEditingPost({ ...viewingPost });
                    setViewingPost(null);
                  }}
                >
                  <FaEdit /> {t('admin.moderation.editModeration', 'Edit Moderation')}
                </button>
                <button type="button" className="admin-btn admin-btn-primary" onClick={() => setViewingPost(null)}>
                  {t('common.close', 'Close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit / Moderate Post Modal */}
      {editingPost && (
        <div className="admin-modal-overlay" onClick={() => setEditingPost(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3><FaEdit /> {t('admin.moderation.editModalTitle', 'Moderate & Edit Post')}</h3>
              <button className="modal-close" onClick={() => setEditingPost(null)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSaveEditPost} className="admin-modal-form" noValidate>
              <div className="form-group">
                <label>{t('admin.moderation.postTitle', 'Post Title')}</label>
                <input
                  type="text"
                  disabled
                  value={editingPost.title}
                />
              </div>

              <div className="form-group">
                <label>{t('admin.moderation.approvalStatus', 'Approval Status')}</label>
                <select
                  value={editingPost.isApproved ? 'approved' : 'unapproved'}
                  onChange={(e) => setEditingPost({ ...editingPost, isApproved: e.target.value === 'approved' })}
                >
                  <option value="approved">{t('admin.moderation.approvedVisible', 'Approved (Visible on Community Feed)')}</option>
                  <option value="unapproved">{t('admin.moderation.unapprovedPending', 'Unapproved / Pending Review')}</option>
                </select>
              </div>

              <div className="form-group">
                <label>{t('admin.moderation.flaggedStatus', 'Flagged Status')}</label>
                <select
                  value={editingPost.isFlagged ? 'flagged' : 'clean'}
                  onChange={(e) => setEditingPost({ ...editingPost, isFlagged: e.target.value === 'flagged' })}
                >
                  <option value="clean">{t('admin.moderation.cleanNoViolation', 'Clean (No Policy Violation)')}</option>
                  <option value="flagged">{t('admin.moderation.flaggedViolation', 'Flagged (Inappropriate / Reported Content)')}</option>
                </select>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-outline" onClick={() => setEditingPost(null)}>
                  {t('common.cancel', 'Cancel')}
                </button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  <FaCheck /> {t('admin.moderation.applyModeration', 'Apply Moderation')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentModeration;
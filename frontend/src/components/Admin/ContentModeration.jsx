import React, { useState, useEffect, useMemo } from 'react';
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
  FaImage,
  FaTimes,
  FaThumbsUp,
  FaComments,
  FaCalendarAlt,
  FaUser,
  FaExclamationCircle,
} from 'react-icons/fa';
import './ContentModeration.css';

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

  const loadPosts = async () => {
    setLoading(true);
    try {
      let endpoint;
      if (viewMode === 'flagged') {
        endpoint = '/admin/flagged-posts';
      } else {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (categoryFilter !== 'all') params.append('category', categoryFilter);
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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadPosts();
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

  const handleModerate = async (postId, action) => {
    try {
      await api.put(`/admin/posts/${postId}/moderate`, {
        isApproved: action === 'approve',
        isFlagged: action === 'flag',
      });
      addNotification(
        action === 'approve'
          ? t('admin.moderation.approvedSuccess', 'Post approved successfully!')
          : t('admin.moderation.flaggedSuccess', 'Post flagged successfully!'),
        'success'
      );
      loadPosts();
    } catch (error) {
      addNotification(t('admin.moderation.actionFailed', 'Moderation action failed'), 'error');
    }
  };

  const handleSaveEditPost = async (e) => {
    e.preventDefault();
    if (!editingPost) return;
    try {
      await api.put(`/admin/posts/${editingPost._id}/moderate`, {
        isApproved: editingPost.isApproved,
        isFlagged: editingPost.isFlagged,
      });
      addNotification(t('admin.moderation.updateSuccess', 'Post moderation status updated successfully!'), 'success');
      setEditingPost(null);
      loadPosts();
    } catch (error) {
      addNotification(t('admin.moderation.updateFailed', 'Failed to update post'), 'error');
    }
  };

  // Confirm Modal state
  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const promptDeletePost = (postId, postTitle) => {
    setConfirmConfig({
      isOpen: true,
      title: t('admin.moderation.deleteTitle', 'Delete Community Post'),
      message: t('admin.moderation.deleteMsg', 'Are you sure you want to permanently delete post "{{title}}"?', { title: postTitle }),
      onConfirm: async () => {
        try {
          await api.delete(`/admin/posts/${postId}`);
          addNotification(t('admin.moderation.deleteSuccess', 'Post deleted successfully'), 'success');
          loadPosts();
        } catch (error) {
          addNotification(t('admin.moderation.deleteFailed', 'Failed to delete post'), 'error');
        }
      },
    });
  };

  const handleExportCSV = async () => {
    try {
      const response = await api.get('/admin/export/posts', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'urbanfarm_posts_export.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      addNotification(t('admin.moderation.exportSuccess', 'Posts CSV exported!'), 'success');
    } catch (error) {
      addNotification(t('admin.moderation.exportFailed', 'Failed to export CSV'), 'error');
    }
  };

  return (
    <div className="moderation-container">
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
      />
      <div className="admin-page-header">
        <div>
          <h2>{t('admin.moderation.title', 'Content Moderation & Announcement Hub')}</h2>
          <p>{t('admin.moderation.subtitle', 'Review, create announcements, view, edit, approve, flag, or remove community posts.')}</p>
        </div>
        <div className="admin-header-actions">
          <button className="admin-btn admin-btn-primary" onClick={() => setShowCreatePostModal(true)}>
            <FaPlus /> {t('admin.moderation.createAnnouncement', 'Create Announcement / Post')}
          </button>
          <button className="admin-btn admin-btn-outline" onClick={handleExportCSV}>
            <FaFileCsv /> {t('admin.moderation.exportCSV', 'Export Posts CSV')}
          </button>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="admin-tab-row">
        <button
          className={`admin-tab-btn ${viewMode === 'all' ? 'active' : ''}`}
          onClick={() => setViewMode('all')}
        >
          <FaEye /> {t('admin.moderation.allPosts', 'All Posts')} ({posts.length})
        </button>
        <button
          className={`admin-tab-btn ${viewMode === 'flagged' ? 'active' : ''}`}
          onClick={() => setViewMode('flagged')}
        >
          <FaFlag /> {t('admin.moderation.flagged', 'Flagged')}
        </button>
        <button
          className={`admin-tab-btn ${viewMode === 'pending' ? 'active' : ''}`}
          onClick={() => setViewMode('pending')}
        >
          <FaShieldAlt /> {t('admin.moderation.pendingReview', 'Pending Review')}
        </button>
      </div>

      {/* Filters */}
      <div className="admin-filter-bar">
        <form onSubmit={handleSearchSubmit} className="admin-search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder={t('admin.moderation.searchPlaceholder', 'Search posts by title or content...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="admin-btn admin-btn-sm">{t('common.search', 'Search')}</button>
        </form>
        <div className="admin-filters">
          <div className="filter-group">
            <FaFilter />
            <label>{t('common.category', 'Category')}:</label>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="all">{t('admin.moderation.categories.all', 'All Categories')}</option>
              <option value="question">{t('admin.moderation.categories.question', 'Question')}</option>
              <option value="tip">{t('admin.moderation.categories.tip', 'Tip')}</option>
              <option value="showcase">{t('admin.moderation.categories.showcase', 'Showcase')}</option>
              <option value="event">{t('admin.moderation.categories.event', 'Event')}</option>
              <option value="general">{t('admin.moderation.categories.general', 'General')}</option>
            </select>
          </div>
          <button className="admin-btn admin-btn-sm" onClick={loadPosts}>{t('common.filter', 'Apply')}</button>
        </div>
      </div>

      {/* Posts Table */}
      {loading ? (
        <div className="admin-loading-spinner">{t('admin.moderation.loading', 'Loading posts...')}</div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>{t('common.title', 'Title')}</th>
                <th>{t('admin.moderation.thAuthor', 'Author')}</th>
                <th>{t('common.category', 'Category')}</th>
                <th>{t('common.status', 'Status')}</th>
                <th>{t('admin.moderation.thLikes', 'Likes')}</th>
                <th>{t('admin.moderation.thComments', 'Comments')}</th>
                <th>{t('common.date', 'Date')}</th>
                <th>{t('common.actions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {posts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4">
                    {viewMode === 'flagged'
                      ? t('admin.moderation.noFlagged', 'No flagged posts. All content is clean!')
                      : viewMode === 'pending'
                      ? t('admin.moderation.noPending', 'No posts pending review.')
                      : t('admin.moderation.noPosts', 'No posts found.')}
                  </td>
                </tr>
              ) : (
                paginatedPosts.map((post) => (
                  <tr key={post._id} className={post.isFlagged ? 'row-flagged' : ''}>
                    <td>
                      <div className="post-title-cell">
                        {post.imageUrl && <FaImage className="post-has-image" />}
                        <strong>{post.title}</strong>
                      </div>
                    </td>
                    <td>
                      <small>{post.userId?.name || t('admin.moderation.adminSystem', 'Admin / System')}</small>
                      <br />
                      <small className="text-muted">{post.userId?.email || ''}</small>
                    </td>
                    <td>
                      <span className={`category-tag ${post.category}`}>{t(`admin.moderation.categories.${post.category}`, post.category)}</span>
                    </td>
                    <td>
                      {post.isFlagged ? (
                        <span className="mod-status-badge flagged"><FaFlag /> {t('admin.moderation.flagged', 'Flagged')}</span>
                      ) : post.isApproved ? (
                        <span className="mod-status-badge approved"><FaCheck /> {t('admin.moderation.approved', 'Approved')}</span>
                      ) : (
                        <span className="mod-status-badge pending">{t('admin.moderation.pending', 'Pending')}</span>
                      )}
                    </td>
                    <td>{post.likes?.length || 0}</td>
                    <td>{post.comments?.length || 0}</td>
                    <td><small>{new Date(post.createdAt).toLocaleDateString()}</small></td>
                    <td>
                      <div className="action-btns">
                        <button
                          className="admin-action-icon approve"
                          title={t('admin.moderation.viewDetails', 'View Full Post Details')}
                          onClick={() => setViewingPost(post)}
                        >
                          <FaEye />
                        </button>
                        <button
                          className="admin-action-icon edit"
                          title={t('admin.moderation.editPost', 'Edit / Moderate Post')}
                          onClick={() => setEditingPost({ ...post })}
                        >
                          <FaEdit />
                        </button>
                        {!post.isApproved && !post.isFlagged && (
                          <button
                            className="admin-action-icon approve"
                            title={t('admin.moderation.approvePost', 'Approve Post')}
                            onClick={() => handleModerate(post._id, 'approve')}
                          >
                            <FaCheck />
                          </button>
                        )}
                        {post.isFlagged && (
                          <button
                            className="admin-action-icon approve"
                            title={t('admin.moderation.unflagApprove', 'Unflag & Approve')}
                            onClick={() => handleModerate(post._id, 'approve')}
                          >
                            <FaUndoAlt />
                          </button>
                        )}
                        {!post.isFlagged && (
                          <button
                            className="admin-action-icon warn"
                            title={t('admin.moderation.flagPost', 'Flag Post')}
                            onClick={() => handleModerate(post._id, 'flag')}
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

      {/* Create New Post Modal */}
      {showCreatePostModal && (
        <div className="admin-modal-overlay" onClick={() => setShowCreatePostModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3><FaPlus /> {t('admin.moderation.createModalTitle', 'Create Community Announcement')}</h3>
              <button className="modal-close" onClick={() => setShowCreatePostModal(false)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleCreatePost} className="admin-modal-form" noValidate>
              <div className="form-group">
                <label>{t('admin.moderation.announcementTitle', 'Announcement Title')} <span className="required">*</span></label>
                <input
                  type="text"
                  placeholder={t('admin.moderation.titlePlaceholder', 'e.g. Spring Seed Swap Announcement')}
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
                <label>{t('admin.moderation.imageUrl', 'Image URL (Optional)')}</label>
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={newPost.imageUrl}
                  onChange={(e) => setNewPost({ ...newPost, imageUrl: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>{t('admin.moderation.contentText', 'Content Text')} <span className="required">*</span></label>
                <textarea
                  style={{
                    padding: '0.65rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    background: 'var(--surface)',
                    color: 'var(--text)',
                    minHeight: '100px',
                    fontFamily: 'inherit'
                  }}
                  placeholder={t('admin.moderation.contentPlaceholder', 'Write post content here...')}
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  className={postErrors.content ? 'input-error' : ''}
                />
                {postErrors.content && <span className="error-text"><FaExclamationCircle /> {postErrors.content}</span>}
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-outline" onClick={() => setShowCreatePostModal(false)}>
                  {t('common.cancel', 'Cancel')}
                </button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  <FaCheck /> {t('admin.moderation.publishAnnouncement', 'Publish Announcement')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Post Modal */}
      {viewingPost && (
        <div className="admin-modal-overlay" onClick={() => setViewingPost(null)}>
          <div className="admin-modal" style={{ maxWidth: '560px', maxHeight: '84vh', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header" style={{ padding: '0.85rem 1.25rem' }}>
              <h3 style={{ fontSize: '1.05rem' }}><FaEye /> {t('admin.moderation.previewTitle', 'Community Post Preview')}</h3>
              <button className="modal-close" onClick={() => setViewingPost(null)}>
                <FaTimes />
              </button>
            </div>
            <div className="admin-modal-form" style={{ padding: '0.9rem 1.25rem', gap: '0.65rem', overflowY: 'auto', flex: 1 }}>
              <div>
                <span className={`category-tag ${viewingPost.category}`} style={{ marginBottom: '0.25rem', display: 'inline-block', fontSize: '0.72rem', padding: '0.15rem 0.5rem' }}>
                  {t(`admin.moderation.categories.${viewingPost.category}`, viewingPost.category).toUpperCase()}
                </span>
                <h4 style={{ margin: '0.1rem 0', fontSize: '1.1rem', color: 'var(--text)' }}>{viewingPost.title}</h4>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  <span><FaUser /> {viewingPost.userId?.name || t('admin.moderation.anonymous', 'Anonymous')} ({viewingPost.userId?.email || 'N/A'})</span>
                  <span><FaCalendarAlt /> {new Date(viewingPost.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {viewingPost.imageUrl && (
                <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', height: '140px', maxHeight: '140px', border: '1px solid var(--border)' }}>
                  <img src={viewingPost.imageUrl} alt={viewingPost.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}

              <div style={{
                padding: '0.65rem 0.85rem',
                background: 'var(--surface)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                lineHeight: '1.45',
                fontSize: '0.84rem',
                maxHeight: '90px',
                overflowY: 'auto'
              }}>
                {viewingPost.content}
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '0.5rem',
                padding: '0.45rem 0.65rem',
                background: 'var(--surface)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                textAlign: 'center'
              }}>
                <div>
                  <label style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>{t('admin.moderation.labelLikes', 'LIKES')}</label>
                  <strong style={{ fontSize: '0.88rem' }}><FaThumbsUp style={{ color: 'var(--sage)' }} /> {viewingPost.likes?.length || 0}</strong>
                </div>
                <div>
                  <label style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>{t('admin.moderation.labelComments', 'COMMENTS')}</label>
                  <strong style={{ fontSize: '0.88rem' }}><FaComments style={{ color: 'var(--accent)' }} /> {viewingPost.comments?.length || 0}</strong>
                </div>
                <div>
                  <label style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>{t('admin.moderation.labelModStatus', 'MODERATION STATUS')}</label>
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
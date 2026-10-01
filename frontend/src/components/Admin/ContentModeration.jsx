import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useNotification } from '../../hooks/useNotification';
import ConfirmModal from '../Common/ConfirmModal';
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
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewMode, setViewMode] = useState('all'); // 'all', 'flagged', 'pending'

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
      addNotification('Failed to load posts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadPosts();
  };

  const validatePost = () => {
    const errs = {};
    if (!newPost.title.trim()) errs.title = 'Post title is required';
    if (!newPost.content.trim()) {
      errs.content = 'Post content is required';
    } else if (newPost.content.trim().length < 10) {
      errs.content = 'Content must be at least 10 characters long';
    }
    setPostErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!validatePost()) return;
    try {
      await api.post('/admin/posts', newPost);
      addNotification('Community post / announcement created successfully!', 'success');
      setShowCreatePostModal(false);
      setNewPost({ title: '', content: '', category: 'general', imageUrl: '' });
      setPostErrors({});
      loadPosts();
    } catch (error) {
      addNotification(error.response?.data?.message || 'Failed to create post', 'error');
    }
  };

  const handleModerate = async (postId, action) => {
    try {
      await api.put(`/admin/posts/${postId}/moderate`, {
        isApproved: action === 'approve',
        isFlagged: action === 'flag',
      });
      addNotification(
        `Post ${action === 'approve' ? 'approved' : 'flagged'} successfully!`,
        'success'
      );
      loadPosts();
    } catch (error) {
      addNotification('Moderation action failed', 'error');
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
      addNotification('Post moderation status updated successfully!', 'success');
      setEditingPost(null);
      loadPosts();
    } catch (error) {
      addNotification('Failed to update post', 'error');
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
      title: 'Delete Community Post',
      message: `Are you sure you want to permanently delete post "${postTitle}"?`,
      onConfirm: async () => {
        try {
          await api.delete(`/admin/posts/${postId}`);
          addNotification('Post deleted successfully', 'success');
          loadPosts();
        } catch (error) {
          addNotification('Failed to delete post', 'error');
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
      addNotification('Posts CSV exported!', 'success');
    } catch (error) {
      addNotification('Failed to export CSV', 'error');
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
          <h2>Content Moderation & Announcement Hub</h2>
          <p>Review, create announcements, view, edit, approve, flag, or remove community posts.</p>
        </div>
        <div className="admin-header-actions">
          <button className="admin-btn admin-btn-primary" onClick={() => setShowCreatePostModal(true)}>
            <FaPlus /> Create Announcement / Post
          </button>
          <button className="admin-btn admin-btn-outline" onClick={handleExportCSV}>
            <FaFileCsv /> Export Posts CSV
          </button>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="admin-tab-row">
        <button
          className={`admin-tab-btn ${viewMode === 'all' ? 'active' : ''}`}
          onClick={() => setViewMode('all')}
        >
          <FaEye /> All Posts ({posts.length})
        </button>
        <button
          className={`admin-tab-btn ${viewMode === 'flagged' ? 'active' : ''}`}
          onClick={() => setViewMode('flagged')}
        >
          <FaFlag /> Flagged
        </button>
        <button
          className={`admin-tab-btn ${viewMode === 'pending' ? 'active' : ''}`}
          onClick={() => setViewMode('pending')}
        >
          <FaShieldAlt /> Pending Review
        </button>
      </div>

      {/* Filters */}
      <div className="admin-filter-bar">
        <form onSubmit={handleSearchSubmit} className="admin-search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search posts by title or content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="admin-btn admin-btn-sm">Search</button>
        </form>
        <div className="admin-filters">
          <div className="filter-group">
            <FaFilter />
            <label>Category:</label>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="all">All Categories</option>
              <option value="question">Question</option>
              <option value="tip">Tip</option>
              <option value="showcase">Showcase</option>
              <option value="event">Event</option>
              <option value="general">General</option>
            </select>
          </div>
          <button className="admin-btn admin-btn-sm" onClick={loadPosts}>Apply</button>
        </div>
      </div>

      {/* Posts Table */}
      {loading ? (
        <div className="admin-loading-spinner">Loading posts...</div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Category</th>
                <th>Status</th>
                <th>Likes</th>
                <th>Comments</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4">
                    {viewMode === 'flagged'
                      ? 'No flagged posts. All content is clean!'
                      : viewMode === 'pending'
                      ? 'No posts pending review.'
                      : 'No posts found.'}
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post._id} className={post.isFlagged ? 'row-flagged' : ''}>
                    <td>
                      <div className="post-title-cell">
                        {post.imageUrl && <FaImage className="post-has-image" />}
                        <strong>{post.title}</strong>
                      </div>
                    </td>
                    <td>
                      <small>{post.userId?.name || 'Admin / System'}</small>
                      <br />
                      <small className="text-muted">{post.userId?.email || ''}</small>
                    </td>
                    <td>
                      <span className={`category-tag ${post.category}`}>{post.category}</span>
                    </td>
                    <td>
                      {post.isFlagged ? (
                        <span className="mod-status-badge flagged"><FaFlag /> Flagged</span>
                      ) : post.isApproved ? (
                        <span className="mod-status-badge approved"><FaCheck /> Approved</span>
                      ) : (
                        <span className="mod-status-badge pending">Pending</span>
                      )}
                    </td>
                    <td>{post.likes?.length || 0}</td>
                    <td>{post.comments?.length || 0}</td>
                    <td><small>{new Date(post.createdAt).toLocaleDateString()}</small></td>
                    <td>
                      <div className="action-btns">
                        <button
                          className="admin-action-icon approve"
                          title="View Full Post Details"
                          onClick={() => setViewingPost(post)}
                        >
                          <FaEye />
                        </button>
                        <button
                          className="admin-action-icon edit"
                          title="Edit / Moderate Post"
                          onClick={() => setEditingPost({ ...post })}
                        >
                          <FaEdit />
                        </button>
                        {!post.isApproved && !post.isFlagged && (
                          <button
                            className="admin-action-icon approve"
                            title="Approve Post"
                            onClick={() => handleModerate(post._id, 'approve')}
                          >
                            <FaCheck />
                          </button>
                        )}
                        {post.isFlagged && (
                          <button
                            className="admin-action-icon approve"
                            title="Unflag & Approve"
                            onClick={() => handleModerate(post._id, 'approve')}
                          >
                            <FaUndoAlt />
                          </button>
                        )}
                        {!post.isFlagged && (
                          <button
                            className="admin-action-icon warn"
                            title="Flag Post"
                            onClick={() => handleModerate(post._id, 'flag')}
                          >
                            <FaFlag />
                          </button>
                        )}
                        <button
                          className="admin-action-icon delete"
                          title="Delete Post"
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
        </div>
      )}

      {/* Create New Post Modal */}
      {showCreatePostModal && (
        <div className="admin-modal-overlay" onClick={() => setShowCreatePostModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3><FaPlus /> Create Community Announcement</h3>
              <button className="modal-close" onClick={() => setShowCreatePostModal(false)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleCreatePost} className="admin-modal-form">
              <div className="form-group">
                <label>Announcement Title <span className="required">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Spring Seed Swap Announcement"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                />
                {postErrors.title && <span className="error-text"><FaExclamationCircle /> {postErrors.title}</span>}
              </div>

              <div className="form-group">
                <label>Category <span className="required">*</span></label>
                <select
                  value={newPost.category}
                  onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                >
                  <option value="general">General</option>
                  <option value="question">Question</option>
                  <option value="tip">Tip</option>
                  <option value="showcase">Showcase</option>
                  <option value="event">Event</option>
                </select>
              </div>

              <div className="form-group">
                <label>Image URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={newPost.imageUrl}
                  onChange={(e) => setNewPost({ ...newPost, imageUrl: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Content Text <span className="required">*</span></label>
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
                  required
                  placeholder="Write post content here..."
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                />
                {postErrors.content && <span className="error-text"><FaExclamationCircle /> {postErrors.content}</span>}
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-outline" onClick={() => setShowCreatePostModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  <FaCheck /> Publish Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Post Modal */}
      {viewingPost && (
        <div className="admin-modal-overlay" onClick={() => setViewingPost(null)}>
          <div className="admin-modal" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3><FaEye /> Community Post Preview</h3>
              <button className="modal-close" onClick={() => setViewingPost(null)}>
                <FaTimes />
              </button>
            </div>
            <div className="admin-modal-form">
              <div>
                <span className={`category-tag ${viewingPost.category}`} style={{ marginBottom: '0.5rem', display: 'inline-block' }}>
                  {viewingPost.category.toUpperCase()}
                </span>
                <h4 style={{ margin: '0.2rem 0', fontSize: '1.25rem', color: 'var(--text)' }}>{viewingPost.title}</h4>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
                  <span><FaUser /> {viewingPost.userId?.name || 'Anonymous'} ({viewingPost.userId?.email || 'N/A'})</span>
                  <span><FaCalendarAlt /> {new Date(viewingPost.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {viewingPost.imageUrl && (
                <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', maxHeight: '250px', border: '1px solid var(--border)' }}>
                  <img src={viewingPost.imageUrl} alt={viewingPost.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}

              <div style={{
                padding: '1rem',
                background: 'var(--surface)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                lineHeight: '1.6',
                fontSize: '0.9rem'
              }}>
                {viewingPost.content}
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '0.8rem',
                padding: '0.8rem',
                background: 'var(--surface)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                textAlign: 'center'
              }}>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block' }}>LIKES</label>
                  <strong><FaThumbsUp style={{ color: 'var(--sage)' }} /> {viewingPost.likes?.length || 0}</strong>
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block' }}>COMMENTS</label>
                  <strong><FaComments style={{ color: 'var(--accent)' }} /> {viewingPost.comments?.length || 0}</strong>
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block' }}>MODERATION STATUS</label>
                  {viewingPost.isFlagged ? (
                    <span className="mod-status-badge flagged"><FaFlag /> Flagged</span>
                  ) : viewingPost.isApproved ? (
                    <span className="mod-status-badge approved"><FaCheck /> Approved</span>
                  ) : (
                    <span className="mod-status-badge pending">Pending</span>
                  )}
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn admin-btn-outline"
                  onClick={() => {
                    setEditingPost({ ...viewingPost });
                    setViewingPost(null);
                  }}
                >
                  <FaEdit /> Edit Moderation
                </button>
                <button type="button" className="admin-btn admin-btn-primary" onClick={() => setViewingPost(null)}>
                  Close
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
              <h3><FaEdit /> Moderate & Edit Post</h3>
              <button className="modal-close" onClick={() => setEditingPost(null)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSaveEditPost} className="admin-modal-form">
              <div className="form-group">
                <label>Post Title</label>
                <input
                  type="text"
                  disabled
                  value={editingPost.title}
                />
              </div>

              <div className="form-group">
                <label>Approval Status</label>
                <select
                  value={editingPost.isApproved ? 'approved' : 'unapproved'}
                  onChange={(e) => setEditingPost({ ...editingPost, isApproved: e.target.value === 'approved' })}
                >
                  <option value="approved">Approved (Visible on Community Feed)</option>
                  <option value="unapproved">Unapproved / Pending Review</option>
                </select>
              </div>

              <div className="form-group">
                <label>Flagged Status</label>
                <select
                  value={editingPost.isFlagged ? 'flagged' : 'clean'}
                  onChange={(e) => setEditingPost({ ...editingPost, isFlagged: e.target.value === 'flagged' })}
                >
                  <option value="clean">Clean (No Policy Violation)</option>
                  <option value="flagged">Flagged (Inappropriate / Reported Content)</option>
                </select>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-outline" onClick={() => setEditingPost(null)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  <FaCheck /> Apply Moderation
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
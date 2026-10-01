import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useNotification } from '../../hooks/useNotification';
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
  FaImage,
} from 'react-icons/fa';
import './ContentModeration.css';

const ContentModeration = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewMode, setViewMode] = useState('all'); // 'all', 'flagged', 'pending'
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

  const handleDelete = async (postId, postTitle) => {
    if (!window.confirm(`Permanently delete post "${postTitle}"?`)) return;
    try {
      await api.delete(`/admin/posts/${postId}`);
      addNotification('Post deleted successfully', 'success');
      loadPosts();
    } catch (error) {
      addNotification('Failed to delete post', 'error');
    }
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
      <div className="admin-page-header">
        <div>
          <h2>Content Moderation Hub</h2>
          <p>Review, approve, flag, or remove user-generated community posts and content.</p>
        </div>
        <div className="admin-header-actions">
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
                      <small>{post.userId?.name || 'Anonymous'}</small>
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
                          onClick={() => handleDelete(post._id, post.title)}
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
    </div>
  );
};

export default ContentModeration;
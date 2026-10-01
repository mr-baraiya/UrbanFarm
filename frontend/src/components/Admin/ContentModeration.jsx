import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useNotification } from '../../hooks/useNotification';
import './ContentModeration.css';

const ContentModeration = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('flagged'); // 'flagged', 'all', 'pending'
  const { addNotification } = useNotification();

  useEffect(() => {
    loadPosts();
  }, [filter]);

  const loadPosts = async () => {
    setLoading(true);
    try {
      let endpoint = '/community';
      if (filter === 'flagged') {
        endpoint = '/admin/flagged-posts';
      }
      const res = await api.get(endpoint);
      const allPosts = res.data.posts || [];
      
      // If filter is 'pending', show unmoderated posts
      if (filter === 'pending') {
        setPosts(allPosts.filter(p => !p.isApproved && !p.isFlagged));
      } else {
        setPosts(allPosts);
      }
    } catch (error) {
      console.error('Failed to load posts:', error);
      addNotification('Failed to load posts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (postId, action) => {
    try {
      await api.put(`/admin/posts/${postId}/moderate`, { 
        isApproved: action === 'approve',
        isFlagged: action === 'flag'
      });
      addNotification(`Post ${action === 'approve' ? 'approved' : 'flagged'}!`, 'success');
      loadPosts();
    } catch (error) {
      addNotification('Moderation failed', 'error');
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Delete this post permanently?')) return;
    try {
      await api.delete(`/community/${postId}`);
      addNotification('Post deleted', 'success');
      loadPosts();
    } catch (error) {
      addNotification('Failed to delete post', 'error');
    }
  };

  if (loading) {
    return <div className="moderation-loading">Loading posts...</div>;
  }

  return (
    <div className="content-moderation">
      <div className="moderation-header">
        <h3>⚠️ Content Moderation</h3>
        <div className="moderation-controls">
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${filter === 'flagged' ? 'active' : ''}`}
              onClick={() => setFilter('flagged')}
            >
              🚩 Flagged
            </button>
            <button 
              className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
              onClick={() => setFilter('pending')}
            >
              ⏳ Pending
            </button>
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              📋 All
            </button>
          </div>
          <span className="post-count">{posts.length} posts</span>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="no-posts">
          <span>✅</span>
          <p>No posts to moderate</p>
          <small>All content is clean!</small>
        </div>
      ) : (
        <div className="moderation-list">
          {posts.map((post) => (
            <div key={post._id} className={`mod-item ${post.isFlagged ? 'flagged' : ''}`}>
              <div className="mod-item-header">
                <h4>{post.title}</h4>
                <span className="mod-status">
                  {post.isFlagged ? '🚩 Flagged' : post.isApproved ? '✅ Approved' : '⏳ Pending'}
                </span>
              </div>
              <p className="mod-content">{post.content}</p>
              <div className="mod-meta">
                <span className="mod-author">👤 {post.userId?.name || 'Anonymous'}</span>
                <span className="mod-date">📅 {new Date(post.createdAt).toLocaleDateString()}</span>
                <span className="mod-category">{post.category}</span>
              </div>
              {post.imageUrl && (
                <div className="mod-image">
                  <img src={post.imageUrl} alt="Post" />
                </div>
              )}
              <div className="mod-actions">
                {!post.isApproved && !post.isFlagged && (
                  <button 
                    className="btn-primary mod-approve"
                    onClick={() => handleModerate(post._id, 'approve')}
                  >
                    ✅ Approve
                  </button>
                )}
                {post.isFlagged && (
                  <button 
                    className="btn-secondary mod-unflag"
                    onClick={() => handleModerate(post._id, 'approve')}
                  >
                    ↩️ Unflag
                  </button>
                )}
                {!post.isFlagged && (
                  <button 
                    className="btn-warning mod-flag"
                    onClick={() => handleModerate(post._id, 'flag')}
                  >
                    🚩 Flag
                  </button>
                )}
                <button 
                  className="btn-danger mod-delete"
                  onClick={() => handleDelete(post._id)}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContentModeration;
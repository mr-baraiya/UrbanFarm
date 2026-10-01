import React, { useState } from 'react';
import { formatDate, getInitials } from '../../utils/helpers';
import { useNotification } from '../../hooks/useNotification';
import './PostCard.css';

const PostCard = ({ post, user, onLike, onAddComment, userLevel }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isLiking, setIsLiking] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { addNotification } = useNotification();

  const getCategoryLabel = (category) => {
    const map = {
      'question': { label: '🆘 Plant Help', color: '#d6eaf8' },
      'tip': { label: '💡 Urban Tip', color: '#f0d5c0' },
      'showcase': { label: '🍅 Harvest Showcase', color: '#a8d5ba' },
      'event': { label: '📅 Community Event', color: '#b8a9c9' },
      'general': { label: '💬 General', color: '#f5ede4' },
    };
    return map[category] || map.general;
  };

  const category = getCategoryLabel(post.category);
  
  // ✅ FIX: Handle likes as array or number
  const likesArray = Array.isArray(post.likes) ? post.likes : [];
  const isLiked = likesArray.some(id => id === user?._id) || false;
  const likeCount = likesArray.length || post.likeCount || 0;
  const commentCount = Array.isArray(post.comments) ? post.comments.length : (post.commentCount || 0);

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    try {
      await onLike(post._id);
    } finally {
      setIsLiking(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    if (!user) {
      addNotification('Please login to comment', 'error');
      return;
    }
    try {
      await onAddComment(post._id, commentText);
      setCommentText('');
    } catch (error) {
      addNotification('Failed to add comment', 'error');
    }
  };

  const truncateContent = (content) => {
    if (!content) return '';
    if (content.length <= 300) return content;
    return isExpanded ? content : content.slice(0, 300) + '...';
  };

  // Get user name safely
  const userName = post.userId?.name || 'Anonymous';
  const userAvatar = post.userId?.profilePicture || null;

  return (
    <div className={`post-card ${post.category || 'general'}`}>
      {/* Header */}
      <div className="post-header">
        <div className="post-avatar">
          {userAvatar ? (
            <img src={userAvatar} alt={userName} />
          ) : (
            getInitials(userName)
          )}
        </div>
        <div className="post-user">
          <span className="user-name">
            {userName}
            {userLevel && post.userId?._id === user?._id && (
              <span className="user-badge"> • {userLevel.level}</span>
            )}
          </span>
          <div className="post-meta">
            <span className="post-date">{post.createdAt ? formatDate(post.createdAt) : 'Recently'}</span>
            <span className="post-category" style={{ background: category.color + '33', color: category.color }}>
              {category.label}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="post-content">
        {post.title && <h4 className="post-title">{post.title}</h4>}
        <p className="post-body">{truncateContent(post.content || '')}</p>
        {post.content && post.content.length > 300 && (
          <button 
            className="expand-btn"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>

      {/* Image */}
      {post.imageUrl && (
        <div className="post-image-wrapper">
          <img src={post.imageUrl} alt="Post" className="post-image" />
        </div>
      )}

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="post-tags">
          {post.tags.map((tag, idx) => (
            <span key={idx} className="tag">#{tag}</span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="post-actions">
        <button 
          className={`action-btn like-btn ${isLiked ? 'liked' : ''}`}
          onClick={handleLike}
          disabled={isLiking}
        >
          <span className="action-icon">{isLiked ? '❤️' : '🤍'}</span>
          <span className="action-count">{likeCount}</span>
          <span className="action-label">Likes</span>
        </button>
        <button 
          className="action-btn comment-btn"
          onClick={() => setShowComments(!showComments)}
        >
          <span className="action-icon">💬</span>
          <span className="action-count">{commentCount}</span>
          <span className="action-label">Comments</span>
        </button>
        <button 
          className="action-btn share-btn"
          onClick={() => {
            navigator.clipboard?.writeText(window.location.href);
            addNotification('Link copied to clipboard!', 'success');
          }}
        >
          <span className="action-icon">🔗</span>
          <span className="action-label">Share</span>
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="post-comments">
          {!Array.isArray(post.comments) || post.comments.length === 0 ? (
            <p className="no-comments">No comments yet. Be the first to respond!</p>
          ) : (
            <div className="comments-list">
              {post.comments.map((comment, idx) => (
                <div key={idx} className="comment">
                  <div className="comment-avatar">
                    {comment.userId?.profilePicture ? (
                      <img src={comment.userId.profilePicture} alt={comment.userId?.name || 'User'} />
                    ) : (
                      getInitials(comment.userId?.name || 'User')
                    )}
                  </div>
                  <div className="comment-content">
                    <div className="comment-header">
                      <span className="comment-user">{comment.userId?.name || 'Anonymous'}</span>
                      <span className="comment-date">{comment.createdAt ? formatDate(comment.createdAt) : 'Recently'}</span>
                    </div>
                    <p className="comment-text">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <form onSubmit={handleCommentSubmit} className="comment-form">
            <input
              type="text"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              disabled={!user}
            />
            <button type="submit" disabled={!commentText.trim() || !user}>
              Post
            </button>
          </form>
          {!user && (
            <p className="login-prompt">Please login to join the conversation</p>
          )}
        </div>
      )}
    </div>
  );
};

export default PostCard;
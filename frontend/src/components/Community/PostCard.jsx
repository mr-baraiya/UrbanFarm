import React, { useState } from 'react';
import { 
  RiHeartLine, 
  RiHeartFill, 
  RiChat3Line, 
  RiShareLine, 
  RiMoreFill, 
  RiEditLine, 
  RiDeleteBinLine,
  RiCheckLine
} from 'react-icons/ri';
import { formatDate, getInitials } from '../../utils/helpers';
import { useNotification } from '../../hooks/useNotification';
import './PostCard.css';

const PostCard = ({ 
  post, 
  user, 
  onLike, 
  onAddComment, 
  onEditPost, 
  onDeletePost, 
  onDeleteComment,
  userLevel 
}) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isLiking, setIsLiking] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
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
  
  // Handle likes as array or number
  const likesArray = Array.isArray(post.likes) ? post.likes : [];
  const isLiked = likesArray.some(id => id === user?._id) || false;
  const likeCount = likesArray.length || post.likeCount || 0;
  const commentCount = Array.isArray(post.comments) ? post.comments.length : (post.commentCount || 0);

  const isOwner = user && (
    (post.userId?._id && post.userId._id === user._id) || 
    post.userId === user._id || 
    user.role === 'admin'
  );

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
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const postUrl = `${window.location.origin}/app/community#${post._id}`;
    const shareText = `🌱 "${post.title || 'Community Post'}" by ${userName} on UrbanFarm:\n${(post.content || '').slice(0, 140)}...\n${postUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title || 'UrbanFarm Community Post',
          text: shareText,
          url: postUrl,
        });
        addNotification('Post shared successfully!', 'success');
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareText);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = shareText;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      addNotification('Post link & summary copied to clipboard!', 'success');
    } catch (err) {
      addNotification('Could not copy link', 'error');
    }
  };

  return (
    <div className={`post-card ${post.category || 'general'}`} id={post._id}>
      {/* Header */}
      <div className="post-header">
        <div className="post-header-left">
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

        {isOwner && (
          <div className="post-header-actions">
            <button className="menu-btn" onClick={() => setShowMenu(!showMenu)} aria-label="More options">
              <RiMoreFill />
            </button>
            {showMenu && (
              <div className="menu-dropdown">
                {onEditPost && (
                  <button onClick={() => { onEditPost(post); setShowMenu(false); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <RiEditLine /> Edit Post
                  </button>
                )}
                {onDeletePost && (
                  <button onClick={() => { onDeletePost(post._id); setShowMenu(false); }} className="danger" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <RiDeleteBinLine /> Delete Post
                  </button>
                )}
              </div>
            )}
          </div>
        )}
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
          <span className="action-icon" style={{ display: 'inline-flex', alignItems: 'center' }}>
            {isLiked ? <RiHeartFill style={{ color: '#ef4444' }} /> : <RiHeartLine />}
          </span>
          <span className="action-count">{likeCount}</span>
          <span className="action-label">Likes</span>
        </button>
        <button 
          className="action-btn comment-btn"
          onClick={() => setShowComments(!showComments)}
        >
          <span className="action-icon" style={{ display: 'inline-flex', alignItems: 'center' }}>
            <RiChat3Line />
          </span>
          <span className="action-count">{commentCount}</span>
          <span className="action-label">Comments</span>
        </button>
        <button 
          className="action-btn share-btn"
          onClick={handleShare}
          style={copied ? { color: '#2d6a4f' } : {}}
        >
          <span className="action-icon" style={{ display: 'inline-flex', alignItems: 'center' }}>
            {copied ? <RiCheckLine style={{ color: '#2d6a4f' }} /> : <RiShareLine />}
          </span>
          <span className="action-label">{copied ? 'Copied!' : 'Share'}</span>
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="post-comments">
          {!Array.isArray(post.comments) || post.comments.length === 0 ? (
            <p className="no-comments">No comments yet. Be the first to respond!</p>
          ) : (
            <div className="comments-list">
              {post.comments.map((comment, idx) => {
                const isCommentAuthor = user && (
                  (comment.userId?._id && comment.userId._id === user._id) || 
                  comment.userId === user._id || 
                  user.role === 'admin'
                );

                return (
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
                        {isCommentAuthor && onDeleteComment && (
                          <button 
                            className="btn-delete-comment"
                            onClick={() => onDeleteComment(post._id, comment._id)}
                            title="Delete comment"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                      <p className="comment-text">{comment.content}</p>
                    </div>
                  </div>
                );
              })}
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
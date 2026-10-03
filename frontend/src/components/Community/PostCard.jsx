import React, { useState, useRef } from 'react';
import { 
  RiHeartLine, 
  RiHeartFill, 
  RiChat3Line, 
  RiShareLine, 
  RiMoreFill, 
  RiEditLine, 
  RiDeleteBinLine,
  RiCheckLine,
  RiShoppingBasketLine,
  RiQuestionLine,
  RiLightbulbLine,
  RiCalendarEventLine,
  RiCloseLine,
  RiReplyLine,
  RiSendPlaneLine,
  RiQrCodeLine,
  RiWhatsappLine,
  RiFileCopyLine,
  RiShareForwardLine,
  RiRepeatLine,
  RiBarChart2Line,
  RiBookmarkLine,
  RiBookmarkFill
} from 'react-icons/ri';
import { useTranslation } from 'react-i18next';
import { formatDate, getInitials } from '../../utils/helpers';
import { getLocalizedDynamicText } from '../../utils/localizationHelper';
import { useNotification } from '../../hooks/useNotification';
import { validateRequired } from '../../utils/validators';
import './PostCard.css';

const getXRelativeTime = (dateString) => {
  if (!dateString) return 'now';
  const now = new Date();
  const past = new Date(dateString);
  const diffInSeconds = Math.floor((now - past) / 1000);
  
  if (isNaN(diffInSeconds) || diffInSeconds < 5) return 'now';
  if (diffInSeconds < 60) return `${diffInSeconds}s`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d`;
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths}mo`;
  return `${Math.floor(diffInDays / 365)}y`;
};

const getRelativeTime = getXRelativeTime;

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
  const { t } = useTranslation();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isLiking, setIsLiking] = useState(false);
  const [likedAnimation, setLikedAnimation] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [shared, setShared] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);
  
  // X Post states
  const [isReposted, setIsReposted] = useState(false);
  const [repostCount, setRepostCount] = useState(post.repostCount || 0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  const commentInputRef = useRef(null);
  const { addNotification } = useNotification();

  const getCategoryLabel = (categoryKey) => {
    const map = {
      'question': { label: t('community.categories.question', 'Plant Help'), icon: <RiQuestionLine />, colorClass: 'question' },
      'tip': { label: t('community.categories.tip', 'Urban Tip'), icon: <RiLightbulbLine />, colorClass: 'tip' },
      'showcase': { label: t('community.categories.showcase', 'Harvest'), icon: <RiShoppingBasketLine />, colorClass: 'showcase' },
      'event': { label: t('community.categories.event', 'Event'), icon: <RiCalendarEventLine />, colorClass: 'event' },
      'general': { label: t('community.categories.general', 'General'), icon: <RiChat3Line />, colorClass: 'general' },
    };
    return map[categoryKey] || map.general;
  };

  const category = getCategoryLabel(post.category);
  
  // Likes logic
  const currentUserId = (user?._id || user?.id)?.toString();
  const likesArray = Array.isArray(post.likes) ? post.likes : [];
  const isLiked = (currentUserId && likesArray.some(id => {
    if (!id) return false;
    const idStr = typeof id === 'object' ? (id._id || id.id || id.userId)?.toString() : id.toString();
    return idStr === currentUserId;
  })) || Boolean(post.isLiked);
  
  const likeCount = typeof post.likeCount === 'number' ? post.likeCount : likesArray.length;
  const commentsList = Array.isArray(post.comments) ? post.comments : [];
  const commentCount = commentsList.length || (post.commentCount || 0);

  // Views calculation
  const viewsCount = (likeCount * 14 + commentCount * 22 + (post._id ? parseInt(post._id.slice(-3), 16) % 120 : 18) + 24);

  // Owner & Author calculation
  const postAuthorId = (post.userId?._id || post.userId?.id || post.userId)?.toString();
  const isOwner = Boolean(
    user && currentUserId && postAuthorId && (
      currentUserId === postAuthorId || 
      user.role === 'admin'
    )
  );

  const handleLike = async () => {
    if (!user) {
      addNotification(t('community.notifications.loginToLike', 'Please login to like posts'), 'info');
      return;
    }
    if (isLiking) return;
    setIsLiking(true);
    if (!isLiked) {
      setLikedAnimation(true);
      setTimeout(() => setLikedAnimation(false), 500);
    }
    try {
      await onLike(post._id);
    } finally {
      setIsLiking(false);
    }
  };

  const handleRepost = () => {
    if (!user) {
      addNotification(t('community.notifications.loginToRepost', 'Please login to repost'), 'info');
      return;
    }
    if (isReposted) {
      setIsReposted(false);
      setRepostCount((prev) => Math.max(0, prev - 1));
      addNotification(t('community.notifications.repostRemoved', 'Repost removed'), 'info');
    } else {
      setIsReposted(true);
      setRepostCount((prev) => prev + 1);
      addNotification(t('community.notifications.reposted', 'Reposted to your feed!'), 'success');
    }
  };

  const handleBookmark = () => {
    if (!user) {
      addNotification(t('community.notifications.loginToBookmark', 'Please login to bookmark posts'), 'info');
      return;
    }
    setIsBookmarked(!isBookmarked);
    addNotification(isBookmarked ? t('community.notifications.bookmarkRemoved', 'Removed from bookmarks') : t('community.notifications.bookmarked', 'Saved to bookmarks!'), 'success');
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!validateRequired(commentText)) return;
    if (!user) {
      addNotification(t('community.notifications.loginToComment', 'Please login to comment'), 'error');
      return;
    }
    try {
      await onAddComment(post._id, commentText.trim());
      setCommentText('');
    } catch (error) {
      addNotification(t('community.notifications.commentFailed', 'Failed to add comment'), 'error');
    }
  };

  const handleReplyComment = (authorName) => {
    setShowComments(true);
    const mention = `@${authorName} `;
    setCommentText((prev) => (prev.includes(mention) ? prev : mention + prev));
    setTimeout(() => {
      if (commentInputRef.current) {
        commentInputRef.current.focus();
      }
    }, 100);
  };

  // Share Actions
  const postUrl = `${window.location.origin}/app/community#${post._id}`;

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(postUrl);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = postUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setShared(true);
      addNotification(t('community.notifications.copiedLink', 'Post link copied to clipboard!'), 'success');
      setShowShareModal(false);
      setTimeout(() => setShared(false), 2500);
    } catch (err) {
      addNotification(t('community.notifications.copyLinkFailed', 'Could not copy link'), 'error');
    }
  };

  const handleShareNative = async () => {
    const shareText = `"${post.title || 'UrbanFarm Post'}" by ${post.userId?.name || 'Gardener'}:\n${postUrl}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title || 'UrbanFarm Post',
          text: shareText,
          url: postUrl,
        });
        addNotification(t('community.notifications.sharedSuccess', 'Post shared successfully!'), 'success');
        setShowShareModal(false);
      } catch (err) {
        // cancelled by user
      }
    } else {
      handleCopyLink();
    }
  };

  const handleShareWhatsApp = () => {
    const shareText = `"${post.title || 'UrbanFarm Post'}" by ${post.userId?.name || 'Gardener'}:\n${postUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
    addNotification(t('community.notifications.openingWhatsApp', 'Opening WhatsApp to share...'), 'info');
    setShowShareModal(false);
  };

  const truncateContent = (content) => {
    if (!content) return '';
    if (content.length <= 300) return content;
    return isExpanded ? content : content.slice(0, 300) + '...';
  };

  const userName = post.userId?.name || 'Anonymous Gardener';
  const rawHandle = post.userId?.username || userName.toLowerCase().replace(/\s+/g, '');
  const usernameHandle = `@${rawHandle}`;
  const userAvatar = post.userId?.profilePicture || null;
  const xTime = getXRelativeTime(post.createdAt);
  const previewComments = commentsList.slice(-2);
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(postUrl)}`;

  return (
    <div className={`post-card x-post-card category-${category.colorClass}`} id={post._id}>
      {/* X Style Header */}
      <div className="x-post-header">
        <div className="x-avatar-container">
          <div className="post-avatar x-avatar">
            {userAvatar ? (
              <img src={userAvatar} alt={userName} />
            ) : (
              getInitials(userName)
            )}
          </div>
        </div>

        <div className="x-header-info">
          <div className="x-author-row">
            <div className="x-author-left">
              <span className="user-name x-user-name">{getLocalizedDynamicText(userName)}</span>
              {userLevel && post.userId?._id === user?._id && (
                <span className="user-level-badge" title={`Level ${getLocalizedDynamicText(userLevel.level)}`}>
                  {userLevel.icon}
                </span>
              )}
              <span className="x-user-handle">{usernameHandle}</span>
              <span className="x-dot-separator">·</span>
              <span className="x-post-time" title={formatDate(post.createdAt)}>{xTime}</span>
            </div>

            <div className="x-header-right">
              <span className={`post-category-pill cat-${category.colorClass}`}>
                {category.icon} {category.label}
              </span>

              {isOwner ? (
                <div className="post-owner-actions">
                  {onEditPost && (
                    <button 
                      className="owner-action-btn edit-btn" 
                      onClick={() => onEditPost(post)} 
                      title={t('community.card.editPost', 'Edit post')}
                      aria-label={t('community.card.editPost', 'Edit post')}
                    >
                      <RiEditLine />
                    </button>
                  )}
                  {onDeletePost && (
                    <button 
                      className="owner-action-btn delete-btn" 
                      onClick={() => onDeletePost(post._id)} 
                      title={t('community.card.deletePost', 'Delete post')}
                      aria-label={t('community.card.deletePost', 'Delete post')}
                    >
                      <RiDeleteBinLine />
                    </button>
                  )}
                </div>
              ) : (
                <button className="post-more-btn" aria-label={t('community.card.moreOptions', 'More options')}>
                  <RiMoreFill />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Body & Media */}
      <div className="post-body-container x-post-body-wrap">
        {post.title && <h4 className="post-title x-post-title">{getLocalizedDynamicText(post.title)}</h4>}
        <p className="post-body x-post-body">{truncateContent(getLocalizedDynamicText(post.content || ''))}</p>
        {post.content && post.content.length > 300 && (
          <button 
            className="expand-btn"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? t('community.card.showLess', 'Show less') : t('community.card.readMore', 'Read more')}
          </button>
        )}
      </div>

      {post.imageUrl && (
        <div className="post-image-container x-media-container">
          <img src={post.imageUrl} alt="Post content" className="post-center-image x-post-media" />
        </div>
      )}

      {post.tags && post.tags.length > 0 && (
        <div className="post-tags x-post-tags">
          {post.tags.map((tag, idx) => (
            <span key={idx} className="tag x-hashtag">#{tag}</span>
          ))}
        </div>
      )}

      {/* X Style 5-Column Action Bar */}
      <div className="x-post-actions">
        {/* Reply */}
        <button 
          className={`x-action-item action-reply ${showComments ? 'active' : ''}`}
          onClick={() => setShowComments(!showComments)}
          title={t('community.card.reply', 'Reply')}
        >
          <div className="x-icon-circle">
            <RiChat3Line />
          </div>
          <span className="x-count">{commentCount > 0 ? commentCount : ''}</span>
        </button>

        {/* Repost */}
        <button 
          className={`x-action-item action-repost ${isReposted ? 'active' : ''}`}
          onClick={handleRepost}
          title={t('community.card.repost', 'Repost')}
        >
          <div className="x-icon-circle">
            <RiRepeatLine />
          </div>
          <span className="x-count">{repostCount > 0 ? repostCount : ''}</span>
        </button>

        {/* Like */}
        <button 
          className={`x-action-item action-like ${isLiked ? 'active' : ''} ${likedAnimation ? 'anim-pop' : ''}`}
          onClick={handleLike}
          disabled={isLiking}
          title={t('community.card.like', 'Like')}
        >
          <div className="x-icon-circle">
            {isLiked ? <RiHeartFill className="heart-filled" /> : <RiHeartLine />}
          </div>
          <span className="x-count">{likeCount > 0 ? likeCount : ''}</span>
        </button>

        {/* Views */}
        <div className="x-action-item action-views" title={t('community.card.views', 'Views')}>
          <div className="x-icon-circle">
            <RiBarChart2Line />
          </div>
          <span className="x-count">{viewsCount}</span>
        </div>

        {/* Bookmark & Share */}
        <div className="x-action-right-group">
          <button 
            className={`x-action-item action-bookmark ${isBookmarked ? 'active' : ''}`}
            onClick={handleBookmark}
            title={t('community.card.bookmark', 'Bookmark')}
          >
            <div className="x-icon-circle">
              {isBookmarked ? <RiBookmarkFill /> : <RiBookmarkLine />}
            </div>
          </button>
          
          <button 
            className="x-action-item action-share"
            onClick={() => setShowShareModal(true)}
            title={t('community.card.share', 'Share')}
          >
            <div className="x-icon-circle">
              <RiShareLine />
            </div>
          </button>
        </div>
      </div>

      {/* Inline Comments Preview */}
      {!showComments && commentsList.length > 0 && (
        <div className="comments-preview-section">
          {previewComments.map((comment, idx) => (
            <div key={idx} className="preview-comment-row">
              <span className="preview-user">{getLocalizedDynamicText(comment.userId?.name || 'Gardener')}:</span>
              <span className="preview-text">{getLocalizedDynamicText((comment.content || '').slice(0, 90))}</span>
              <button 
                className="btn-inline-reply"
                onClick={() => handleReplyComment(comment.userId?.name || 'Gardener')}
                title={t('community.card.reply', 'Reply')}
              >
                <RiReplyLine /> {t('community.card.reply', 'Reply')}
              </button>
            </div>
          ))}
          {commentsList.length > 2 && (
            <button 
              className="view-all-comments-btn" 
              onClick={() => setShowComments(true)}
            >
              {t('community.card.viewAllComments', 'View all {{count}} comments', { count: commentsList.length })}
            </button>
          )}
        </div>
      )}

      {/* Full Comments Thread */}
      {showComments && (
        <div className="post-comments-expanded">
          {commentsList.length === 0 ? (
            <p className="no-comments">{t('community.card.noComments', 'No comments yet. Be the first to reply!')}</p>
          ) : (
            <div className="comments-list">
              {commentsList.map((comment, idx) => {
                const authorName = comment.userId?.name || 'Anonymous';
                const isCommentAuthor = user && (
                  (comment.userId?._id && comment.userId._id === user._id) || 
                  comment.userId === user._id || 
                  user.role === 'admin'
                );

                return (
                  <div key={idx} className="comment-item">
                    <div className="comment-avatar">
                      {comment.userId?.profilePicture ? (
                        <img src={comment.userId.profilePicture} alt={authorName} />
                      ) : (
                        getInitials(authorName)
                      )}
                    </div>
                    <div className="comment-body">
                      <div className="comment-meta">
                        <span className="comment-author">{getLocalizedDynamicText(authorName)}</span>
                        <span className="comment-time">{getRelativeTime(comment.createdAt)}</span>
                        <div className="comment-actions-right">
                          <button 
                            className="btn-reply-comment"
                            onClick={() => handleReplyComment(authorName)}
                            title={t('community.card.reply', 'Reply')}
                          >
                            <RiReplyLine /> {t('community.card.reply', 'Reply')}
                          </button>
                          {isCommentAuthor && onDeleteComment && (
                            <button 
                              className="btn-delete-comment"
                              onClick={() => onDeleteComment(post._id, comment._id)}
                              title={t('community.card.deletePost', 'Delete comment')}
                              aria-label={t('community.card.deletePost', 'Delete comment')}
                            >
                              <RiCloseLine />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="comment-text">{getLocalizedDynamicText(comment.content)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          <form onSubmit={handleCommentSubmit} className="comment-form">
            <input
              ref={commentInputRef}
              type="text"
              placeholder={t('community.card.commentPlaceholder', 'Write a comment or reply...')}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              disabled={!user}
            />
            <button type="submit" disabled={!commentText.trim() || !user}>
              {t('community.card.postCommentBtn', 'Post')}
            </button>
          </form>
          {!user && (
            <p className="login-prompt">{t('community.card.loginPrompt', 'Please log in to join the conversation')}</p>
          )}
        </div>
      )}

      {/* Share Modal Dialog with Copy Link, WhatsApp, Apps, and QR Code options */}
      {showShareModal && (
        <div className="share-modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="share-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="share-modal-header">
              <h3>{t('community.card.shareModalTitle', 'Share Post')}</h3>
              <button className="close-btn" onClick={() => setShowShareModal(false)} aria-label="Close">
                <RiCloseLine />
              </button>
            </div>

            <div className="share-modal-body">
              <p className="share-post-preview-title">
                {t('community.card.postBy', '"{{title}}" by {{author}}:', {
                  title: getLocalizedDynamicText(post.title || 'UrbanFarm Community Post'),
                  author: getLocalizedDynamicText(userName)
                })}
              </p>

              {!showQrCode ? (
                <div className="share-options-grid">
                  <button className="share-option-btn" onClick={handleCopyLink}>
                    <div className="share-option-icon icon-copy">
                      <RiFileCopyLine />
                    </div>
                    <span>{t('community.card.copyLink', 'Copy Link')}</span>
                  </button>

                  <button className="share-option-btn" onClick={handleShareWhatsApp}>
                    <div className="share-option-icon icon-whatsapp">
                      <RiWhatsappLine />
                    </div>
                    <span>{t('community.card.whatsApp', 'WhatsApp')}</span>
                  </button>

                  <button className="share-option-btn" onClick={handleShareNative}>
                    <div className="share-option-icon icon-apps">
                      <RiShareForwardLine />
                    </div>
                    <span>{t('community.card.otherApps', 'Other Apps')}</span>
                  </button>

                  <button className="share-option-btn" onClick={() => setShowQrCode(true)}>
                    <div className="share-option-icon icon-qr">
                      <RiQrCodeLine />
                    </div>
                    <span>{t('community.card.qrCode', 'QR Code')}</span>
                  </button>
                </div>
              ) : (
                <div className="qr-code-container">
                  <p className="qr-sub">{t('community.card.scanQrCode', 'Scan QR Code to open this post')}</p>
                  <img src={qrCodeUrl} alt="Post QR Code" className="qr-code-img" />
                  <button className="btn-secondary" onClick={() => setShowQrCode(false)} style={{ marginTop: '0.85rem' }}>
                    {t('community.card.backToOptions', 'Back to options')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;
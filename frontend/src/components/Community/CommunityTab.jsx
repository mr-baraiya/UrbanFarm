import React, { useState, useEffect } from 'react';
import { 
  RiTeamLine, 
  RiTrophyLine, 
  RiAddLine, 
  RiArrowLeftSLine, 
  RiArrowRightSLine, 
  RiMedalLine, 
  RiLeafLine, 
  RiSeedlingLine 
} from 'react-icons/ri';
import { TbPlant2 } from 'react-icons/tb';
import { getCommunityPosts, createPost, updatePost, deletePost, deleteComment, toggleLike, getLeaderboard, addComment } from '../../services/plantService';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import ConfirmModal from '../Common/ConfirmModal';
import PostCard from './PostCard';
import PostForm, { PostComposer } from './PostForm';
import CommunityFilters from './CommunityFilters';
import Leaderboard, { LeaderboardRightRail } from './Leaderboard';
import './CommunityTab.css';

const CommunityTab = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [composerFocus, setComposerFocus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [filterRegion, setFilterRegion] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;
  const { addNotification } = useNotification();

  // Custom Confirm Modal state
  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [posts, filterType, filterRegion, searchTerm]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [postsData, leaderboardData] = await Promise.all([
        getCommunityPosts(),
        getLeaderboard(),
      ]);
      setPosts(postsData || []);
      setFilteredPosts(postsData || []);
      setLeaderboard(leaderboardData || []);
    } catch (error) {
      console.error('Failed to load community data:', error);
      addNotification('Failed to load posts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...posts];
    
    // Type filter
    if (filterType === 'my_posts') {
      const currentUserId = (user?._id || user?.id)?.toString();
      filtered = filtered.filter(p => {
        const pUserId = (p.userId?._id || p.userId)?.toString();
        return pUserId === currentUserId;
      });
    } else if (filterType !== 'all') {
      filtered = filtered.filter(p => p.category === filterType);
    }
    
    // Region filter
    if (filterRegion !== 'all') {
      filtered = filtered.filter(p => p.userId?.location?.city === filterRegion);
    }
    
    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        (p.title && p.title.toLowerCase().includes(term)) ||
        (p.content && p.content.toLowerCase().includes(term)) ||
        (p.userId?.name && p.userId.name.toLowerCase().includes(term))
      );
    }
    
    setFilteredPosts(filtered);
    setCurrentPage(1);
  };

  const handleLike = async (postId) => {
    try {
      const res = await toggleLike(postId);
      const currentUserId = user?._id || user?.id;
      setPosts(prevPosts => prevPosts.map(p => {
        if (p._id !== postId) return p;
        const currentLikes = Array.isArray(p.likes) ? p.likes : [];
        let newLikes;
        if (Array.isArray(res.likes)) {
          newLikes = res.likes;
        } else if (res.liked !== undefined) {
          if (res.liked) {
            newLikes = currentLikes.some(id => (id?.toString() === currentUserId?.toString()))
              ? currentLikes 
              : [...currentLikes, currentUserId];
          } else {
            newLikes = currentLikes.filter(id => id?.toString() !== currentUserId?.toString());
          }
        } else {
          newLikes = currentLikes;
        }
        return {
          ...p,
          likes: newLikes,
          likeCount: typeof res.likeCount === 'number' ? res.likeCount : newLikes.length
        };
      }));
    } catch (error) {
      addNotification('Failed to update like', 'error');
    }
  };

  const handleAddComment = async (postId, commentText) => {
    try {
      const updated = await addComment(postId, commentText);
      setPosts(posts.map(p => 
        p._id === postId ? updated : p
      ));
      addNotification('Comment added!', 'success');
    } catch (error) {
      addNotification('Failed to add comment', 'error');
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    try {
      const updated = await deleteComment(postId, commentId);
      setPosts(posts.map(p => p._id === postId ? updated : p));
      addNotification('Comment deleted', 'success');
    } catch (error) {
      addNotification('Failed to delete comment', 'error');
    }
  };

  const promptDeletePost = (postId) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Delete Community Post',
      message: 'Are you sure you want to permanently delete this post?',
      onConfirm: async () => {
        try {
          await deletePost(postId);
          setPosts(posts.filter(p => p._id !== postId));
          addNotification('Post deleted successfully', 'success');
        } catch (error) {
          addNotification('Failed to delete post', 'error');
        }
      }
    });
  };

  const getUserLevel = (userData) => {
    if (!userData) return { level: 'Seedling', icon: <RiSeedlingLine style={{ color: '#65a30d' }} />, points: 0 };
    
    const currentUserId = (userData._id || userData.id)?.toString();
    if (!currentUserId) return { level: 'Seedling', icon: <RiSeedlingLine style={{ color: '#65a30d' }} />, points: 0 };

    const postCount = posts.filter(p => {
      const pUserId = (p.userId?._id || p.userId)?.toString();
      return pUserId === currentUserId;
    }).length;

    const likeCount = posts.reduce((acc, p) => {
      const pUserId = (p.userId?._id || p.userId)?.toString();
      if (pUserId === currentUserId) {
        const likes = Array.isArray(p.likes) ? p.likes : [];
        return acc + likes.length;
      }
      return acc;
    }, 0);

    const commentCount = posts.reduce((acc, p) => {
      const comments = Array.isArray(p.comments) ? p.comments : [];
      const userComments = comments.filter(c => {
        const cUserId = (c.userId?._id || c.userId)?.toString();
        return cUserId === currentUserId;
      });
      return acc + userComments.length;
    }, 0);
    
    // Points rule: 10 pts per post, 2 pts per like received, 5 pts per comment made
    const totalPoints = (postCount * 10) + (likeCount * 2) + (commentCount * 5);
    
    if (totalPoints >= 100) return { level: 'Master Gardener', icon: <RiMedalLine style={{ color: '#eab308' }} />, points: totalPoints };
    if (totalPoints >= 50) return { level: 'Green Thumb', icon: <RiLeafLine style={{ color: '#16a34a' }} />, points: totalPoints };
    if (totalPoints >= 20) return { level: 'Urban Farmer', icon: <TbPlant2 style={{ color: '#2c5e3b' }} />, points: totalPoints };
    return { level: 'Seedling', icon: <RiSeedlingLine style={{ color: '#65a30d' }} />, points: totalPoints };
  };

  const userLevel = user ? getUserLevel(user) : null;

  const handleOpenComposer = (focusField = null) => {
    setEditingPost(null);
    setComposerFocus(focusField);
    setShowForm(true);
  };

  // Pagination calculation
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  if (loading) {
    return (
      <div className="community-loading">
        <div className="loading-spinner"></div>
        <p>Loading community posts & leaderboard...</p>
      </div>
    );
  }

  return (
    <div className="community-tab">
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
      />

      {/* Header */}
      <div className="community-header">
        <div className="header-left">
          <h2>
            <RiTeamLine className="header-icon" /> UrbanFarm Social
          </h2>
          {userLevel && (
            <span className="user-level">
              {userLevel.icon} {userLevel.level} • {userLevel.points} pts
            </span>
          )}
        </div>
        <div className="header-actions">
          <button 
            className="btn-secondary leaderboard-btn"
            onClick={() => setShowLeaderboard(!showLeaderboard)}
          >
            <RiTrophyLine style={{ color: '#d97706' }} /> Leaderboard
          </button>
          <button 
            className="btn-primary create-post-btn" 
            onClick={() => handleOpenComposer()}
          >
            <RiAddLine /> Share Post
          </button>
        </div>
      </div>

      {/* Main Community Feed Container */}
      <div className="community-feed-container">
        {/* Side-by-Side Top Urban Farmers & Community Activity Row */}
        <LeaderboardRightRail 
          leaderboard={leaderboard} 
          posts={posts}
          onOpenLeaderboard={() => setShowLeaderboard(true)}
        />

        {/* Post Composer Banner */}
        <PostComposer 
          user={user} 
          onOpenComposer={handleOpenComposer} 
        />

        {/* Filters */}
        <CommunityFilters
          filterType={filterType}
          onFilterTypeChange={setFilterType}
          filterRegion={filterRegion}
          onFilterRegionChange={setFilterRegion}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          posts={posts}
          user={user}
        />

        {/* Posts Feed */}
        <div className="posts-feed">
          {filteredPosts.length === 0 ? (
            <div className="empty-feed">
              <span className="empty-icon">
                <TbPlant2 style={{ color: 'var(--primary, #6b9080)' }} />
              </span>
              <h3>No posts yet</h3>
              <p>Be the first to share your urban farming journey!</p>
              <button 
                className="btn-primary" 
                onClick={() => handleOpenComposer()}
              >
                <RiAddLine /> Share Your First Post
              </button>
            </div>
          ) : (
            <>
              {currentPosts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  user={user}
                  onLike={handleLike}
                  onAddComment={handleAddComment}
                  onEditPost={(p) => setEditingPost(p)}
                  onDeletePost={promptDeletePost}
                  onDeleteComment={handleDeleteComment}
                  userLevel={userLevel}
                />
              ))}

              {/* Restyled Pagination Bar */}
              {totalPages > 1 && (
                <div className="pagination-bar">
                  <button 
                    className="pagination-btn" 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  >
                    <RiArrowLeftSLine /> Prev
                  </button>
                  <span className="pagination-indicator">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button 
                    className="pagination-btn" 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  >
                    Next <RiArrowRightSLine />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <Leaderboard 
          leaderboard={leaderboard}
          onClose={() => setShowLeaderboard(false)}
        />
      )}

      {/* Post Form Modal (Create or Edit) */}
      {(showForm || editingPost) && (
        <PostForm 
          post={editingPost}
          initialFocus={composerFocus}
          onClose={() => {
            setShowForm(false);
            setEditingPost(null);
            setComposerFocus(null);
            loadData();
          }} 
          onPostSaved={() => {
            loadData();
          }}
          user={user}
        />
      )}
    </div>
  );
};

export default CommunityTab;
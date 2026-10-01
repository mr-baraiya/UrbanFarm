import React, { useState, useEffect } from 'react';
import { getCommunityPosts, createPost, toggleLike, getLeaderboard, addComment } from '../../services/plantService';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import PostCard from './PostCard';
import PostForm from './PostForm';
import CommunityFilters from './CommunityFilters';
import Leaderboard from './Leaderboard';
import './CommunityTab.css';

const CommunityTab = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [filterRegion, setFilterRegion] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const { addNotification } = useNotification();

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
    if (filterType !== 'all') {
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
  };

  const handleLike = async (postId) => {
    try {
      const updated = await toggleLike(postId);
      setPosts(posts.map(p => 
        p._id === postId 
          ? { 
              ...p, 
              likes: updated.likes || [],
              likeCount: updated.likes?.length || 0
            } 
          : p
      ));
    } catch (error) {
      addNotification('Failed to like', 'error');
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

  const getUserLevel = (userData) => {
    if (!userData) return { level: '🌰 Seedling', points: 0 };
    
    const postCount = posts.filter(p => p.userId?._id === userData._id).length;
    const likeCount = posts.reduce((acc, p) => {
      if (p.userId?._id === userData._id) {
        const likes = Array.isArray(p.likes) ? p.likes : [];
        return acc + likes.length;
      }
      return acc;
    }, 0);
    
    const totalPoints = postCount * 10 + likeCount * 2;
    
    if (totalPoints > 100) return { level: '🌟 Master Gardener', points: totalPoints };
    if (totalPoints > 50) return { level: '🌿 Green Thumb', points: totalPoints };
    if (totalPoints > 20) return { level: '🌱 Urban Farmer', points: totalPoints };
    return { level: '🌰 Seedling', points: totalPoints };
  };

  const userLevel = user ? getUserLevel(user) : null;

  if (loading) {
    return <div className="community-loading">Loading community posts...</div>;
  }

  return (
    <div className="community-tab">
      {/* Header */}
      <div className="community-header">
        <div className="header-left">
          <h2>👥 Community</h2>
          {userLevel && (
            <span className="user-level">
              {userLevel.level} • {userLevel.points} pts
            </span>
          )}
        </div>
        <div className="header-actions">
          <button 
            className="btn-secondary leaderboard-btn"
            onClick={() => setShowLeaderboard(!showLeaderboard)}
          >
            🏆 Leaderboard
          </button>
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            + Share
          </button>
        </div>
      </div>

      {/* Leaderboard */}
      {showLeaderboard && (
        <Leaderboard 
          leaderboard={leaderboard}
          onClose={() => setShowLeaderboard(false)}
        />
      )}

      {/* Filters */}
      <CommunityFilters
        filterType={filterType}
        onFilterTypeChange={setFilterType}
        filterRegion={filterRegion}
        onFilterRegionChange={setFilterRegion}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        posts={posts}
      />

      {/* Posts Feed */}
      <div className="posts-feed">
        {filteredPosts.length === 0 ? (
          <div className="empty-feed">
            <span className="empty-icon">🌱</span>
            <h3>No posts yet</h3>
            <p>Be the first to share your urban farming journey!</p>
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              Share Your First Post
            </button>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              user={user}
              onLike={handleLike}
              onAddComment={handleAddComment}
              userLevel={userLevel}
            />
          ))
        )}
      </div>

      {/* Post Form Modal */}
      {showForm && (
        <PostForm 
          onClose={() => {
            setShowForm(false);
            loadData();
          }} 
          user={user}
        />
      )}
    </div>
  );
};

export default CommunityTab;
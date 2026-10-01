import React from 'react';
import './Leaderboard.css';

const Leaderboard = ({ leaderboard, onClose }) => {
  const getRankEmoji = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  const getLevelBadge = (points) => {
    if (points > 100) return '🌟 Master Gardener';
    if (points > 50) return '🌿 Green Thumb';
    if (points > 20) return '🌱 Urban Farmer';
    return '🌰 Seedling';
  };

  if (leaderboard.length === 0) {
    return (
      <div className="leaderboard-modal" onClick={onClose}>
        <div className="leaderboard-content" onClick={(e) => e.stopPropagation()}>
          <div className="leaderboard-header">
            <h3>🏆 Leaderboard</h3>
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>
          <div className="empty-leaderboard">
            <span>🌱</span>
            <p>No leaderboard data yet.</p>
            <p className="sub-text">Be the first to earn points!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="leaderboard-modal" onClick={onClose}>
      <div className="leaderboard-content" onClick={(e) => e.stopPropagation()}>
        <div className="leaderboard-header">
          <h3>🏆 Leaderboard</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="leaderboard-list">
          {leaderboard.map((user, index) => (
            <div key={user._id} className={`leaderboard-item ${index < 3 ? 'top' : ''}`}>
              <span className="rank">{getRankEmoji(index)}</span>
              <div className="user-info">
                <span className="user-name">{user.name}</span>
                <span className="user-level">{getLevelBadge(user.points)}</span>
              </div>
              <div className="user-stats">
                <span className="user-points">{user.points} pts</span>
                <span className="user-posts">{user.postCount} posts</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
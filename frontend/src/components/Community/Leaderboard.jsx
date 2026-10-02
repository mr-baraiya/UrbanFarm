import React from 'react';
import { 
  RiTrophyLine, 
  RiMedalLine, 
  RiLeafLine, 
  RiSeedlingLine, 
  RiCloseLine 
} from 'react-icons/ri';
import { TbPlant2 } from 'react-icons/tb';
import './Leaderboard.css';

const Leaderboard = ({ leaderboard, onClose }) => {
  const getRankBadge = (index) => {
    if (index === 0) return <RiMedalLine style={{ color: '#eab308', fontSize: '1.35rem' }} title="1st Place" />;
    if (index === 1) return <RiMedalLine style={{ color: '#94a3b8', fontSize: '1.35rem' }} title="2nd Place" />;
    if (index === 2) return <RiMedalLine style={{ color: '#cd7f32', fontSize: '1.35rem' }} title="3rd Place" />;
    return <span className="rank-num">#{index + 1}</span>;
  };

  const getLevelBadge = (points) => {
    if (points > 100) {
      return (
        <span className="level-badge-inner">
          <RiMedalLine style={{ color: '#eab308' }} /> Master Gardener
        </span>
      );
    }
    if (points > 50) {
      return (
        <span className="level-badge-inner">
          <RiLeafLine style={{ color: '#16a34a' }} /> Green Thumb
        </span>
      );
    }
    if (points > 20) {
      return (
        <span className="level-badge-inner">
          <TbPlant2 style={{ color: '#2c5e3b' }} /> Urban Farmer
        </span>
      );
    }
    return (
      <span className="level-badge-inner">
        <RiSeedlingLine style={{ color: '#65a30d' }} /> Seedling
      </span>
    );
  };

  if (leaderboard.length === 0) {
    return (
      <div className="leaderboard-modal" onClick={onClose}>
        <div className="leaderboard-content" onClick={(e) => e.stopPropagation()}>
          <div className="leaderboard-header">
            <h3 style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <RiTrophyLine style={{ color: '#eab308', fontSize: '1.3rem' }} /> Leaderboard
            </h3>
            <button className="close-btn" onClick={onClose} aria-label="Close">
              <RiCloseLine />
            </button>
          </div>
          <div className="empty-leaderboard">
            <RiSeedlingLine style={{ fontSize: '3rem', color: '#65a30d', display: 'block', margin: '0 auto 0.5rem' }} />
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
          <h3 style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <RiTrophyLine style={{ color: '#eab308', fontSize: '1.3rem' }} /> Leaderboard
          </h3>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            <RiCloseLine />
          </button>
        </div>
        <div className="leaderboard-list">
          {leaderboard.map((user, index) => (
            <div key={user._id} className="leaderboard-row">
              <div className="leaderboard-rank">{getRankBadge(index)}</div>
              <div className="leaderboard-user-details">
                <span className="leaderboard-user-name">{user.name}</span>
                <span className="leaderboard-user-badge">{getLevelBadge(user.points)}</span>
              </div>
              <div className="leaderboard-stats">
                <span className="leaderboard-points">{user.points} pts</span>
                <span className="leaderboard-posts">{user.postCount} posts</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
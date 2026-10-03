import React from 'react';
import { 
  RiTrophyLine, 
  RiMedalLine, 
  RiLeafLine, 
  RiSeedlingLine, 
  RiCloseLine,
  RiGroupLine,
  RiShoppingBasketLine,
  RiArticleLine
} from 'react-icons/ri';
import { TbPlant2 } from 'react-icons/tb';
import { useTranslation } from 'react-i18next';
import { getInitials } from '../../utils/helpers';
import { getLocalizedDynamicText } from '../../utils/localizationHelper';
import './Leaderboard.css';

export const LeaderboardRightRail = ({ leaderboard = [], posts = [], onOpenLeaderboard }) => {
  const { t } = useTranslation();
  const top3 = leaderboard.slice(0, 3);
  const totalPosts = posts.length;
  const uniqueGardeners = new Set(posts.map(p => (p.userId?._id || p.userId)?.toString()).filter(Boolean)).size;
  const totalHarvests = posts.filter(p => p.category === 'showcase').length;

  const getMedalIcon = (idx) => {
    if (idx === 0) return '🥇';
    if (idx === 1) return '🥈';
    if (idx === 2) return '🥉';
    return `#${idx + 1}`;
  };

  return (
    <div className="community-top-cards-row">
      {/* Top Urban Farmers Card */}
      <div className="rail-card leaderboard-card">
        <div className="rail-card-header">
          <h3 className="rail-card-title">
            <RiTrophyLine style={{ color: '#d97706', fontSize: '1.15rem' }} /> {t('community.leaderboard.topFarmers', 'Top Urban Farmers')}
          </h3>
          <button className="rail-link-btn" onClick={onOpenLeaderboard}>
            {t('community.leaderboard.viewAll', 'View All')}
          </button>
        </div>

        {top3.length === 0 ? (
          <p className="rail-empty-text">{t('community.leaderboard.noPointsYet', 'No leaderboard points yet')}</p>
        ) : (
          <div className="rail-leaderboard-list">
            {top3.map((user, idx) => (
              <div key={user._id || idx} className="rail-leaderboard-item">
                <span className="rail-rank-medal">{getMedalIcon(idx)}</span>
                <div className="rail-avatar">
                  {user.profilePicture ? (
                    <img src={user.profilePicture} alt={user.name} />
                  ) : (
                    getInitials(user.name || 'User')
                  )}
                </div>
                <div className="rail-user-meta">
                  <span className="rail-user-name">{getLocalizedDynamicText(user.name)}</span>
                  <span className="rail-user-pts">{user.points || 0} {t('community.leaderboard.pts', 'pts')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Community Activity Card */}
      <div className="rail-card stats-card activity-spotlight-card">
        <div className="rail-card-header">
          <div className="activity-title-group">
            <h3 className="rail-card-title">
              <RiGroupLine style={{ color: 'var(--primary, #6b9080)', fontSize: '1.2rem' }} /> {t('community.activity.title', 'Community Activity')}
            </h3>
            <span className="activity-live-badge">
              <span className="live-pulse-dot" /> {t('community.activity.liveFeed', 'Live Feed')}
            </span>
          </div>
        </div>

        <div className="activity-stats-grid">
          {/* Tile 1: Posts Shared */}
          <div className="activity-tile tile-green">
            <div className="tile-icon-box icon-green">
              <RiArticleLine />
            </div>
            <div className="tile-content">
              <span className="tile-val">{totalPosts}</span>
              <span className="tile-label">{t('community.activity.postsShared', 'Posts Shared')}</span>
            </div>
          </div>

          {/* Tile 2: Active Gardeners */}
          <div className="activity-tile tile-blue">
            <div className="tile-icon-box icon-blue">
              <RiGroupLine />
            </div>
            <div className="tile-content">
              <span className="tile-val">{uniqueGardeners}</span>
              <span className="tile-label">{t('community.activity.activeGrowers', 'Active Growers')}</span>
            </div>
          </div>

          {/* Tile 3: Total Harvests */}
          <div className="activity-tile tile-orange">
            <div className="tile-icon-box icon-orange">
              <RiShoppingBasketLine />
            </div>
            <div className="tile-content">
              <span className="tile-val">{totalHarvests}</span>
              <span className="tile-label">{t('community.activity.harvestStories', 'Harvest Stories')}</span>
            </div>
          </div>
        </div>

        {/* Bottom Activity Progress / Engagement Pulse */}
        <div className="activity-pulse-footer">
          <div className="pulse-info">
            <span className="pulse-text">{t('community.activity.communityHealth', 'Community Health:')} <strong>{t('community.activity.thrivingSanctuary', 'Thriving Sanctuary 🌱')}</strong></span>
          </div>
          <div className="pulse-bar">
            <div className="pulse-fill" style={{ width: `${Math.min(Math.max((totalPosts + uniqueGardeners * 2 + totalHarvests * 3) * 6, 25), 100)}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
};

const Leaderboard = ({ leaderboard = [], onClose }) => {
  const { t } = useTranslation();

  const getRankBadge = (index) => {
    if (index === 0) return <span className="rank-emoji">🥇</span>;
    if (index === 1) return <span className="rank-emoji">🥈</span>;
    if (index === 2) return <span className="rank-emoji">🥉</span>;
    return <span className="rank-num">#{index + 1}</span>;
  };

  const getLevelBadge = (points) => {
    if (points > 100) {
      return (
        <span className="level-badge-inner">
          <RiMedalLine style={{ color: '#eab308' }} /> {t('community.levels.masterGardener', 'Master Gardener')}
        </span>
      );
    }
    if (points > 50) {
      return (
        <span className="level-badge-inner">
          <RiLeafLine style={{ color: '#16a34a' }} /> {t('community.levels.greenThumb', 'Green Thumb')}
        </span>
      );
    }
    if (points > 20) {
      return (
        <span className="level-badge-inner">
          <TbPlant2 style={{ color: '#2c5e3b' }} /> {t('community.levels.urbanFarmer', 'Urban Farmer')}
        </span>
      );
    }
    return (
      <span className="level-badge-inner">
        <RiSeedlingLine style={{ color: '#65a30d' }} /> {t('community.levels.seedling', 'Seedling')}
      </span>
    );
  };

  if (leaderboard.length === 0) {
    return (
      <div className="leaderboard-modal" onClick={onClose}>
        <div className="leaderboard-content" onClick={(e) => e.stopPropagation()}>
          <div className="leaderboard-header">
            <h3>
              <RiTrophyLine style={{ color: '#d97706', fontSize: '1.3rem' }} /> {t('community.leaderboard.modalTitle', 'Community Leaderboard')}
            </h3>
            <button className="close-btn" onClick={onClose} aria-label="Close">
              <RiCloseLine />
            </button>
          </div>
          <div className="empty-leaderboard">
            <RiSeedlingLine style={{ fontSize: '3rem', color: 'var(--primary, #6b9080)', display: 'block', margin: '0 auto 0.5rem' }} />
            <p>{t('community.leaderboard.noData', 'No leaderboard data yet.')}</p>
            <p className="sub-text">{t('community.leaderboard.noDataSub', 'Share posts & help others to earn points!')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="leaderboard-modal" onClick={onClose}>
      <div className="leaderboard-content" onClick={(e) => e.stopPropagation()}>
        <div className="leaderboard-header">
          <h3>
            <RiTrophyLine style={{ color: '#d97706', fontSize: '1.3rem' }} /> {t('community.leaderboard.modalTitle', 'Community Leaderboard')}
          </h3>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            <RiCloseLine />
          </button>
        </div>
        <div className="leaderboard-list">
          {leaderboard.map((user, index) => (
            <div key={user._id || index} className="leaderboard-row">
              <div className="leaderboard-rank">{getRankBadge(index)}</div>
              <div className="leaderboard-avatar">
                {user.profilePicture ? (
                  <img src={user.profilePicture} alt={user.name} />
                ) : (
                  getInitials(user.name || 'User')
                )}
              </div>
              <div className="leaderboard-user-details">
                <span className="leaderboard-user-name">{getLocalizedDynamicText(user.name)}</span>
                <span className="leaderboard-user-badge">{getLevelBadge(user.points)}</span>
              </div>
              <div className="leaderboard-stats">
                <span className="leaderboard-points">{user.points} {t('community.leaderboard.pts', 'pts')}</span>
                <span className="leaderboard-posts">{t('community.leaderboard.postsCount', '{{count}} posts', { count: user.postCount || 0 })}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
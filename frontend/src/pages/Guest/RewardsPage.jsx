import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FaTrophy,
  FaSeedling,
  FaAward,
  FaUsers,
  FaCrown,
  FaCheckCircle,
  FaArrowRight,
  FaLock,
  FaGift,
  FaTimes,
  FaMicroscope,
} from 'react-icons/fa';
import SEO from '../../components/SEO/SEO';
import BadgeEmblem from '../../components/Profile/BadgeEmblem';
import './RewardsPage.css';

const BADGE_DEFINITIONS = [
  { id: 'first_sprout', points: '+50 XP', color: '#27ae60', tierCategory: 'beginner' },
  { id: 'hydration_master', points: '+100 XP', color: '#2980b9', tierCategory: 'intermediate' },
  { id: 'disease_detective', points: '+150 XP', color: '#8e44ad', tierCategory: 'intermediate' },
  { id: 'green_thumb_pioneer', points: '+200 XP', color: '#16a085', tierCategory: 'beginner' },
  { id: 'master_harvester', points: '+500 XP', color: '#f39c12', tierCategory: 'master' },
  { id: 'soil_alchemist', points: '+120 XP', color: '#d35400', tierCategory: 'intermediate' },
  { id: 'community_mentor', points: '+250 XP', color: '#e74c3c', tierCategory: 'community' },
  { id: 'weather_watcher', points: '+100 XP', color: '#3498db', tierCategory: 'beginner' }
];

const RewardsPage = () => {
  const { t } = useTranslation();
  const L = t('rewardsPage', { returnObjects: true }) || {};
  const badgesText = L.badges || {};

  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedBadge, setSelectedBadge] = useState(null);

  const badges = BADGE_DEFINITIONS.map((b) => {
    const text = badgesText[b.id] || {};
    return {
      ...b,
      name: text.name || b.id,
      tier: text.tier || '',
      description: text.description || '',
      eligibility: text.eligibility || '',
      requirementStep: text.requirementStep || ''
    };
  });

  const filteredBadges = badges.filter((b) => {
    if (activeCategory === 'all') return true;
    return b.tierCategory === activeCategory;
  });

  return (
    <div className="rewards-page">
      <SEO
        title="Badges & Rewards Collection | UrbanFarm"
        description="Explore UrbanFarm badges, achievement eligibility criteria, and earn XP as you build your urban gardening community with us."
      />

      {/* Hero Header */}
      <section className="rewards-hero">
        <div className="rewards-hero-container text-center">
          <div className="rewards-section-tag">
            <FaAward /> {L.sloganBanner}
          </div>

          <h1 className="rewards-hero-title">
            {L.heroTitle} <span className="rewards-gradient-text">{L.heroTitleGrad}</span>
          </h1>

          <p className="rewards-hero-subtitle">{L.heroSub}</p>

          {/* Quick Metrics Counter */}
          <div className="rewards-stats-bar">
            <div className="rewards-stat-item">
              <span className="rsi-val">8</span>
              <span className="rsi-lbl">{L.statBadges}</span>
            </div>
            <div className="rewards-stat-divider" />
            <div className="rewards-stat-item">
              <span className="rsi-val accent">1,470+</span>
              <span className="rsi-lbl">{L.statXP}</span>
            </div>
            <div className="rewards-stat-divider" />
            <div className="rewards-stat-item">
              <span className="rsi-val">4</span>
              <span className="rsi-lbl">{L.statTiers}</span>
            </div>
            <div className="rewards-stat-divider" />
            <div className="rewards-stat-item">
              <span className="rsi-val">100%</span>
              <span className="rsi-lbl">{L.statCommunity}</span>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="rewards-filter-bar">
            <button
              className={`rewards-filter-btn ${activeCategory === 'all' ? 'active' : ''}`}
              onClick={() => setActiveCategory('all')}
            >
              <FaTrophy /> {L.allBadges}
            </button>
            <button
              className={`rewards-filter-btn ${activeCategory === 'beginner' ? 'active' : ''}`}
              onClick={() => setActiveCategory('beginner')}
            >
              <FaSeedling /> {L.beginner}
            </button>
            <button
              className={`rewards-filter-btn ${activeCategory === 'intermediate' ? 'active' : ''}`}
              onClick={() => setActiveCategory('intermediate')}
            >
              <FaAward /> {L.intermediate}
            </button>
            <button
              className={`rewards-filter-btn ${activeCategory === 'master' ? 'active' : ''}`}
              onClick={() => setActiveCategory('master')}
            >
              <FaCrown /> {L.master}
            </button>
            <button
              className={`rewards-filter-btn ${activeCategory === 'community' ? 'active' : ''}`}
              onClick={() => setActiveCategory('community')}
            >
              <FaUsers /> {L.community}
            </button>
          </div>
        </div>
      </section>

      {/* Badges Grid Section */}
      <section className="rewards-content-section">
        <div className="rewards-container">
          
          <div className="rewards-section-title text-center">
            <h2>{L.officialHeading}</h2>
            <p>{L.officialSub}</p>
          </div>

          {/* Badges Grid */}
          <div className="badges-grid">
            {filteredBadges.map((badge) => (
              <div
                key={badge.id}
                className="badge-card"
                onClick={() => setSelectedBadge(badge)}
                tabIndex={0}
                role="button"
                onKeyDown={(e) => { if (e.key === 'Enter') setSelectedBadge(badge); }}
              >
                <div className="badge-card-top">
                  <div className="badge-emblem-box">
                    <BadgeEmblem id={badge.id} isUnlocked={true} size={68} />
                  </div>
                  <span className="badge-xp-pill">{badge.points}</span>
                </div>

                <div className="badge-card-body">
                  <span className="badge-tier-tag" style={{ color: badge.color, borderColor: `${badge.color}40` }}>
                    {badge.tier}
                  </span>
                  <h3 className="badge-name">{badge.name}</h3>
                  <p className="badge-desc">{badge.description}</p>

                  {/* Eligibility Requirement Box */}
                  <div className="eligibility-box">
                    <span className="elig-label">{L.howToEarn}</span>
                    <p className="elig-text">
                      <FaCheckCircle className="check-ic" style={{ color: badge.color }} /> {badge.eligibility}
                    </p>
                    <div className="elig-step-tag">
                      <FaLock className="lock-ic" /> {badge.requirementStep}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Above Footer Community Spotlight Banner */}
      <section className="about-impact-banner">
        <div className="landing-container text-center">
          <div className="rewards-section-tag" style={{ marginBottom: '1rem' }}>
            <FaUsers /> COMMUNITY SPOTLIGHT
          </div>
          <h2>"{L.sloganCardTitle}"</h2>
          <p>{L.sloganCardSub}</p>
          <div className="about-cta-group">
            <Link to="/register" className="landing-btn landing-btn-primary">
              <FaUsers /> {L.joinCommunityBtn} <FaArrowRight />
            </Link>
            <Link to="/live-preview" className="landing-btn landing-btn-secondary">
              <FaMicroscope /> {L.testDiagnosisBtn}
            </Link>
          </div>
        </div>
      </section>

      {/* Badge Detail Modal Preview */}
      {selectedBadge && (
        <div className="badge-modal-backdrop" onClick={() => setSelectedBadge(null)}>
          <div className="badge-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close-btn"
              onClick={() => setSelectedBadge(null)}
              aria-label={L.closeModal}
            >
              <FaTimes />
            </button>

            <div className="modal-emblem-box">
              <BadgeEmblem id={selectedBadge.id} isUnlocked={true} size={92} />
            </div>

            <span className="badge-tier-tag" style={{ color: selectedBadge.color, borderColor: `${selectedBadge.color}40` }}>
              {selectedBadge.tier}
            </span>
            <h2 className="modal-title">{selectedBadge.name}</h2>
            <p className="modal-desc">{selectedBadge.description}</p>

            <div className="modal-eligibility-details">
              <h4>{L.eligibilityHeader}</h4>
              <p className="modal-elig-text">
                <FaCheckCircle style={{ color: selectedBadge.color }} /> {selectedBadge.eligibility}
              </p>
              <div className="modal-reward-tag">
                <FaGift /> Reward: <strong>{selectedBadge.points}</strong>
              </div>
            </div>

            <p className="modal-unlock-notice">{L.badgeUnlockedNotice}</p>

            <div className="modal-actions">
              <Link to="/register" className="guest-btn guest-btn-primary full-width" onClick={() => setSelectedBadge(null)}>
                {L.registerCTA}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RewardsPage;

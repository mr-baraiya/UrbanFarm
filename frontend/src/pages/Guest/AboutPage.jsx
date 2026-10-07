import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SEO from '../../components/SEO/SEO';
import {
  FaBullseye,
  FaGlobe,
  FaHandHoldingHeart,
  FaSeedling,
  FaRecycle,
  FaArrowRight,
} from 'react-icons/fa';
import './AboutPage.css';

const AboutPage = () => {
  const { t, i18n } = useTranslation();

  const teamMembers = [
    {
      name: t('about.member1Name'),
      role: t('about.member1Role'),
      bio: t('about.member1Bio'),
      iconBg: '#27ae60',
      initials: 'AV',
    },
    {
      name: t('about.member2Name'),
      role: t('about.member2Role'),
      bio: t('about.member2Bio'),
      iconBg: '#2980b9',
      initials: 'SS',
    },
    {
      name: t('about.member3Name'),
      role: t('about.member3Role'),
      bio: t('about.member3Bio'),
      iconBg: '#8e44ad',
      initials: 'DR',
    },
    {
      name: t('about.member4Name'),
      role: t('about.member4Role'),
      bio: t('about.member4Bio'),
      iconBg: '#d35400',
      initials: 'AT',
    },
  ];

  const sustainabilityPillars = [
    {
      icon: <FaRecycle />,
      title: t('about.pillar1Title'),
      desc: t('about.pillar1Desc'),
    },
    {
      icon: <FaSeedling />,
      title: t('about.pillar2Title'),
      desc: t('about.pillar2Desc'),
    },
    {
      icon: <FaHandHoldingHeart />,
      title: t('about.pillar3Title'),
      desc: t('about.pillar3Desc'),
    },
  ];

  return (
    <div className="about-page">
      <SEO
        title={t('about.heroH1', 'About UrbanFarm – Smart Urban Agriculture & Mission')}
        description={t('about.heroSubtitle', 'Learn about UrbanFarm mission, sustainable urban agriculture pillars, and our team dedicated to empowering city growers with AI.')}
        canonical="https://urbanfarm.baraiyavishalbhai32.workers.dev/about"
        keywords="about urbanfarm, smart farming mission, urban agriculture team, sustainable gardening, rooftop farming vision"
        lang={i18n.language}
      />
      {/* Header Banner */}
      <section className="about-hero">
        <div className="about-container text-center">
          <span className="section-tag">{t('about.tagMissionVision')}</span>
          <h1>{t('about.heroH1')}</h1>
          <p className="about-hero-subtitle">
            {t('about.heroSubtitle')}
          </p>
        </div>
      </section>

      {/* Story & Mission Section */}
      <section className="about-story-section">
        <div className="about-container story-grid">
          <div className="story-card">
            <div className="story-icon">
              <FaBullseye />
            </div>
            <h2>{t('about.missionTitle')}</h2>
            <p>
              {t('about.missionDesc')}
            </p>
          </div>
          <div className="story-card">
            <div className="story-icon">
              <FaGlobe />
            </div>
            <h2>{t('about.storyTitle')}</h2>
            <p>
              {t('about.storyDesc')}
            </p>
          </div>
        </div>
      </section>

      {/* Sustainability Focus */}
      <section className="about-sustainability-section">
        <div className="about-container">
          <div className="section-header text-center">
            <span className="section-tag">{t('about.tagEcological')}</span>
            <h2>{t('about.sustainabilityTitle')}</h2>
            <p>{t('about.sustainabilitySubtitle')}</p>
          </div>

          <div className="pillars-grid">
            {sustainabilityPillars.map((p, idx) => (
              <div key={idx} className="pillar-card">
                <div className="pillar-icon">{p.icon}</div>
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Introduction */}
      <section className="about-team-section">
        <div className="about-container">
          <div className="section-header text-center">
            <span className="section-tag">{t('about.tagTeam')}</span>
            <h2>{t('about.teamTitle')}</h2>
          </div>

          <div className="team-grid">
            {teamMembers.map((m, idx) => (
              <div key={idx} className="team-card">
                <div className="team-avatar" style={{ background: m.iconBg }}>
                  {m.initials}
                </div>
                <h3>{m.name}</h3>
                <span className="team-role">{m.role}</span>
                <p>{m.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="about-impact-banner">
        <div className="about-container text-center">
          <h2>{t('about.impactBannerTitle')}</h2>
          <p>{t('about.impactBannerSubtitle')}</p>
          <div className="about-cta-group">
            <Link to="/register" className="landing-btn landing-btn-primary">
              {t('about.joinToday')} <FaArrowRight />
            </Link>
            <Link to="/contact" className="landing-btn landing-btn-secondary">
              {t('about.getInTouch')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;

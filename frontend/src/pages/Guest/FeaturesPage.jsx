import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FaRobot,
  FaCloudSunRain,
  FaSeedling,
  FaUsers,
  FaCheckCircle,
  FaArrowRight,
  FaShieldAlt,
  FaLeaf,
  FaMicroscope,
  FaTint,
  FaMapMarkedAlt,
  FaComments,
  FaBell,
  FaStar,
  FaBolt,
  FaChartLine,
} from 'react-icons/fa';
import './FeaturesPage.css';

const FeaturesPage = () => {
  const { t } = useTranslation();
  const [activeFeature, setActiveFeature] = useState(0);

  const featureList = [
    {
      id: 'disease-diagnosis',
      title: t('featuresPage.f1Title'),
      badge: t('featuresPage.f1Badge'),
      icon: <FaRobot />,
      miniIcon: <FaMicroscope />,
      accent: '#27ae60',
      accentDark: '#1e8449',
      summary: t('featuresPage.f1Summary'),
      details: [
        t('featuresPage.f1Detail1'),
        t('featuresPage.f1Detail2'),
        t('featuresPage.f1Detail3'),
        t('featuresPage.f1Detail4'),
      ],
      visual: {
        title: t('featuresPage.f1VisualTitle'),
        stats: [
          { label: t('featuresPage.f1Stat1Label'), value: '98.4%', good: true },
          { label: t('featuresPage.f1Stat2Label'), value: '30+ Crops', good: true },
          { label: t('featuresPage.f1Stat3Label'), value: '< 2 seconds', good: true },
        ],
        tag: t('featuresPage.f1VisualTag'),
      },
      ctaText: t('featuresPage.f1Cta'),
      ctaLink: '/register',
    },
    {
      id: 'smart-irrigation',
      title: t('featuresPage.f2Title'),
      badge: t('featuresPage.f2Badge'),
      icon: <FaCloudSunRain />,
      miniIcon: <FaTint />,
      accent: '#2980b9',
      accentDark: '#1f618d',
      summary: t('featuresPage.f2Summary'),
      details: [
        t('featuresPage.f2Detail1'),
        t('featuresPage.f2Detail2'),
        t('featuresPage.f2Detail3'),
        t('featuresPage.f2Detail4'),
      ],
      visual: {
        title: t('featuresPage.f2VisualTitle'),
        stats: [
          { label: t('featuresPage.f2Stat1Label'), value: 'Up to 40%', good: true },
          { label: t('featuresPage.f2Stat2Label'), value: 'Live Updates', good: true },
          { label: t('featuresPage.f2Stat3Label'), value: 'Auto Delay', good: true },
        ],
        tag: t('featuresPage.f2VisualTag'),
      },
      ctaText: t('featuresPage.f2Cta'),
      ctaLink: '/register',
    },
    {
      id: 'garden-management',
      title: t('featuresPage.f3Title'),
      badge: t('featuresPage.f3Badge'),
      icon: <FaSeedling />,
      miniIcon: <FaMapMarkedAlt />,
      accent: '#7d3c98',
      accentDark: '#6c3483',
      summary: t('featuresPage.f3Summary'),
      details: [
        t('featuresPage.f3Detail1'),
        t('featuresPage.f3Detail2'),
        t('featuresPage.f3Detail3'),
        t('featuresPage.f3Detail4'),
      ],
      visual: {
        title: t('featuresPage.f3VisualTitle'),
        stats: [
          { label: t('featuresPage.f3Stat1Label'), value: 'Multi-Zone', good: true },
          { label: t('featuresPage.f3Stat2Label'), value: 'Photo + Data', good: true },
          { label: t('featuresPage.f3Stat3Label'), value: 'Automated', good: true },
        ],
        tag: t('featuresPage.f3VisualTag'),
      },
      ctaText: t('featuresPage.f3Cta'),
      ctaLink: '/register',
    },
    {
      id: 'community',
      title: t('featuresPage.f4Title'),
      badge: t('featuresPage.f4Badge'),
      icon: <FaUsers />,
      miniIcon: <FaComments />,
      accent: '#d35400',
      accentDark: '#b94600',
      summary: t('featuresPage.f4Summary'),
      details: [
        t('featuresPage.f4Detail1'),
        t('featuresPage.f4Detail2'),
        t('featuresPage.f4Detail3'),
        t('featuresPage.f4Detail4'),
      ],
      visual: {
        title: t('featuresPage.f4VisualTitle'),
        stats: [
          { label: t('featuresPage.f4Stat1Label'), value: '12,500+', good: true },
          { label: t('featuresPage.f4Stat2Label'), value: 'Agronomists', good: true },
          { label: t('featuresPage.f4Stat3Label'), value: 'Heirloom+', good: true },
        ],
        tag: t('featuresPage.f4VisualTag'),
      },
      ctaText: t('featuresPage.f4Cta'),
      ctaLink: '/register',
    },
  ];

  const quickFeatures = [
    { icon: <FaBell />, title: t('featuresPage.q1Title'), desc: t('featuresPage.q1Desc') },
    { icon: <FaChartLine />, title: t('featuresPage.q2Title'), desc: t('featuresPage.q2Desc') },
    { icon: <FaLeaf />, title: t('featuresPage.q3Title'), desc: t('featuresPage.q3Desc') },
    { icon: <FaShieldAlt />, title: t('featuresPage.q4Title'), desc: t('featuresPage.q4Desc') },
    { icon: <FaStar />, title: t('featuresPage.q5Title'), desc: t('featuresPage.q5Desc') },
    { icon: <FaBolt />, title: t('featuresPage.q6Title'), desc: t('featuresPage.q6Desc') },
  ];

  const active = featureList[activeFeature];

  return (
    <div className="features-page">

      {/* Hero */}
      <section className="fp-hero">
        <div className="fp-container fp-text-center">
          <span className="fp-section-tag">{t('featuresPage.heroTag')}</span>
          <h1 className="fp-hero-title">{t('featuresPage.heroTitlePrefix')}<br /><span className="fp-gradient-text">{t('featuresPage.heroTitleHighlight')}</span></h1>
          <p className="fp-hero-subtitle">
            {t('featuresPage.heroSubtitle')}
          </p>
          <div className="fp-hero-badges">
            <span className="fp-hero-pill"><FaCheckCircle /> {t('featuresPage.heroPillAi')}</span>
            <span className="fp-hero-pill"><FaCheckCircle /> {t('featuresPage.heroPillSync')}</span>
            <span className="fp-hero-pill"><FaCheckCircle /> {t('featuresPage.heroPillZero')}</span>
          </div>
        </div>
      </section>

      {/* Interactive Feature Explorer */}
      <section className="fp-section">
        <div className="fp-container">
          <div className="fp-text-center fp-section-header">
            <span className="fp-section-tag">{t('featuresPage.coreTag')}</span>
            <h2>{t('featuresPage.coreTitle')}</h2>
            <p>{t('featuresPage.coreSubtitle')}</p>
          </div>

          {/* Tab Navigation */}
          <div className="fp-tabs">
            {featureList.map((f, idx) => (
              <button
                key={f.id}
                className={`fp-tab ${activeFeature === idx ? 'active' : ''}`}
                style={activeFeature === idx ? { '--tab-accent': f.accent } : {}}
                onClick={() => setActiveFeature(idx)}
              >
                <span className="fp-tab-icon" style={activeFeature === idx ? { color: f.accent } : {}}>{f.icon}</span>
                <span className="fp-tab-label">{f.title}</span>
              </button>
            ))}
          </div>

          {/* Feature Detail Panel */}
          <div className="fp-detail-panel" key={active.id}>
            <div className="fp-detail-info">
              <span className="fp-badge" style={{ background: `${active.accent}18`, color: active.accent, border: `1px solid ${active.accent}30` }}>
                {active.miniIcon} {active.badge}
              </span>
              <h2 className="fp-detail-title">{active.title}</h2>
              <p className="fp-detail-summary">{active.summary}</p>

              <ul className="fp-detail-list">
                {active.details.map((d, i) => (
                  <li key={i}>
                    <FaCheckCircle style={{ color: active.accent }} className="fp-check" />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>

              <Link to={active.ctaLink} className="fp-cta-btn" style={{ background: `linear-gradient(135deg, ${active.accent}, ${active.accentDark})` }}>
                {active.ctaText} <FaArrowRight />
              </Link>
            </div>

            <div className="fp-detail-visual" style={{ borderColor: `${active.accent}25` }}>
              <div className="fp-visual-header" style={{ background: `${active.accent}12`, borderColor: `${active.accent}20` }}>
                <span className="fp-visual-icon" style={{ background: `${active.accent}20`, color: active.accent }}>{active.icon}</span>
                <strong>{active.visual.title}</strong>
                <span className="fp-visual-live">● LIVE</span>
              </div>
              <div className="fp-visual-body">
                {active.visual.stats.map((s, i) => (
                  <div key={i} className="fp-visual-stat">
                    <span className="fp-vs-label">{s.label}</span>
                    <span className="fp-vs-value" style={{ color: active.accent }}>{s.value}</span>
                  </div>
                ))}
                <div className="fp-visual-tag" style={{ background: `${active.accent}12`, color: active.accent, border: `1px solid ${active.accent}25` }}>
                  {active.visual.tag}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Feature Grid */}
      <section className="fp-section fp-section-alt">
        <div className="fp-container">
          <div className="fp-text-center fp-section-header">
            <span className="fp-section-tag">{t('featuresPage.builtinTag')}</span>
            <h2>{t('featuresPage.builtinTitle')}</h2>
            <p>{t('featuresPage.builtinSubtitle')}</p>
          </div>
          <div className="fp-quick-grid">
            {quickFeatures.map((f, i) => (
              <div key={i} className="fp-quick-card">
                <div className="fp-quick-icon">{f.icon}</div>
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="fp-cta-section">
        <div className="fp-container fp-text-center">
          <div className="fp-cta-inner">
            <span className="fp-section-tag">{t('featuresPage.ctaTag')}</span>
            <h2>{t('featuresPage.ctaTitle')}</h2>
            <p>{t('featuresPage.ctaSubtitle')}</p>
            <div className="fp-cta-group">
              <Link to="/register" className="fp-cta-btn fp-cta-btn-lg">
                {t('featuresPage.getStartedFree')} <FaArrowRight />
              </Link>
              <Link to="/about" className="fp-cta-ghost-btn">
                {t('featuresPage.learnMore')}
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default FeaturesPage;

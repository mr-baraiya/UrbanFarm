import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
  FaCogs,
} from 'react-icons/fa';
import './FeaturesPage.css';


const FeaturesPage = () => {
  const [activeFeature, setActiveFeature] = useState(0);

  const featureList = [
    {
      id: 'disease-diagnosis',
      title: 'AI Plant Disease Diagnosis',
      badge: 'Computer Vision AI',
      icon: <FaRobot />,
      miniIcon: <FaMicroscope />,
      accent: '#27ae60',
      accentDark: '#1e8449',
      summary: 'Instantly detect diseases, pathogens, and pests from a single leaf photo with 98.4% accuracy.',
      details: [
        '98.4% diagnostic accuracy trained on 100,000+ plant datasets',
        'Supports 30+ urban crop species — tomatoes, peppers, herbs & more',
        'Organic treatment protocols: neem oil, biological controls, pruning',
        'Tracks diagnosis history to monitor recovery over time',
      ],
      visual: {
        title: 'Diagnosis Engine',
        stats: [
          { label: 'Detection Accuracy', value: '98.4%', good: true },
          { label: 'Species Supported', value: '30+ Crops', good: true },
          { label: 'Analysis Time', value: '< 2 seconds', good: true },
        ],
        tag: '🛡️ Powered by UrbanFarm Vision AI',
      },
      ctaText: 'Try AI Diagnosis',
      ctaLink: '/register',
    },
    {
      id: 'smart-irrigation',
      title: 'Weather-Based Smart Irrigation',
      badge: 'Microclimate Sync',
      icon: <FaCloudSunRain />,
      miniIcon: <FaTint />,
      accent: '#2980b9',
      accentDark: '#1f618d',
      summary: 'Dynamic watering schedules that sync with live local weather to cut water waste by up to 40%.',
      details: [
        'Automated rain delays — skips sessions when rain is forecast',
        'Adapts to humidity, temperature, sunlight hours & soil type',
        'Growth-stage aware: seedling vs flowering vs mature watering',
        'Save up to 40% on household water usage',
      ],
      visual: {
        title: 'Irrigation Dashboard',
        stats: [
          { label: 'Water Saved', value: 'Up to 40%', good: true },
          { label: 'Weather Sync', value: 'Live Updates', good: true },
          { label: 'Rain Detection', value: 'Auto Delay', good: true },
        ],
        tag: '🌧️ Real-Time Microclimate Sync Active',
      },
      ctaText: 'Set Up Irrigation',
      ctaLink: '/register',
    },
    {
      id: 'garden-management',
      title: 'Balcony & Bed Space Management',
      badge: 'Space Optimization',
      icon: <FaSeedling />,
      miniIcon: <FaMapMarkedAlt />,
      accent: '#7d3c98',
      accentDark: '#6c3483',
      summary: 'Virtual mapping for raised beds, balcony pots, hydroponic towers, and rooftop plots.',
      details: [
        'Track planting dates, variety, and projected harvest windows',
        'Visual growth logs with photo timelines and height records',
        'Sunlight exposure calculator & companion planting compatibility',
        'Automated alerts for fertilizing, pruning, and replanting cycles',
      ],
      visual: {
        title: 'Garden Map View',
        stats: [
          { label: 'Space Tracking', value: 'Multi-Zone', good: true },
          { label: 'Growth Logs', value: 'Photo + Data', good: true },
          { label: 'Smart Alerts', value: 'Automated', good: true },
        ],
        tag: '🗺️ Full Garden Space Intelligence',
      },
      ctaText: 'Map Your Garden',
      ctaLink: '/register',
    },
    {
      id: 'community',
      title: 'Community Knowledge & Seed Swaps',
      badge: 'Urban Network',
      icon: <FaUsers />,
      miniIcon: <FaComments />,
      accent: '#d35400',
      accentDark: '#b94600',
      summary: 'A vibrant social platform where urban growers share advice, trade seeds, and solve challenges together.',
      details: [
        'Q&A forum categorized by crop type, pest control & climate',
        'Showcase balcony harvests with photo galleries',
        'Agronomist-verified expert badges for reliable advice',
        'Local seed exchange locator for rare heirloom varieties',
      ],
      visual: {
        title: 'Community Hub',
        stats: [
          { label: 'Active Members', value: '12,500+', good: true },
          { label: 'Expert Verified', value: 'Agronomists', good: true },
          { label: 'Seed Library', value: 'Heirloom+', good: true },
        ],
        tag: '🤝 Peer-Verified Urban Farming Community',
      },
      ctaText: 'Join the Community',
      ctaLink: '/register',
    },
  ];

  const quickFeatures = [
    { icon: <FaBell />, title: 'Smart Notifications', desc: 'Never miss watering, pruning, or harvest windows.' },
    { icon: <FaChartLine />, title: 'Growth Analytics', desc: 'Track yield trends over weeks and seasons.' },
    { icon: <FaLeaf />, title: 'Plant Health Score', desc: 'Live composite health score for every plant.' },
    { icon: <FaShieldAlt />, title: 'AI Guard Engine', desc: 'Continuous background monitoring 24/7.' },
    { icon: <FaStar />, title: 'Harvest Planner', desc: 'Forecast exact harvest dates by growth data.' },
    { icon: <FaBolt />, title: 'Instant Insights', desc: "Real-time tips based on your plants' status." },
  ];

  const active = featureList[activeFeature];

  return (
    <div className="features-page">

      {/* Hero */}
      <section className="fp-hero">
        <div className="fp-container fp-text-center">
          <span className="fp-section-tag">COMPREHENSIVE TOOLKIT</span>
          <h1 className="fp-hero-title">Smart Features Built for<br /><span className="fp-gradient-text">Modern Urban Farming</span></h1>
          <p className="fp-hero-subtitle">
            From computer vision pathogen scans to automated weather irrigation — discover how UrbanFarm makes city agriculture effortless and high-yielding.
          </p>
          <div className="fp-hero-badges">
            <span className="fp-hero-pill"><FaCheckCircle /> AI-Powered</span>
            <span className="fp-hero-pill"><FaCheckCircle /> Real-Time Sync</span>
            <span className="fp-hero-pill"><FaCheckCircle /> Zero Setup</span>
          </div>
        </div>
      </section>

      {/* Interactive Feature Explorer */}
      <section className="fp-section">
        <div className="fp-container">
          <div className="fp-text-center fp-section-header">
            <span className="fp-section-tag">CORE FEATURES</span>
            <h2>Everything Your Urban Farm Needs</h2>
            <p>Click any feature to explore capabilities in depth.</p>
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
            <span className="fp-section-tag">BUILT-IN TOOLS</span>
            <h2>Plus Everything in Between</h2>
            <p>Dozens of intelligent micro-features to keep your garden thriving.</p>
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
            <span className="fp-section-tag">GET STARTED TODAY</span>
            <h2>Ready to Experience These Features Live?</h2>
            <p>Create a free account in under 60 seconds and start monitoring your urban farm.</p>
            <div className="fp-cta-group">
              <Link to="/register" className="fp-cta-btn fp-cta-btn-lg">
                Get Started Free <FaArrowRight />
              </Link>
              <Link to="/about" className="fp-cta-ghost-btn">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default FeaturesPage;

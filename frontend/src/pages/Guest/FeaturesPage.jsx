import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaRobot,
  FaCloudSunRain,
  FaSeedling,
  FaUsers,
  FaChartLine,
  FaCheckCircle,
  FaArrowRight,
  FaShieldAlt,
  FaWater,
  FaBug,
  FaCalendarAlt,
  FaCogs,
} from 'react-icons/fa';
import './FeaturesPage.css';

const FeaturesPage = () => {
  const featureList = [
    {
      id: 'disease-diagnosis',
      title: 'AI-Powered Plant Disease Diagnosis',
      badge: 'Computer Vision AI',
      icon: <FaRobot />,
      color: '#27ae60',
      summary: 'Instant leaf image classification detecting plant diseases, pathogens, and pest infestations before they spread.',
      details: [
        'Over 98.4% diagnostic accuracy trained on 100,000+ plant leaf datasets.',
        'Supports 30+ urban crop species including tomatoes, peppers, spinach, and herbs.',
        'Provides organic treatment protocols (neem oil, biological controls, pruning guidance).',
        'Tracks diagnosis history to monitor plant recovery over several weeks.',
      ],
      ctaText: 'Test AI Diagnosis',
      ctaLink: '/register',
    },
    {
      id: 'smart-irrigation',
      title: 'Weather-Based Smart Irrigation',
      badge: 'Microclimate Sync',
      icon: <FaCloudSunRain />,
      color: '#2980b9',
      summary: 'Dynamic watering algorithms that sync with live local weather forecasts to eliminate over-watering.',
      details: [
        'Automated rain delays—skips watering sessions when precipitation is forecasted.',
        'Considers humidity, ambient temperature, sunlight hours, and soil type.',
        'Tailors water amounts by growth stage (seedlings vs flowering vs mature plants).',
        'Helps urban households save up to 40% on water usage.',
      ],
      ctaText: 'Set Up Irrigation',
      ctaLink: '/register',
    },
    {
      id: 'garden-management',
      title: 'Balcony & Bed Space Management',
      badge: 'Space Optimization',
      icon: <FaSeedling />,
      color: '#8e44ad',
      summary: 'Virtual mapping for raised beds, balcony pots, hydroponic towers, and rooftop plots.',
      details: [
        'Track individual plants, planting dates, variety, and projected harvest windows.',
        'Keep visual growth logs with photo timelines and height records.',
        'Calculate sunlight exposure and companion planting compatibility.',
        'Receive automated notifications when plants require fertilizing or pruning.',
      ],
      ctaText: 'Create Your Garden Space',
      ctaLink: '/register',
    },
    {
      id: 'community',
      title: 'Community Knowledge & Seed Swaps',
      badge: 'Urban Network',
      icon: <FaUsers />,
      color: '#d35400',
      summary: 'A vibrant social platform connecting urban growers to exchange advice, trade seeds, and solve garden challenges.',
      details: [
        'Q&A forum categorized by crop type, pest control, and regional climate.',
        'Showcase balcony harvests and bed layouts with photo galleries.',
        'Peer moderation & agronomist badge verification ensuring reliable advice.',
        'Local seed exchange locator for rare heirloom seed varieties.',
      ],
      ctaText: 'Join the Community',
      ctaLink: '/register',
    },
  ];

  return (
    <div className="features-page">
      {/* Hero */}
      <section className="features-hero">
        <div className="features-container text-center">
          <span className="section-tag">COMPREHENSIVE TOOLKIT</span>
          <h1>Smart Features Built for Modern Urban Farming</h1>
          <p className="features-hero-subtitle">
            From computer vision pathogen scans to automated weather irrigation—discover how UrbanFarm makes city agriculture effortless and high-yielding.
          </p>
        </div>
      </section>

      {/* Main Features Breakdown */}
      <section className="features-breakdown-section">
        <div className="features-container">
          {featureList.map((item, index) => (
            <div
              key={item.id}
              id={item.id}
              className={`feature-breakdown-card ${index % 2 === 1 ? 'reverse' : ''}`}
            >
              <div className="breakdown-info">
                <span className="feature-badge" style={{ background: `${item.color}15`, color: item.color }}>
                  {item.badge}
                </span>
                <h2>{item.title}</h2>
                <p className="breakdown-summary">{item.summary}</p>

                <ul className="breakdown-details-list">
                  {item.details.map((detail, dIdx) => (
                    <li key={dIdx}>
                      <FaCheckCircle className="check-icon" style={{ color: item.color }} />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>

                <Link to={item.ctaLink} className="landing-btn landing-btn-primary" style={{ background: item.color }}>
                  {item.ctaText} <FaArrowRight />
                </Link>
              </div>

              <div className="breakdown-visual" style={{ borderColor: `${item.color}30` }}>
                <div className="visual-header" style={{ background: `${item.color}10` }}>
                  <span className="visual-icon" style={{ color: item.color }}>{item.icon}</span>
                  <strong>{item.title} Dashboard</strong>
                </div>
                <div className="visual-preview-body">
                  <div className="preview-stat-row">
                    <span>Status</span>
                    <strong style={{ color: item.color }}>Operational & Synced</strong>
                  </div>
                  <div className="preview-stat-row">
                    <span>Target Precision</span>
                    <strong>99.1% High Accuracy</strong>
                  </div>
                  <div className="preview-stat-row">
                    <span>Supported Ecosystem</span>
                    <strong>Urban Balconies & Beds</strong>
                  </div>
                  <div className="preview-mini-banner" style={{ background: `${item.color}12`, color: item.color }}>
                    <FaShieldAlt /> Protected by UrbanFarm AI Guard Engine
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="features-cta-banner">
        <div className="features-container text-center">
          <h2>Ready to experience these features live?</h2>
          <p>Create a free account in under 60 seconds and start monitoring your urban farm.</p>
          <div className="features-cta-group">
            <Link to="/register" className="landing-btn landing-btn-primary btn-large">
              Get Started for Free <FaArrowRight />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FeaturesPage;

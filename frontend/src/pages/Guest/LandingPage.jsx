import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaLeaf,
  FaRobot,
  FaCloudSunRain,
  FaUsers,
  FaSeedling,
  FaArrowRight,
  FaCheckCircle,
  FaQuoteLeft,
  FaStar,
  FaChartLine,
  FaShieldAlt,
  FaPlay,
} from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import './LandingPage.css';

const LandingPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('diagnosis');

  const stats = [
    { number: '12,500+', label: 'Active Urban Farmers' },
    { number: '85,000+', label: 'Plants Monitored' },
    { number: '40%', label: 'Water Saved via Smart Irrigation' },
    { number: '98.4%', label: 'AI Diagnosis Accuracy' },
  ];

  const features = [
    {
      icon: <FaRobot />,
      title: 'AI Crop Disease Diagnostic',
      desc: 'Snap a leaf photo to instantly detect bacterial, fungal, or pest infestations with precision treatment guidance.',
      link: '/features#disease-diagnosis',
      color: '#27ae60',
    },
    {
      icon: <FaCloudSunRain />,
      title: 'Weather-Sync Irrigation',
      desc: 'Automate watering rhythms based on local humidity, rainfall forecasts, and plant stage requirements.',
      link: '/features#smart-irrigation',
      color: '#2980b9',
    },
    {
      icon: <FaSeedling />,
      title: 'Bed & Space Planner',
      desc: 'Optimize limited urban square footage—balconies, raised beds, or indoor hydroponic shelves.',
      link: '/features#garden-management',
      color: '#8e44ad',
    },
    {
      icon: <FaUsers />,
      title: 'Farmer Knowledge Hub',
      desc: 'Connect with nearby urban growers, swap organic seeds, and get advice verified by experts.',
      link: '/features#community',
      color: '#d35400',
    },
  ];

  const testimonials = [
    {
      quote: "UrbanFarm helped me turn my 4m² balcony into a tomato and herb factory! The AI leaf scanner saved my basil harvest twice.",
      author: "Elena Rostova",
      role: "Rooftop Grower, Berlin",
      rating: 5,
    },
    {
      quote: "The weather-synced watering schedule takes all the anxiety out of urban gardening when I travel for work.",
      author: "Marcus Chen",
      role: "Balcony Gardener, Toronto",
      rating: 5,
    },
    {
      quote: "As a beginner, having intelligent disease alerts and seed recommendations gave me the confidence to grow organic produce.",
      author: "Sarah Jenkins",
      role: "Community Bed Lead, Seattle",
      rating: 5,
    },
  ];

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="landing-hero">
        <div className="hero-container">
          <div className="hero-badge">
            <FaLeaf /> Next-Gen Smart Urban Agriculture
          </div>
          <h1 className="hero-title">
            Grow Thriving Food Systems in <span className="title-gradient">Any Urban Space</span>
          </h1>
          <p className="hero-subtitle">
            Plan garden beds, diagnose plant diseases with AI vision, automate weather-based watering, and join thousands of city farmers harvesting homegrown produce.
          </p>
          <div className="hero-cta-group">
            {user ? (
              <Link to={user.role === 'admin' ? '/admin' : '/app'} className="landing-btn landing-btn-primary">
                Open Dashboard <FaArrowRight />
              </Link>
            ) : (
              <>
                <Link to="/register" className="landing-btn landing-btn-primary">
                  Get Started Free <FaArrowRight />
                </Link>
                <Link to="/features" className="landing-btn landing-btn-secondary">
                  Explore Platform Features
                </Link>
              </>
            )}
          </div>

          <div className="hero-highlights-row">
            <span><FaCheckCircle className="check-icon" /> No hardware required</span>
            <span><FaCheckCircle className="check-icon" /> Instant AI Leaf Diagnosis</span>
            <span><FaCheckCircle className="check-icon" /> Free forever basic tier</span>
          </div>
        </div>
      </section>


      {/* Project Introduction */}
      <section className="landing-intro-section">
        <div className="landing-container intro-grid">
          <div className="intro-content">
            <span className="section-tag">WHY URBANFARM?</span>
            <h2>Empowering City Dwellers to Reclaim Their Food Sovereignty</h2>
            <p>
              Urban environments host millions of unused balconies, rooftops, and small yard patches. UrbanFarm provides the intelligent software toolkit to turn micro-spaces into abundant, sustainable organic farms.
            </p>
            <ul className="intro-list">
              <li><strong>Zero Guesswork:</strong> Data-driven care schedules tailored to your microclimate.</li>
              <li><strong>Save Water & Resources:</strong> Weather forecasts auto-adjust your watering routines.</li>
              <li><strong>Pest & Disease Defense:</strong> Computer vision models detect early signs of blight or mildew.</li>
            </ul>
            <Link to="/about" className="landing-btn landing-btn-outline">
              Read Our Story & Mission <FaArrowRight />
            </Link>
          </div>
          <div className="intro-visual-card">
            <div className="visual-header">
              <div className="visual-dot red"></div>
              <div className="visual-dot yellow"></div>
              <div className="visual-dot green"></div>
              <span>UrbanFarm Smart Care Engine</span>
            </div>
            <div className="visual-body">
              <div className="smart-status-item">
                <FaCloudSunRain className="item-icon blue" />
                <div>
                  <strong>Weather Sync: Active</strong>
                  <p>Rain expected in 4 hrs — Watering skipped automatically.</p>
                </div>
              </div>
              <div className="smart-status-item">
                <FaRobot className="item-icon green" />
                <div>
                  <strong>AI Scan: Healthy</strong>
                  <p>Tomato #3 foliage scan: 99.2% Healthy (No Blight detected).</p>
                </div>
              </div>
              <div className="smart-status-item">
                <FaSeedling className="item-icon purple" />
                <div>
                  <strong>Growth Stage: Flowering</strong>
                  <p>Estimated harvest date: 14 days remaining.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="landing-features-section">
        <div className="landing-container">
          <div className="section-header text-center">
            <span className="section-tag">KEY CAPABILITIES</span>
            <h2>Everything You Need for Urban Farm Success</h2>
            <p>Built specifically for apartment balconies, raised beds, and urban community gardens.</p>
          </div>

          <div className="features-grid">
            {features.map((f, idx) => (
              <div key={idx} className="feature-card">
                <div className="feature-icon" style={{ background: `${f.color}18`, color: f.color }}>
                  {f.icon}
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
                <Link to={f.link} className="feature-card-link">
                  Learn More <FaArrowRight />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Interactive Preview */}
      <section className="landing-preview-section">
        <div className="landing-container">
          <div className="section-header text-center">
            <span className="section-tag">INTERACTIVE PREVIEW</span>
            <h2>See How UrbanFarm Operates</h2>
          </div>

          <div className="preview-tab-buttons">
            <button
              className={`preview-tab-btn ${activeTab === 'diagnosis' ? 'active' : ''}`}
              onClick={() => setActiveTab('diagnosis')}
            >
              <FaRobot /> AI Leaf Diagnosis
            </button>
            <button
              className={`preview-tab-btn ${activeTab === 'weather' ? 'active' : ''}`}
              onClick={() => setActiveTab('weather')}
            >
              <FaCloudSunRain /> Weather Irrigation
            </button>
            <button
              className={`preview-tab-btn ${activeTab === 'community' ? 'active' : ''}`}
              onClick={() => setActiveTab('community')}
            >
              <FaUsers /> Urban Community
            </button>
          </div>

          <div className="preview-tab-content">
            {activeTab === 'diagnosis' && (
              <div className="preview-card-grid">
                <div>
                  <h3>Snap, Scan, and Cure Plant Illnesses</h3>
                  <p>Upload a photograph of any leaf. Our machine learning diagnostic model scans for over 40 common plant diseases, identifying the root cause and suggesting organic remedies.</p>
                  <ul className="preview-list">
                    <li><FaCheckCircle className="check-icon" /> Identifies Powdery Mildew, Early Blight, Spider Mites</li>
                    <li><FaCheckCircle className="check-icon" /> Organic, non-chemical treatment solutions</li>
                    <li><FaCheckCircle className="check-icon" /> Tracks recovery history over time</li>
                  </ul>
                  <Link to="/register" className="landing-btn landing-btn-primary">Try Diagnostic Tool</Link>
                </div>
                <div className="preview-mock-window">
                  <div className="mock-scan-box">
                    <span className="scan-badge">AI SCAN RESULTS</span>
                    <h4>Tomato Leaf - Early Blight Detected</h4>
                    <div className="confidence-meter">
                      <span>Confidence: 96.4%</span>
                      <div className="meter-bar"><div className="meter-fill" style={{ width: '96.4%' }}></div></div>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Treatment: Remove affected lower leaves. Apply copper fungicide or neem oil solution every 7 days.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'weather' && (
              <div className="preview-card-grid">
                <div>
                  <h3>Smart Weather-Sync Irrigation</h3>
                  <p>Never over-water or under-water again. UrbanFarm connects directly to local microclimate weather stations, skipping watering sessions when rainfall is scheduled.</p>
                  <ul className="preview-list">
                    <li><FaCheckCircle className="check-icon" /> Real-time rainfall & humidity forecast sync</li>
                    <li><FaCheckCircle className="check-icon" /> Customized by plant variety & soil moisture</li>
                    <li><FaCheckCircle className="check-icon" /> Save up to 40% on household water bills</li>
                  </ul>
                  <Link to="/register" className="landing-btn landing-btn-primary">Set Up Smart Schedule</Link>
                </div>
                <div className="preview-mock-window">
                  <div className="mock-weather-box">
                    <div className="weather-header">
                      <FaCloudSunRain style={{ fontSize: '2.5rem', color: '#2980b9' }} />
                      <div>
                        <h4 style={{ margin: 0 }}>Green City Weather</h4>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>24°C — 80% Humidity — Rain Forecasted</span>
                      </div>
                    </div>
                    <div style={{ marginTop: '1rem', padding: '0.8rem', background: 'rgba(41, 128, 185, 0.12)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(41, 128, 185, 0.3)' }}>
                      <strong>Auto-Irrigation Action:</strong>
                      <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem' }}>Watering for 6 plant beds paused today due to incoming 15mm precipitation.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'community' && (
              <div className="preview-card-grid">
                <div>
                  <h3>Join a Thriving Network of City Farmers</h3>
                  <p>Share garden progress, trade heirlooms seeds, ask questions, and learn from local growers who understand your regional urban growing conditions.</p>
                  <ul className="preview-list">
                    <li><FaCheckCircle className="check-icon" /> Q&A forums moderated by experienced agronomists</li>
                    <li><FaCheckCircle className="check-icon" /> Showcase your harvests & balcony bed setups</li>
                    <li><FaCheckCircle className="check-icon" /> Local seed & sapling exchange network</li>
                  </ul>
                  <Link to="/register" className="landing-btn landing-btn-primary">Join Community Free</Link>
                </div>
                <div className="preview-mock-window">
                  <div className="mock-post-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.8rem' }}>
                      <div className="avatar-circle">M</div>
                      <div>
                        <strong>Maya Lin</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Intermediate Grower • 2 hrs ago</div>
                      </div>
                    </div>
                    <h5 style={{ margin: '0 0 0.4rem', fontSize: '0.98rem' }}>Best companion plants for urban balcony peppers?</h5>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      I'm planting habaneros in a 5-gallon container. Should I pair them with basil or marigolds?
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="landing-testimonials-section">
        <div className="landing-container">
          <div className="section-header text-center">
            <span className="section-tag">COMMUNITY TESTIMONIALS</span>
            <h2>Loved by Urban Gardeners Worldwide</h2>
          </div>

          <div className="testimonials-grid">
            {testimonials.map((t, idx) => (
              <div key={idx} className="testimonial-card">
                <FaQuoteLeft className="quote-icon" />
                <p className="testimonial-quote">"{t.quote}"</p>
                <div className="testimonial-rating">
                  {[...Array(t.rating)].map((_, i) => (
                    <FaStar key={i} className="star-icon" />
                  ))}
                </div>
                <div className="testimonial-author">
                  <strong>{t.author}</strong>
                  <span>{t.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="landing-final-cta">
        <div className="landing-container text-center">
          <h2>Ready to Transform Your Urban Space?</h2>
          <p>Start your urban farming journey today with AI leaf diagnostics, smart irrigation schedules, and a vibrant community.</p>
          <div className="cta-btn-wrapper">
            <Link to="/register" className="landing-btn landing-btn-primary btn-large">
              Create Your Free Account <FaArrowRight />
            </Link>
            <Link to="/contact" className="landing-btn landing-btn-secondary btn-large">
              Contact Sales / Support
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

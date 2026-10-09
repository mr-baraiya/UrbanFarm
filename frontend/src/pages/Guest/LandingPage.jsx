import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FaLeaf,
  FaCloudSunRain,
  FaUsers,
  FaSeedling,
  FaArrowRight,
  FaCheckCircle,
  FaQuoteLeft,
  FaStar,
  FaAndroid,
  FaDownload,
  FaPlay,
  FaQrcode,
  FaMobileAlt,
} from 'react-icons/fa';
import { Sparkles, Microscope } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import SEO from '../../components/SEO/SEO';
import './LandingPage.css';

const LandingPage = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('diagnosis');

  const features = [
    {
      icon: <Sparkles size={24} />,
      title: t('landing.plantDiseaseTitle'),
      desc: t('landing.plantDiseaseDesc'),
      link: '/features',
      color: '#27ae60',
    },
    {
      icon: <FaCloudSunRain />,
      title: t('landing.smartIrrigationTitle'),
      desc: t('landing.smartIrrigationDesc'),
      link: '/features',
      color: '#2980b9',
    },
    {
      icon: <FaSeedling />,
      title: t('landing.gardenManagementTitle'),
      desc: t('landing.gardenManagementDesc'),
      link: '/features',
      color: '#8e44ad',
    },
    {
      icon: <FaUsers />,
      title: t('landing.communityTitle'),
      desc: t('landing.communityDesc'),
      link: '/features',
      color: '#d35400',
    },
  ];

  const testimonials = [
    {
      quote: t('landing.testimonial1Quote'),
      author: t('landing.testimonial1Author'),
      role: t('landing.testimonial1Role'),
      rating: 5,
    },
    {
      quote: t('landing.testimonial2Quote'),
      author: t('landing.testimonial2Author'),
      role: t('landing.testimonial2Role'),
      rating: 5,
    },
    {
      quote: t('landing.testimonial3Quote'),
      author: t('landing.testimonial3Author'),
      role: t('landing.testimonial3Role'),
      rating: 5,
    },
  ];

  return (
    <div className="landing-page">
      <SEO
        title="UrbanFarm - AI Powered Smart Urban Agriculture Platform"
        description={t('landing.heroSubtitle', 'Manage your urban garden with AI-powered plant disease detection, weather-based smart watering, and urban crop recommendations.')}
        canonical="https://urbanfarm.baraiyavishalbhai32.workers.dev/"
        keywords="urban farming, AI plant diagnosis, smart watering, garden tracker, plant disease detection, urban crops, balcony farming, organic agriculture"
        lang={i18n.language}
      />
      {/* Hero Section */}
      <section className="landing-hero">
        <div className="hero-container">
          <div className="hero-badge">
            <FaLeaf /> {t('landing.heroHighlight')}
          </div>
          <h1 className="hero-title">
            {t('landing.heroTitle')}
          </h1>
          <p className="hero-subtitle">
            {t('landing.heroSubtitle')}
          </p>
          <div className="hero-cta-group">
            {user ? (
              <>
                <Link to={user.role === 'admin' ? '/admin' : '/app'} className="landing-btn landing-btn-primary">
                  {t('navigation.openDashboard')} <FaArrowRight />
                </Link>
                <Link to="/download" className="landing-btn landing-btn-accent">
                  <FaAndroid /> {t('landing.tryOurAppBtn', 'Try Our App (APK)')}
                </Link>
              </>
            ) : (
              <>
                <Link to="/register" className="landing-btn landing-btn-primary">
                  {t('landing.getStarted')} <FaArrowRight />
                </Link>
                <Link to="/download" className="landing-btn landing-btn-accent">
                  <FaAndroid /> {t('landing.tryOurAppBtn', 'Try Our App (APK)')}
                </Link>
                <Link to="/features" className="landing-btn landing-btn-secondary">
                  {t('landing.exploreFeatures')}
                </Link>
              </>
            )}
          </div>

          <div className="hero-highlights-row">
            <span><FaCheckCircle className="check-icon" /> {t('landing.statsPlants')}</span>
            <span><FaCheckCircle className="check-icon" /> {t('landing.statsAccuracy')}</span>
            <span><FaCheckCircle className="check-icon" /> {t('landing.statsWaterSaved')}</span>
          </div>
        </div>
      </section>

      {/* Project Introduction */}
      <section className="landing-intro-section">
        <div className="landing-container intro-grid">
          <div className="intro-content">
            <span className="section-tag">{t('landing.whyTag')}</span>
            <h2>{t('landing.whyTitle')}</h2>
            <p>{t('landing.whyDesc')}</p>
            <ul className="intro-list">
              <li><FaCheckCircle className="check-icon" /> {t('landing.whyItem1')}</li>
              <li><FaCheckCircle className="check-icon" /> {t('landing.whyItem2')}</li>
              <li><FaCheckCircle className="check-icon" /> {t('landing.whyItem3')}</li>
            </ul>
            <Link to="/about" className="landing-btn landing-btn-outline">
              {t('landing.readStory')} <FaArrowRight />
            </Link>
          </div>
          <div className="intro-visual-card">
            <div className="visual-header">
              <div className="visual-dot red"></div>
              <div className="visual-dot yellow"></div>
              <div className="visual-dot green"></div>
              <span>{t('landing.smartCareEngine')}</span>
            </div>
            <div className="visual-body">
              <div className="smart-status-item">
                <FaCloudSunRain className="item-icon blue" />
                <div>
                  <strong>{t('landing.widgetWeatherTitle')}</strong>
                  <p>{t('landing.widgetWeatherDesc')}</p>
                </div>
              </div>
              <div className="smart-status-item">
                <Sparkles size={20} className="item-icon green" />
                <div>
                  <strong>{t('landing.widgetAiTitle')}</strong>
                  <p>{t('landing.widgetAiDesc')}</p>
                </div>
              </div>
              <div className="smart-status-item">
                <FaSeedling className="item-icon purple" />
                <div>
                  <strong>{t('landing.widgetGrowthTitle')}</strong>
                  <p>{t('landing.widgetGrowthDesc')}</p>
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
            <span className="section-tag">{t('landing.keyCapabilitiesTag')}</span>
            <h2>{t('landing.featureTitle')}</h2>
            <p>{t('landing.featureSubtitle')}</p>
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
                  {t('common.viewDetails')} <FaArrowRight />
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
            <span className="section-tag">{t('landing.previewTag')}</span>
            <h2>{t('landing.previewTitle')}</h2>
          </div>

          <div className="preview-tab-buttons">
            <button
              className={`preview-tab-btn ${activeTab === 'diagnosis' ? 'active' : ''}`}
              onClick={() => setActiveTab('diagnosis')}
            >
              <Sparkles size={16} style={{ marginRight: 6 }} /> {t('landing.plantDiseaseTitle')}
            </button>
            <button
              className={`preview-tab-btn ${activeTab === 'weather' ? 'active' : ''}`}
              onClick={() => setActiveTab('weather')}
            >
              <FaCloudSunRain /> {t('landing.smartIrrigationTitle')}
            </button>
            <button
              className={`preview-tab-btn ${activeTab === 'community' ? 'active' : ''}`}
              onClick={() => setActiveTab('community')}
            >
              <FaUsers /> {t('landing.communityTitle')}
            </button>
          </div>

          <div className="preview-tab-content">
            {activeTab === 'diagnosis' && (
              <div className="preview-card-grid">
                <div>
                  <h3>{t('landing.previewDiagH3')}</h3>
                  <p>{t('landing.previewDiagP')}</p>
                  <ul className="preview-list">
                    <li><FaCheckCircle className="check-icon" /> {t('landing.previewDiagItem1')}</li>
                    <li><FaCheckCircle className="check-icon" /> {t('landing.previewDiagItem2')}</li>
                    <li><FaCheckCircle className="check-icon" /> {t('landing.previewDiagItem3')}</li>
                  </ul>
                  <Link to="/register" className="landing-btn landing-btn-primary">{t('landing.previewDiagBtn')}</Link>
                </div>
                <div className="preview-mock-window">
                  <div className="mock-scan-box">
                    <span className="scan-badge">{t('landing.previewDiagBadge')}</span>
                    <h4>{t('landing.previewDiagMockTitle')}</h4>
                    <div className="confidence-meter">
                      <span>{t('landing.previewDiagConfidence')}</span>
                      <div className="meter-bar"><div className="meter-fill" style={{ width: '96.4%' }}></div></div>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {t('landing.previewDiagTreatment')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'weather' && (
              <div className="preview-card-grid">
                <div>
                  <h3>{t('landing.previewWeatherH3')}</h3>
                  <p>{t('landing.previewWeatherP')}</p>
                  <ul className="preview-list">
                    <li><FaCheckCircle className="check-icon" /> {t('landing.previewWeatherItem1')}</li>
                    <li><FaCheckCircle className="check-icon" /> {t('landing.previewWeatherItem2')}</li>
                    <li><FaCheckCircle className="check-icon" /> {t('landing.previewWeatherItem3')}</li>
                  </ul>
                  <Link to="/register" className="landing-btn landing-btn-primary">{t('landing.previewWeatherBtn')}</Link>
                </div>
                <div className="preview-mock-window">
                  <div className="mock-weather-box">
                    <div className="weather-header">
                      <FaCloudSunRain style={{ fontSize: '2.5rem', color: '#2980b9' }} />
                      <div>
                        <h4 style={{ margin: 0 }}>{t('landing.previewWeatherMockHeader')}</h4>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t('landing.previewWeatherMockSub')}</span>
                      </div>
                    </div>
                    <div style={{ marginTop: '1rem', padding: '0.8rem', background: 'rgba(41, 128, 185, 0.12)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(41, 128, 185, 0.3)' }}>
                      <strong>{t('landing.previewWeatherAction')}</strong>
                      <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem' }}>{t('landing.previewWeatherActionDesc')}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'community' && (
              <div className="preview-card-grid">
                <div>
                  <h3>{t('landing.previewCommH3')}</h3>
                  <p>{t('landing.previewCommP')}</p>
                  <ul className="preview-list">
                    <li><FaCheckCircle className="check-icon" /> {t('landing.previewCommItem1')}</li>
                    <li><FaCheckCircle className="check-icon" /> {t('landing.previewCommItem2')}</li>
                    <li><FaCheckCircle className="check-icon" /> {t('landing.previewCommItem3')}</li>
                  </ul>
                  <Link to="/register" className="landing-btn landing-btn-primary">{t('landing.previewCommBtn')}</Link>
                </div>
                <div className="preview-mock-window">
                  <div className="mock-post-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.8rem' }}>
                      <div className="avatar-circle">M</div>
                      <div>
                        <strong>Maya Lin</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Agronomist • 2 hrs ago</div>
                      </div>
                    </div>
                    <h5 style={{ margin: '0 0 0.4rem', fontSize: '0.98rem' }}>{t('landing.previewCommH3')}</h5>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {t('landing.previewCommP')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Dedicated Mobile App Download Showcase Section */}
      <section className="landing-app-promo-section">
        <div className="landing-container">
          <div className="app-promo-card">
            <div className="app-promo-grid">
              <div className="app-promo-content">
                <span className="section-tag app-tag">
                  <FaAndroid className="android-icon" /> {t('landing.appPromoTag', 'OFFICIAL ANDROID APP')}
                </span>
                <h2 className="app-promo-title">
                  {t('landing.appPromoTitle', 'Take UrbanFarm Everywhere — Try Our Mobile App')}
                </h2>
                <p className="app-promo-sub">
                  {t('landing.appPromoSub', 'Diagnose sick plant leaves right in the garden with camera AI, connect IoT soil sensors, and check daily mandi prices on the go.')}
                </p>

                <ul className="app-promo-features">
                  <li>
                    <FaCheckCircle className="check-icon" />
                    <span>{t('landing.appPromoFeat1', 'Instant Camera AI Leaf Diagnosis with Organic Remedies')}</span>
                  </li>
                  <li>
                    <FaCheckCircle className="check-icon" />
                    <span>{t('landing.appPromoFeat2', 'Offline Garden & Field Tracking Mode')}</span>
                  </li>
                  <li>
                    <FaCheckCircle className="check-icon" />
                    <span>{t('landing.appPromoFeat3', 'Live APMC Mandi Rates & Weather Telemetry')}</span>
                  </li>
                </ul>

                <div className="app-promo-btn-group">
                  <Link to="/download" className="landing-btn landing-btn-primary">
                    <FaDownload /> {t('landing.appPromoBtn', 'Download Android APK')}
                  </Link>
                  <Link to="/download#how-to-use" className="landing-btn landing-btn-secondary">
                    <FaPlay /> {t('landing.appPromoVideoBtn', 'Watch Video Tutorial')}
                  </Link>
                </div>

                <div className="app-promo-badge-info">
                  <span className="app-size-badge">{t('landing.appPromoSizeBadge', 'v1.0.0 • ~55.5 MB • 100% Free')}</span>
                </div>
              </div>

              <div className="app-promo-visual">
                <div className="app-phone-mockup">
                  <div className="phone-screen">
                    <div className="phone-top-bar">
                      <span className="phone-camera-dot"></span>
                      <span className="phone-time">10:00</span>
                      <FaAndroid className="phone-brand" />
                    </div>
                    <div className="phone-content-preview">
                      <div className="phone-app-header">
                        <FaLeaf className="leaf-icon" />
                        <strong>UrbanFarm Mobile</strong>
                      </div>
                      <div className="phone-scanner-box">
                        <div className="scanner-target">
                          <Microscope size={28} className="scanner-icon" />
                          <span>AI Leaf Scanner</span>
                        </div>
                        <div className="scanner-laser"></div>
                      </div>
                      <div className="phone-quick-stats">
                        <div className="p-stat">
                          <small>Scan Match</small>
                          <strong>98.4%</strong>
                        </div>
                        <div className="p-stat">
                          <small>Remedy</small>
                          <strong className="green-text">Organic</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* QR Floating Badge */}
                  <Link to="/download" className="phone-qr-badge" title="Scan or Click to Download APK">
                    <FaQrcode className="qr-badge-icon" />
                    <div className="qr-badge-text">
                      <small>Instant Scan</small>
                      <strong>Get APK</strong>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="landing-testimonials-section">
        <div className="landing-container">
          <div className="section-header text-center">
            <span className="section-tag">{t('landing.testimonialsTag')}</span>
            <h2>{t('landing.testimonialsTitle')}</h2>
          </div>

          <div className="testimonials-grid">
            {testimonials.map((tItem, idx) => (
              <div key={idx} className="testimonial-card">
                <FaQuoteLeft className="quote-icon" />
                <p className="testimonial-quote">"{tItem.quote}"</p>
                <div className="testimonial-rating">
                  {[...Array(tItem.rating)].map((_, i) => (
                    <FaStar key={i} className="star-icon" />
                  ))}
                </div>
                <div className="testimonial-author">
                  <strong>{tItem.author}</strong>
                  <span>{tItem.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="landing-final-cta">
        <div className="landing-container text-center">
          <h2>{t('landing.ctaTitle')}</h2>
          <p>{t('landing.ctaSubtitle')}</p>
          <div className="cta-btn-wrapper">
            <Link to="/register" className="landing-btn landing-btn-primary btn-large">
              {t('landing.joinNow')} <FaArrowRight />
            </Link>
            <Link to="/contact" className="landing-btn landing-btn-secondary btn-large">
              {t('navigation.contact')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

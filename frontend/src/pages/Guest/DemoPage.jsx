import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FaMicroscope,
  FaCheckCircle,
  FaExclamationTriangle,
  FaShieldAlt,
  FaLeaf,
  FaArrowRight,
  FaInfoCircle,
  FaCheck,
  FaShareAlt,
  FaFlask,
} from 'react-icons/fa';
import SEO from '../../components/SEO/SEO';
import './DemoPage.css';

const DemoPage = () => {
  const { t } = useTranslation();
  const L = t('demoPage', { returnObjects: true }) || {};
  const sampleReports = Array.isArray(L.sampleReports) ? L.sampleReports : [];

  const [searchParams, setSearchParams] = useSearchParams();
  const sampleParam = searchParams.get('sample');

  const [selectedReportIndex, setSelectedReportIndex] = useState(() => {
    if (!sampleParam || !sampleReports.length) return 0;
    const foundIdx = sampleReports.findIndex(
      (r, idx) => r.id === sampleParam || String(idx + 1) === sampleParam
    );
    return foundIdx >= 0 ? foundIdx : 0;
  });

  const [reportSubTab, setReportSubTab] = useState('symptoms');
  const [copied, setCopied] = useState(false);

  // Sync URL query when user changes report
  const handleSelectReport = (idx) => {
    setSelectedReportIndex(idx);
    const rep = sampleReports[idx];
    if (rep) {
      setSearchParams({ sample: rep.id }, { replace: true });
    }
  };

  const activeReport = sampleReports[selectedReportIndex] || sampleReports[0] || {
    id: 'report-1',
    status: 'warning',
    confidence: 97.4,
    image: '/demo/tomato_blight.jpg',
    detectionTime: '1.2s',
    cropName: 'Tomato',
    variety: 'Roma',
    condition: 'Early Blight',
    statusText: 'Disease Detected',
    organ: 'Leaves',
    severity: 'Moderate',
    symptoms: [],
    organicTreatments: [],
    chemicalTreatments: [],
    prevention: [],
    stats: []
  };

  const handleShareOrCopy = async () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://urbanfarm.app';
    const liveUrl = `${origin}/live-preview?sample=${activeReport.id}`;
    const shareTitle = `UrbanFarm AI Diagnosis: ${activeReport.cropName} - ${activeReport.condition}`;
    const shareText = `🌱 Plant: ${activeReport.cropName} (${activeReport.variety})\n🔍 Diagnosis: ${activeReport.condition} (${activeReport.confidence}% AI Match)\n⚠️ Severity: ${activeReport.severity}\n📋 Full Interactive Diagnosis & Organic Remedies:\n${liveUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: liveUrl
        });
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }

    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(shareText);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2400);
  };

  return (
    <div className="demo-page">
      <SEO
        title="Interactive Live Preview - Plant Diagnosis & Treatment | UrbanFarm"
        description="Experience UrbanFarm's interactive live preview in English, Hindi, and Gujarati."
      />

      {/* Hero Header Banner */}
      <section className="demo-hero">
        <div className="demo-hero-container text-center">
          <div className="demo-section-tag">
            <FaLeaf /> {L.heroTag}
          </div>
          <h1 className="demo-hero-title">
            {L.heroTitle} <span className="demo-gradient-text">{L.heroTitleGrad}</span>
          </h1>
          <p className="demo-hero-subtitle">{L.heroSub}</p>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="demo-content-section">
        <div className="demo-container">

          {/* AI DIAGNOSIS REPORT DEMO CARD */}
          <div className="demo-report-card">
            
            {/* Card Header */}
            <div className="demo-card-header">
              <div className="demo-badge-pill">
                <FaMicroscope /> {activeReport.cropName}
              </div>
              <h2 className="demo-card-title">{activeReport.condition}</h2>
            </div>

            {/* Sample Selector Pills */}
            <div className="demo-sample-bar">
              <span className="demo-sample-label">{L.sampleScanLabel}</span>
              <div className="demo-sample-pills">
                {sampleReports.map((rep, idx) => {
                  const isActive = selectedReportIndex === idx;
                  return (
                    <button
                      key={rep.id || idx}
                      className={`demo-sample-pill ${isActive ? 'active' : ''}`}
                      onClick={() => handleSelectReport(idx)}
                    >
                      <span
                        className="demo-pill-indicator"
                        style={{ backgroundColor: rep.status === 'healthy' ? '#27ae60' : '#e67e22' }}
                      />
                      <div className="demo-pill-text">
                        <span className="demo-pill-name">{rep.cropName}</span>
                        <span className="demo-pill-status">({rep.condition})</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Report Grid */}
            <div className="demo-report-grid">
              
              {/* Left Column: Image & Confidence Stats */}
              <div className="demo-col-media">
                <div className="demo-image-frame">
                  <img
                    src={activeReport.image}
                    alt={activeReport.cropName}
                    className="demo-crop-photo"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a81?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  <div className="demo-image-overlay">
                    <FaMicroscope /> Instant Vision Scan
                  </div>
                </div>

                {/* Quick Metric Stats */}
                <div className="demo-metric-cards">
                  <div className="demo-metric-card">
                    <span className="dmc-label">{L.scanSpeed}</span>
                    <strong className="dmc-value">{activeReport.detectionTime}</strong>
                  </div>
                  <div className="demo-metric-card">
                    <span className="dmc-label">{L.severityLevel}</span>
                    <strong className={`dmc-value ${activeReport.status === 'healthy' ? 'healthy' : 'warning'}`}>
                      {activeReport.severity}
                    </strong>
                  </div>
                  <div className="demo-metric-card">
                    <span className="dmc-label">{L.aiMatch}</span>
                    <strong className="dmc-value accent">{activeReport.confidence}%</strong>
                  </div>
                </div>

                {/* Additional Diagnostic Metrics */}
                <div className="demo-diagnostic-params">
                  {(activeReport.stats || []).map((st, sIdx) => (
                    <div key={sIdx} className="demo-param-row">
                      <span className="param-name">{st.label}:</span>
                      <span className="param-value">{st.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Diagnosis Details & Tabs */}
              <div className="demo-col-details">
                
                {/* Status Banner */}
                <div className={`demo-status-banner ${activeReport.status === 'healthy' ? 'healthy' : 'warning'}`}>
                  {activeReport.status === 'healthy' ? (
                    <FaCheckCircle className="status-icon healthy" />
                  ) : (
                    <FaExclamationTriangle className="status-icon warning" />
                  )}
                  <div className="status-text-block">
                    <h3 className="status-heading">{activeReport.statusText}</h3>
                    <p className="status-sub">
                      <strong>{activeReport.cropName}</strong> • {activeReport.variety} ({activeReport.organ})
                    </p>
                  </div>
                </div>

                {/* Tab Controls */}
                <div className="demo-tab-nav">
                  <button
                    className={`demo-tab-btn ${reportSubTab === 'symptoms' ? 'active' : ''}`}
                    onClick={() => setReportSubTab('symptoms')}
                  >
                    <FaInfoCircle /> {L.symptomsTab}
                  </button>
                  <button
                    className={`demo-tab-btn ${reportSubTab === 'organic' ? 'active' : ''}`}
                    onClick={() => setReportSubTab('organic')}
                  >
                    <FaLeaf /> {L.organicTab}
                  </button>
                  <button
                    className={`demo-tab-btn ${reportSubTab === 'chemical' ? 'active' : ''}`}
                    onClick={() => setReportSubTab('chemical')}
                  >
                    <FaFlask /> {L.chemicalTab}
                  </button>
                  <button
                    className={`demo-tab-btn ${reportSubTab === 'prevention' ? 'active' : ''}`}
                    onClick={() => setReportSubTab('prevention')}
                  >
                    <FaShieldAlt /> {L.preventionTab}
                  </button>
                </div>

                {/* Active Tab Panel */}
                <div className="demo-tab-panel">
                  {reportSubTab === 'symptoms' && (
                    <div className="tab-pane">
                      <h4 className="tab-pane-title">{L.symptomsHeading}</h4>
                      <ul className="demo-check-list">
                        {(activeReport.symptoms || []).map((s, idx) => (
                          <li key={idx}>
                            <FaCheck className="check-icon" />
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {reportSubTab === 'organic' && (
                    <div className="tab-pane">
                      <h4 className="tab-pane-title">{L.organicHeading}</h4>
                      <ul className="demo-check-list">
                        {(activeReport.organicTreatments || []).map((s, idx) => (
                          <li key={idx}>
                            <FaLeaf className="check-icon organic" />
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {reportSubTab === 'chemical' && (
                    <div className="tab-pane">
                      <h4 className="tab-pane-title">{L.chemicalHeading}</h4>
                      <ul className="demo-check-list">
                        {(activeReport.chemicalTreatments || []).map((s, idx) => (
                          <li key={idx}>
                            <FaFlask className="check-icon chemical" />
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {reportSubTab === 'prevention' && (
                    <div className="tab-pane">
                      <h4 className="tab-pane-title">{L.preventionHeading}</h4>
                      <ul className="demo-check-list">
                        {(activeReport.prevention || []).map((s, idx) => (
                          <li key={idx}>
                            <FaShieldAlt className="check-icon prevention" />
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Bottom Action Buttons */}
                <div className="demo-card-actions">
                  <Link to="/register" className="guest-btn guest-btn-primary">
                    <FaMicroscope /> {L.diagnoseBtn}
                  </Link>
                  <button
                    className="guest-btn guest-btn-outline"
                    onClick={handleShareOrCopy}
                  >
                    <FaShareAlt /> {copied ? L.copiedText : L.shareBtn}
                  </button>
                </div>

              </div>
            </div>
          </div>

          {/* Highlights Grid */}
          <div className="demo-highlights-row">
            <div className="demo-highlight-card">
              <div className="dh-icon-box">
                <FaMicroscope />
              </div>
              <h3 className="dh-title">{L.hl1Title}</h3>
              <p className="dh-desc">{L.hl1Sub}</p>
            </div>

            <div className="demo-highlight-card">
              <div className="dh-icon-box">
                <FaLeaf />
              </div>
              <h3 className="dh-title">{L.hl2Title}</h3>
              <p className="dh-desc">{L.hl2Sub}</p>
            </div>

            <div className="demo-highlight-card">
              <div className="dh-icon-box">
                <FaShieldAlt />
              </div>
              <h3 className="dh-title">{L.hl3Title}</h3>
              <p className="dh-desc">{L.hl3Sub}</p>
            </div>
          </div>

        </div>
      </section>

      {/* Above Footer Impact CTA Banner */}
      <section className="about-impact-banner">
        <div className="landing-container text-center">
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

export default DemoPage;

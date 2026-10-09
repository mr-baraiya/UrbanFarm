import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FaAndroid,
  FaDownload,
  FaPlay,
  FaPause,
  FaVolumeMute,
  FaVolumeUp,
  FaExpand,
  FaRedo,
  FaShieldAlt,
  FaMobileAlt,
  FaCheckCircle,
  FaInfoCircle,
  FaQuestionCircle,
  FaQrcode,
  FaLeaf,
  FaArrowRight,
  FaCopy,
  FaCheck,
  FaExternalLinkAlt,
  FaMicroscope,
  FaCloudSun,
  FaChartLine,
  FaBell,
  FaWifi,
  FaChevronDown,
  FaChevronUp,
  FaHdd,
  FaCodeBranch,
  FaClock,
} from 'react-icons/fa';
import {
  Sparkles,
  Microscope,
  Languages,
  Volume2,
  Sprout,
  BellRing,
  FileDown,
} from 'lucide-react';
import SEO from '../../components/SEO/SEO';
import './DownloadPage.css';

const DEFAULT_APK_URL = 'https://github.com/mr-baraiya/UrbanFarm/releases/download/v1.0.0/Vaidha.apk';

const DownloadPage = () => {
  const { t, i18n } = useTranslation();
  const D = t('downloadPage', { returnObjects: true }) || {};

  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [activeStep, setActiveStep] = useState(0);

  // Video playback controls
  const handleTogglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleToggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleRestartVideo = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
  };

  const handleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    } else if (videoRef.current.webkitRequestFullscreen) {
      videoRef.current.webkitRequestFullscreen();
    }
  };

  const handleCopyDownloadLink = async () => {
    const linkToCopy = DEFAULT_APK_URL;
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(linkToCopy);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const toggleFaq = (idx) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  const qrTargetUrl = DEFAULT_APK_URL;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    qrTargetUrl
  )}&color=1f3a30&bgcolor=f6fff8&margin=1`;

  const installSteps = Array.isArray(D.steps)
    ? D.steps
    : [
        {
          num: '01',
          title: 'Download APK',
          desc: 'Click the "Download APK" button to save the installation file directly onto your Android device.',
          tip: 'File size is ~55.5 MB and takes just a few seconds.',
        },
        {
          num: '02',
          title: 'Allow Unknown Sources',
          desc: 'When prompted by your browser or Android OS, tap Settings and toggle "Allow from this source".',
          tip: 'Standard Android security prompt for direct APK installations.',
        },
        {
          num: '03',
          title: 'Install & Launch',
          desc: 'Tap "Install" on the package installer window. Once installed, tap "Open" to launch UrbanFarm.',
          tip: 'No root access or complex permissions required.',
        },
        {
          num: '04',
          title: 'Scan, Grow & Track',
          desc: 'Sign in or explore as a guest. Start scanning crops, monitoring soil moisture, and checking mandi prices!',
          tip: 'Works seamlessly online and in offline mode.',
        },
      ];

  const lucideFeatureIcons = [
    <Microscope key="f1" size={26} strokeWidth={2.2} />,
    <Languages key="f2" size={26} strokeWidth={2.2} />,
    <Volume2 key="f3" size={26} strokeWidth={2.2} />,
    <Sprout key="f4" size={26} strokeWidth={2.2} />,
    <BellRing key="f5" size={26} strokeWidth={2.2} />,
    <FileDown key="f6" size={26} strokeWidth={2.2} />,
  ];

  const rawFeatures = Array.isArray(D.features)
    ? D.features
    : [
        {
          title: 'Instant AI Plant Doctor',
          desc: 'Scan diseased leaves with your phone camera for instant diagnosis and eco-friendly remedies.',
        },
        {
          title: 'Available in Multiple Languages',
          desc: 'Seamlessly switch between English, ગુજરાતી, and हिन्दी for an effortless, native farming experience.',
        },
        {
          title: 'Voice-Based Audio Reports',
          desc: 'Listen to AI crop disease diagnosis and organic remedy recommendations in clear spoken audio.',
        },
        {
          title: 'Garden & Plant Care Logs',
          desc: 'Schedule fertilization, harvest dates, and track crop growth milestones.',
        },
        {
          title: 'Instant Push Notifications',
          desc: 'Timely reminders for watering, frost warnings, and community answers.',
        },
        {
          title: 'Download PDF Diagnosis Reports',
          desc: 'Export and save comprehensive plant health reports, organic treatment prescriptions, and crop analytics as printable PDF files.',
        },
      ];

  const appFeatures = rawFeatures.map((feat, idx) => ({
    ...feat,
    icon: lucideFeatureIcons[idx % lucideFeatureIcons.length],
  }));

  const faqs = Array.isArray(D.faqs)
    ? D.faqs
    : [
        {
          q: 'Is it safe to download and install this APK?',
          a: 'Yes, absolutely! The UrbanFarm APK is built directly from our open-source verified codebase and contains zero ads, spyware, or malware. It passes all standard Android integrity checks.',
        },
        {
          q: 'Why does Android show "File might be harmful" or "Unknown Sources"?',
          a: 'Android displays this warning by default for any app downloaded outside the Google Play Store. Simply tap "Download anyway" and enable "Allow from this source" in your settings to proceed.',
        },
        {
          q: 'What are the minimum system requirements?',
          a: 'UrbanFarm requires Android 8.0 (Oreo) or later, a minimum of 2GB RAM, and ~100MB of free storage. A functioning camera is recommended for AI plant leaf scanning.',
        },
        {
          q: 'How do I update the app when a new release is published?',
          a: 'You can visit this download page at any time to download the latest APK, or click update notifications inside the mobile app. Installing over an existing version preserves all your data.',
        },
        {
          q: 'Can I use the app without an active internet connection?',
          a: 'Yes! Core features such as saved plant profiles, offline diagnosis guides, care calendars, and garden notes work completely offline.',
        },
      ];

  return (
    <div className="download-page">
      <SEO
        title={D.metaTitle || 'Download UrbanFarm Android Mobile App - APK Direct Download'}
        description={
          D.metaDesc ||
          'Download the official UrbanFarm Android APK. Real-time AI crop disease detection, smart IoT watering, live mandi market prices, and urban gardening guidance on your mobile device.'
        }
        lang={i18n.language}
      />

      {/* HERO SECTION */}
      <section className="dl-hero">
        <div className="dl-hero-container">
          <div className="dl-hero-grid">
            {/* Left Column: Headline & Action Buttons */}
            <div className="dl-hero-content">
              <div className="dl-hero-tag">
                <FaAndroid className="tag-android-icon" />
                <span>{D.heroTag || 'OFFICIAL ANDROID RELEASE'}</span>
                <span className="version-pill">v1.0.0</span>
              </div>

              <h1 className="dl-hero-title">
                {D.heroTitlePrefix || 'Smart Urban Farming'} <br />
                <span className="dl-gradient-text">{D.heroTitleHighlight || 'In Your Pocket'}</span>
              </h1>

              <p className="dl-hero-subtitle">
                {D.heroSubtitle ||
                  'Diagnose crop diseases instantly with AI, monitor IoT soil sensors, check real-time mandi prices, and get tailored urban farming advice anywhere, anytime.'}
              </p>

              {/* Main CTA Action Buttons */}
              <div className="dl-cta-group">
                <a
                  href={DEFAULT_APK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="dl-btn dl-btn-primary"
                  id="btn-download-apk-hero"
                >
                  <FaDownload className="dl-btn-icon pulse" />
                  <div className="dl-btn-text">
                    <span className="dl-btn-main">{D.downloadBtn || 'Download APK (v1.0.0)'}</span>
                    <span className="dl-btn-sub">{D.fileSizeBadge || 'Direct Download • ~55.5 MB'}</span>
                  </div>
                </a>

                <a
                  href="#how-to-use"
                  className="dl-btn dl-btn-secondary"
                  id="btn-watch-video"
                >
                  <FaPlay /> {D.watchGuideBtn || 'Watch Video Guide'}
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="dl-trust-row">
                <div className="dl-trust-item">
                  <FaShieldAlt className="trust-icon safe" />
                  <span>{D.trustVerified || '100% Virus-Free & Safe'}</span>
                </div>
                <div className="dl-trust-item">
                  <FaCheckCircle className="trust-icon" />
                  <span>{D.trustAndroid || 'Android 8.0 & Above'}</span>
                </div>
                <div className="dl-trust-item">
                  <FaLeaf className="trust-icon" />
                  <span>{D.trustFree || '100% Free & Open'}</span>
                </div>
              </div>
            </div>

            {/* Right Column: QR Code & Mobile Scan Card */}
            <div className="dl-hero-media">
              <div className="dl-qr-card">
                <div className="dl-qr-card-glow" />
                <div className="dl-qr-header">
                  <div className="dl-qr-icon-wrap">
                    <FaQrcode />
                  </div>
                  <div>
                    <h3 className="dl-qr-title">{D.qrTitle || 'Scan with Smartphone'}</h3>
                    <p className="dl-qr-sub">{D.qrSubtitle || 'Instant download on mobile device'}</p>
                  </div>
                </div>

                <div className="dl-qr-frame">
                  <img
                    src={qrCodeUrl}
                    alt="Scan QR Code to download UrbanFarm APK"
                    className="dl-qr-image"
                    loading="lazy"
                  />
                  <div className="dl-qr-overlay">
                    <FaAndroid />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VIDEO WALKTHROUGH & INSTALLATION GUIDE SECTION */}
      <section id="how-to-use" className="dl-section dl-video-section">
        <div className="dl-container">
          <div className="dl-section-header text-center">
            <div className="dl-pill-tag">
              <FaPlay /> {D.videoTag || 'STEP-BY-STEP TUTORIAL'}
            </div>
            <h2 className="dl-section-title">
              {D.videoHeadingPrefix || 'How to Install &'} <span className="dl-gradient-text">{D.videoHeadingHighlight || 'Use UrbanFarm'}</span>
            </h2>
            <p className="dl-section-subtitle">
              {D.videoSub ||
                'Watch our quick interactive video guide to learn how to install the APK and get started with smart plant management in minutes.'}
            </p>
          </div>

          <div className="dl-video-layout">
            {/* Left: Video Player */}
            <div className="dl-player-card">
              <div className="dl-video-wrapper">
                <video
                  ref={videoRef}
                  src="/how_to_use_app.mp4"
                  className="dl-video-element"
                  playsInline
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                  controls
                />

                {/* Custom Overlay Controls */}
                <div className="dl-custom-controls">
                  <button
                    type="button"
                    className="dl-control-btn main-play"
                    onClick={handleTogglePlay}
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <FaPause /> : <FaPlay />}
                  </button>
                  <button
                    type="button"
                    className="dl-control-btn"
                    onClick={handleToggleMute}
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                  </button>
                  <button
                    type="button"
                    className="dl-control-btn"
                    onClick={handleRestartVideo}
                    aria-label="Restart Video"
                  >
                    <FaRedo />
                  </button>
                  <button
                    type="button"
                    className="dl-control-btn"
                    onClick={handleFullscreen}
                    aria-label="Fullscreen"
                  >
                    <FaExpand />
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Step by Step Interactive Installation Timeline */}
            <div className="dl-steps-card">
              <h3 className="dl-steps-title">
                <FaInfoCircle className="steps-icon" /> {D.stepsHeading || '4 Easy Installation Steps'}
              </h3>
              <div className="dl-steps-list">
                {installSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className={`dl-step-item ${activeStep === idx ? 'active' : ''}`}
                    onClick={() => setActiveStep(idx)}
                  >
                    <div className="dl-step-number">{step.num}</div>
                    <div className="dl-step-body">
                      <h4 className="dl-step-head">{step.title}</h4>
                      <p className="dl-step-desc">{step.desc}</p>
                      {step.tip && (
                        <div className="dl-step-tip">
                          <strong>{D.tipPrefix || 'Tip:'}</strong> {step.tip}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="dl-steps-action">
                <a
                  href={DEFAULT_APK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="dl-btn dl-btn-primary full-width"
                >
                  <FaDownload /> {D.startDownloadNow || 'Start Download Now'}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE MOBILE APP FEATURES */}
      <section className="dl-section dl-features-section">
        <div className="dl-container">
          <div className="dl-section-header text-center">
            <div className="dl-pill-tag">
              <FaMobileAlt /> {D.featuresTag || 'DESIGNED FOR GROWERS'}
            </div>
            <h2 className="dl-section-title">
              {D.featuresHeadingPrefix || 'Powerful Features on'} <span className="dl-gradient-text">{D.featuresHeadingHighlight || 'Every Android Device'}</span>
            </h2>
            <p className="dl-section-subtitle">
              {D.featuresSub ||
                'Everything you need to monitor, heal, and optimize your urban plants from seed to harvest in one lightweight mobile app.'}
            </p>
          </div>

          <div className="dl-features-grid">
            {appFeatures.map((feat, idx) => (
              <div key={idx} className="dl-feature-card">
                <div className="dl-feature-icon-box">{feat.icon}</div>
                <h3 className="dl-feature-title">{feat.title}</h3>
                <p className="dl-feature-desc">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="dl-section dl-faq-section">
        <div className="dl-container">
          <div className="dl-section-header text-center">
            <div className="dl-pill-tag">
              <FaQuestionCircle /> {D.faqTag || 'FREQUENTLY ASKED QUESTIONS'}
            </div>
            <h2 className="dl-section-title">
              {D.faqHeadingPrefix || 'Got Questions About'} <span className="dl-gradient-text">{D.faqHeadingHighlight || 'Mobile Installation?'}</span>
            </h2>
            <p className="dl-section-subtitle">
              {D.faqSub || 'Everything you need to know about installing, permissions, updates, and safety.'}
            </p>
          </div>

          <div className="dl-faq-accordion">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div key={idx} className={`dl-faq-card ${isOpen ? 'open' : ''}`}>
                  <button
                    type="button"
                    className="dl-faq-question"
                    onClick={() => toggleFaq(idx)}
                    aria-expanded={isOpen}
                  >
                    <span className="faq-q-text">{faq.q}</span>
                    <span className="faq-toggle-icon">
                      {isOpen ? <FaChevronUp /> : <FaChevronDown />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="dl-faq-answer">
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* BOTTOM IMPACT CTA BANNER */}
      <section className="dl-bottom-cta">
        <div className="dl-container text-center">
          <div className="dl-cta-inner">
            <div className="dl-cta-tag">
              <FaLeaf /> {D.bottomTag || 'READY TO TRANSFORM YOUR HARVEST?'}
            </div>
            <h2 className="dl-cta-title">
              {D.bottomTitle || 'Download UrbanFarm Today & Grow Smarter'}
            </h2>
            <p className="dl-cta-sub">
              {D.bottomSub ||
                'Join hundreds of urban gardeners diagnosing crops, saving water, and growing healthier food with AI.'}
            </p>
            <div className="dl-bottom-btn-row">
              <a
                href={DEFAULT_APK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="dl-btn dl-btn-primary"
              >
                <FaDownload /> {D.downloadApkNow || 'Download APK (v1.0.0)'}
              </a>
              <Link to="/live-preview" className="dl-btn dl-btn-secondary">
                {D.tryLivePreview || 'Try Web Live Preview'} <FaArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DownloadPage;

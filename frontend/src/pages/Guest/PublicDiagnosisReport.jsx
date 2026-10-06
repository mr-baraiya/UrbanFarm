import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getPublicDiagnosis, translateDiagnosisApi } from '../../services/plantService';
import { useNotification } from '../../hooks/useNotification';
import SEO from '../../components/SEO/SEO';
import GuestNavbar from '../../components/Guest/GuestNavbar';
import GuestFooter from '../../components/Guest/GuestFooter';
import Layout from '../../components/Layout/Layout';
import { useAuth } from '../../hooks/useAuth';
import './PublicDiagnosisReport.css';

const PublicDiagnosisReport = () => {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { addNotification } = useNotification();

  const [diagnosis, setDiagnosis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentLang, setCurrentLang] = useState(i18n.language || 'en');
  const [translationCache, setTranslationCache] = useState({});
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    fetchReport();
  }, [id]);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPublicDiagnosis(id);
      setDiagnosis(data);
      const initial = {
        diseaseName: data.diseaseName,
        description: data.description,
        cause: data.cause || '',
        treatmentSteps: data.treatmentSteps || (data.treatment ? [data.treatment] : []),
        preventionTips: data.preventionTips || [],
      };
      setTranslationCache({
        en: initial,
        ...(data.translations || {})
      });
    } catch (err) {
      console.error('Failed to load diagnosis report:', err);
      setError(
        err.response?.data?.message || 
        t('diagnose.reportNotFound', 'This diagnosis link is invalid, deleted, or has been revoked by the gardener.')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageSwitch = async (langCode) => {
    if (langCode === currentLang) return;
    setCurrentLang(langCode);

    if (translationCache[langCode]) {
      return;
    }

    setIsTranslating(true);
    try {
      const res = await translateDiagnosisApi(id, langCode);
      if (res && res.translation) {
        setTranslationCache(prev => ({
          ...prev,
          [langCode]: res.translation
        }));
      }
    } catch (err) {
      console.error('Failed to translate public diagnosis:', err);
      addNotification(t('diagnose.translationFailed', 'Could not load translation at this time.'), 'warning');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleShare = async () => {
    const reportUrl = window.location.href;
    const diseaseName = currentContent.diseaseName || 'Plant Diagnosis';
    const summaryText = `UrbanFarm Botanical Diagnosis: ${diseaseName} (${confidencePercent}% confidence). View treatment & prevention:`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `UrbanFarm Diagnosis Report - ${diseaseName}`,
          text: summaryText,
          url: reportUrl,
        });
        addNotification(t('diagnose.sharedSuccess', 'Diagnosis link shared!'), 'success');
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(reportUrl);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = reportUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      addNotification(t('diagnose.copiedSuccess', 'Link copied to clipboard!'), 'success');
    } catch (err) {
      addNotification(reportUrl, 'info');
    }
  };

  // Resolve current active language content
  const currentContent = translationCache[currentLang] || {
    diseaseName: diagnosis?.diseaseName || 'Botanical Condition',
    description: diagnosis?.description || '',
    cause: diagnosis?.cause || '',
    treatmentSteps: diagnosis?.treatmentSteps || (diagnosis?.treatment ? [diagnosis.treatment] : []),
    preventionTips: diagnosis?.preventionTips || [],
  };

  const confidencePercent = Math.round((diagnosis?.confidence || 0) * 100);
  const isHealthy = Boolean(
    /healthy|optimal|no disease/i.test(currentContent.diseaseName)
  );

  const languageOptions = [
    { code: 'en', label: 'English' },
    { code: 'gu', label: 'ગુજરાતી' },
    { code: 'hi', label: 'हिन्दी' },
  ];

  const contentNode = (
    <div className="public-report-container">
      <SEO 
        title={`${currentContent.diseaseName} - UrbanFarm Botanical Report`} 
        description={`AI Plant Health Assessment for ${currentContent.diseaseName}. Confidence: ${confidencePercent}%. Treatment & Prevention steps.`}
        image={diagnosis?.imageUrl}
        url={window.location.href}
        type="article"
      />

      {loading && (
        <div className="pub-loading-state">
          <div className="pub-pulse-indicator" />
          <p>{t('diagnose.loadingReport', 'Loading verified botanical report...')}</p>
        </div>
      )}

      {error && !loading && (
        <div className="pub-error-state">
          <span className="pub-error-badge">Link Unavailable</span>
          <h2>{t('diagnose.notFoundTitle', 'Report Not Found or Revoked')}</h2>
          <p>{error}</p>
          <div className="pub-error-actions">
            <Link to="/diagnose" className="pub-cta-primary">
              {t('diagnose.getYourOwn', 'Get your own plant diagnosis')}
            </Link>
          </div>
        </div>
      )}

      {diagnosis && !loading && (
        <div className="pub-card-wrapper">
          {/* Top header navigation */}
          <div className="pub-header-row">
            <div className="pub-branding">
              <span className="pub-brand-pill">UrbanFarm Botanical AI</span>
              <span className="pub-read-only-tag">Verified Public Report</span>
            </div>

            {/* Language Switcher */}
            <div className="pub-lang-group" role="group" aria-label="Translate Report">
              {languageOptions.map(opt => (
                <button
                  key={opt.code}
                  type="button"
                  className={`pub-lang-btn ${currentLang === opt.code ? 'active' : ''}`}
                  onClick={() => handleLanguageSwitch(opt.code)}
                  disabled={isTranslating}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {isTranslating && (
            <div className="pub-translating-bar">
              <span className="pub-translating-dot" />
              <span>{t('diagnose.translatingWithGemini', 'Translating report with Gemini AI...')}</span>
            </div>
          )}

          {/* Main Grid */}
          <div className="pub-grid">
            {/* Left Column: Image and Metrics */}
            <div className="pub-media-box">
              {diagnosis.imageUrl ? (
                <img 
                  src={diagnosis.imageUrl} 
                  alt={currentContent.diseaseName} 
                  className="pub-leaf-img" 
                />
              ) : (
                <div className="pub-image-placeholder">
                  <span>Specimen Leaf Photo</span>
                </div>
              )}

              <div className="pub-metrics-card">
                <div className="pub-metric-row">
                  <span className="pub-metric-label">{t('diagnose.healthStatus', 'Assessment')}</span>
                  <span className={`pub-status-badge ${isHealthy ? 'healthy' : confidencePercent > 70 ? 'critical' : 'warning'}`}>
                    {isHealthy ? t('diagnose.healthy', 'Healthy') : t('diagnose.issueDetected', 'Issue Detected')}
                  </span>
                </div>

                <div className="pub-metric-row">
                  <span className="pub-metric-label">{t('diagnose.confidenceLevel', 'Confidence')}</span>
                  <span className="pub-confidence-num">{confidencePercent}%</span>
                </div>

                <div className="pub-conf-bar">
                  <div 
                    className="pub-conf-fill" 
                    style={{ 
                      width: `${confidencePercent}%`,
                      backgroundColor: isHealthy ? '#6b9080' : confidencePercent > 70 ? '#c94a4a' : '#c9924a'
                    }} 
                  />
                </div>

                {diagnosis.plantName && (
                  <div className="pub-metric-row pub-plant-row">
                    <span className="pub-metric-label">{t('plants.plant', 'Host Specimen')}</span>
                    <span className="pub-plant-val">{diagnosis.plantName} {diagnosis.plantVariety ? `(${diagnosis.plantVariety})` : ''}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Diagnosis, Cause, Treatment, Prevention */}
            <div className="pub-info-box">
              <div className="pub-title-card">
                <span className="pub-eyebrow">Diagnosed Botanical Condition</span>
                <h1 className="pub-issue-title">{currentContent.diseaseName}</h1>
                {currentContent.description && (
                  <p className="pub-issue-desc">{currentContent.description}</p>
                )}
              </div>

              {/* Cause */}
              {currentContent.cause && (
                <div className="pub-section-card">
                  <h3 className="pub-section-title">{t('diagnose.causeHeading', 'Pathological Cause & Stress Factors')}</h3>
                  <p className="pub-section-text">{currentContent.cause}</p>
                </div>
              )}

              {/* Treatment */}
              {currentContent.treatmentSteps && currentContent.treatmentSteps.length > 0 && (
                <div className="pub-section-card">
                  <h3 className="pub-section-title">{t('diagnose.treatmentStepsHeading', 'Actionable Treatment Steps')}</h3>
                  <div className="pub-step-list">
                    {currentContent.treatmentSteps.map((step, idx) => (
                      <div key={idx} className="pub-step-item">
                        <span className="pub-step-idx">{idx + 1}</span>
                        <div className="pub-step-text">{step}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Prevention */}
              {currentContent.preventionTips && currentContent.preventionTips.length > 0 && (
                <div className="pub-section-card">
                  <h3 className="pub-section-title">{t('diagnose.preventionTipsHeading', 'Long-Term Prevention Tips')}</h3>
                  <div className="pub-tip-list">
                    {currentContent.preventionTips.map((tip, idx) => (
                      <div key={idx} className="pub-tip-item">
                        <span className="pub-tip-bullet" />
                        <div className="pub-tip-text">{tip}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Strip */}
              <div className="pub-action-strip">
                <button type="button" className="pub-share-btn" onClick={handleShare}>
                  {t('diagnose.shareReport', 'Share Link')}
                </button>
                <Link to="/diagnose" className="pub-cta-link">
                  {t('diagnose.getYourOwn', 'Get your own plant diagnosis →')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (user) {
    return <Layout>{contentNode}</Layout>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f6fff8', color: '#1f3a30' }}>
      <GuestNavbar />
      <main style={{ flex: 1, padding: '2rem 1.25rem', maxWidth: '1100px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        {contentNode}
      </main>
      <GuestFooter />
    </div>
  );
};

export default PublicDiagnosisReport;

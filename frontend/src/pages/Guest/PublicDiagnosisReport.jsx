import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getPublicDiagnosis, translateDiagnosisApi } from '../../services/plantService';
import { useNotification } from '../../hooks/useNotification';
import { downloadDiagnosisPDF, generatePdfFileName } from '../../utils/pdfGenerator';
import SEO from '../../components/SEO/SEO';
import GuestNavbar from '../../components/Guest/GuestNavbar';
import GuestFooter from '../../components/Guest/GuestFooter';
import Layout from '../../components/Layout/Layout';
import { useAuth } from '../../hooks/useAuth';
import {
  ArrowLeft,
  Share2,
  FileDown,
  Loader2
} from 'lucide-react';
import './PublicDiagnosisReport.css';

const PublicDiagnosisReport = () => {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const reportRef = useRef(null);
  const pdfTemplateRef = useRef(null);

  const [diagnosis, setDiagnosis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentLang, setCurrentLang] = useState(i18n.language || 'en');
  const [translationCache, setTranslationCache] = useState({});
  const [isTranslating, setIsTranslating] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  useEffect(() => {
    fetchReport();
  }, [id]);

  const extractNormalizedData = (data) => {
    if (!data) return {};

    const observedSymptoms = Array.isArray(data.observedSymptoms) && data.observedSymptoms.length > 0
      ? data.observedSymptoms
      : (Array.isArray(data.symptoms) && data.symptoms.length > 0 ? data.symptoms : []);

    const possibleCauses = Array.isArray(data.possibleCauses) && data.possibleCauses.length > 0
      ? data.possibleCauses
      : (Array.isArray(data.causes) && data.causes.length > 0
        ? data.causes
        : (data.cause ? [data.cause] : []));

    const immediateActions = Array.isArray(data.immediateActions) && data.immediateActions.length > 0
      ? data.immediateActions
      : (Array.isArray(data.treatmentSteps) && data.treatmentSteps.length > 0
        ? data.treatmentSteps
        : (Array.isArray(data.treatment_steps) && data.treatment_steps.length > 0
          ? data.treatment_steps
          : (data.treatment ? [data.treatment] : [])));

    const modernSolutions = Array.isArray(data.modernSolutions) && data.modernSolutions.length > 0
      ? data.modernSolutions
      : (Array.isArray(data.medicalSolutions) && data.medicalSolutions.length > 0
        ? data.medicalSolutions
        : (Array.isArray(data.medical_solutions) ? data.medical_solutions : []));

    const naturalSolutions = Array.isArray(data.naturalSolutions) && data.naturalSolutions.length > 0
      ? data.naturalSolutions
      : (Array.isArray(data.desiSolutions) && data.desiSolutions.length > 0
        ? data.desiSolutions
        : (Array.isArray(data.desi_solutions) ? data.desi_solutions : []));

    const preventionTips = Array.isArray(data.preventionTips) && data.preventionTips.length > 0
      ? data.preventionTips
      : (Array.isArray(data.prevention_tips) ? data.prevention_tips : []);

    const rawSeverity = data.severityLevel || data.severity_level || (data.isHealthy ? 'Healthy' : 'Moderate');
    const severityPercentage = typeof data.severityPercentage === 'number'
      ? data.severityPercentage
      : typeof data.severity_percentage === 'number'
      ? data.severity_percentage
      : rawSeverity === 'Severe' ? 75 : rawSeverity === 'Moderate' ? 45 : rawSeverity === 'Mild' ? 20 : 0;

    return {
      plantName: data.plantName || data.plant_name || '',
      scientificName: data.scientificName || data.scientific_name || '',
      diseaseName: data.diseaseName || data.condition_name || data.disease || 'Plant Condition',
      shortExplanation: data.shortExplanation || data.description || '',
      description: data.description || data.shortExplanation || '',
      observedSymptoms,
      symptoms: observedSymptoms,
      possibleCauses,
      causes: possibleCauses,
      cause: data.cause || (possibleCauses.length ? possibleCauses.join('. ') : ''),
      severityLevel: rawSeverity,
      severityPercentage,
      severityDescription: data.severityDescription || data.severity_description || '',
      immediateActions,
      treatmentSteps: immediateActions,
      modernSolutions,
      medicalSolutions: modernSolutions,
      naturalSolutions,
      desiSolutions: naturalSolutions,
      preventionTips,
      whenToContactExpert: data.whenToContactExpert || data.when_to_contact_expert || data.whenToSeekExpertHelp || '',
      whenToSeekExpertHelp: data.whenToSeekExpertHelp || data.whenToContactExpert || '',
      confidenceLevel: data.confidenceLevel || data.confidence || 'medium',
      noteIfUnsure: data.noteIfUnsure || ''
    };
  };

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPublicDiagnosis(id);
      setDiagnosis(data);
      const initial = extractNormalizedData(data);
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
          [langCode]: extractNormalizedData(res.translation)
        }));
      }
    } catch (err) {
      console.error('Failed to translate public diagnosis:', err);
      addNotification(t('diagnose.translationFailed', 'Could not load translation at this time.'), 'warning');
    } finally {
      setIsTranslating(false);
    }
  };

  const currentContent = translationCache[currentLang] || extractNormalizedData(diagnosis);

  const confidencePercent = Math.round((diagnosis?.confidence || 0.85) * 100);
  const isHealthy = Boolean(
    diagnosis?.isHealthy ||
    /healthy|optimal|no disease/i.test(currentContent.diseaseName)
  );

  const severityNorm = (currentContent.severityLevel || 'Moderate').toLowerCase();
  const severityBadgeClass = isHealthy || severityNorm.includes('health')
    ? 'severity-badge-healthy'
    : severityNorm.includes('severe') || severityNorm.includes('crit')
    ? 'severity-badge-severe'
    : severityNorm.includes('mild') || severityNorm.includes('low')
    ? 'severity-badge-mild'
    : 'severity-badge-moderate';

  const severityDisplayLabel = isHealthy || severityNorm.includes('health')
    ? t('diagnose.severityHealthy', 'Healthy / Optimal')
    : severityNorm.includes('severe') || severityNorm.includes('crit')
    ? t('diagnose.severitySevere', 'Severe Condition')
    : severityNorm.includes('mild') || severityNorm.includes('low')
    ? t('diagnose.severityMild', 'Mild Issue')
    : t('diagnose.severityModerate', 'Moderate Concern');

  const languageOptions = [
    { code: 'en', label: 'English' },
    { code: 'gu', label: 'ગુજરાતી' },
    { code: 'hi', label: 'हिन्दी' },
  ];

  const handleDownloadPDF = async () => {
    const targetElement = pdfTemplateRef.current || reportRef.current;
    if (!targetElement) return;
    setIsDownloadingPdf(true);
    try {
      const fileName = generatePdfFileName(
        currentContent.plantName || diagnosis?.plantName,
        currentContent.diseaseName || diagnosis?.diseaseName,
        diagnosis?.createdAt || new Date()
      );
      await downloadDiagnosisPDF(targetElement, fileName, setIsDownloadingPdf);
      addNotification(t('diagnose.pdfSuccess', 'PDF Report downloaded successfully!'), 'success');
    } catch (err) {
      console.error('PDF generation error:', err);
      addNotification(t('diagnose.pdfFailed', 'Failed to generate PDF. Please try again.'), 'error');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleShare = async () => {
    const reportUrl = window.location.href;
    const diseaseName = currentContent.diseaseName || 'Plant Diagnosis';
    const summaryText = `UrbanFarm Botanical Diagnosis: ${diseaseName} (${confidencePercent}% confidence). View 9-point treatment & prevention:`;

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
        <div ref={reportRef} className="pub-card-wrapper">
          {/* Top header navigation */}
          <div className="dr-topbar">
            <div className="dr-topbar-left">
              <Link to="/diagnose" className="dr-back-btn">
                <ArrowLeft size={16} />
                <span>{t('diagnose.backToScanner', 'Back to Scanner')}</span>
              </Link>
              <span className="dr-report-badge">
                {t('diagnose.verifiedReport', 'Verified Diagnosis')}
              </span>
            </div>

            <div className="dr-topbar-right">
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

              {/* PDF Download Button */}
              <button 
                type="button" 
                className="dr-pdf-btn" 
                onClick={handleDownloadPDF}
                disabled={isDownloadingPdf}
              >
                {isDownloadingPdf ? (
                  <>
                    <Loader2 size={16} className="dr-spin-icon" />
                    <span>{t('diagnose.downloadingPdf', 'Generating PDF...')}</span>
                  </>
                ) : (
                  <>
                    <FileDown size={16} />
                    <span>{t('diagnose.downloadPdf', 'Download PDF')}</span>
                  </>
                )}
              </button>

              <button 
                type="button" 
                className="dr-share-btn" 
                onClick={handleShare}
              >
                <Share2 size={16} />
                <span>{t('diagnose.shareReport', 'Share Report')}</span>
              </button>
            </div>
          </div>



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
                      backgroundColor: isHealthy ? '#16a34a' : confidencePercent > 70 ? '#dc2626' : '#d97706'
                    }} 
                  />
                </div>

                {(currentContent.plantName || diagnosis.plantName) && (
                  <div className="pub-metric-row pub-plant-row">
                    <span className="pub-metric-label">{t('plants.plant', 'Host Specimen')}</span>
                    <span className="pub-plant-val">
                      {currentContent.plantName || diagnosis.plantName}
                      {currentContent.scientificName && <em> ({currentContent.scientificName})</em>}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: 9 Exact Clinical Sections */}
            <div className="pub-info-box">
              {/* SECTION 1: Diagnosis */}
              <div className="pub-title-card">
                <div className="pub-section-eyebrow">
                  {t('diagnose.section1Title', 'Diagnosis')}
                </div>
                <h1 className="pub-issue-title">{currentContent.diseaseName}</h1>
                {(currentContent.shortExplanation || currentContent.description) && (
                  <p className="pub-issue-desc">{currentContent.shortExplanation || currentContent.description}</p>
                )}
              </div>

              {/* SECTION 2: Observed Symptoms */}
              <div className="pub-section-card">
                <h3 className="pub-section-title">
                  {t('diagnose.section2Title', 'Observed Symptoms')}
                </h3>
                {currentContent.observedSymptoms && currentContent.observedSymptoms.length > 0 ? (
                  <ul className="pub-bullet-list">
                    {currentContent.observedSymptoms.map((symptom, idx) => (
                      <li key={idx} className="pub-bullet-item">
                        <span className="pub-symptom-bullet">•</span>
                        <span>{symptom}</span>
                      </li>
                    ))}
                  </ul>
                ) : isHealthy ? (
                  <div className="dr-healthy-state-box">
                    <span>{t('diagnose.healthySymptomsDesc', 'No visible spots, wilting, curling, mold, or insect infestation detected. Leaves and tissues exhibit healthy turgidity and coloration.')}</span>
                  </div>
                ) : (
                  <p className="pub-section-text">{t('diagnose.noSymptomsSummary', 'No specific symptoms noted.')}</p>
                )}
              </div>

              {/* SECTION 3: Possible Cause */}
              <div className="pub-section-card">
                <h3 className="pub-section-title">
                  {t('diagnose.section3Title', 'Possible Cause')}
                </h3>
                {currentContent.possibleCauses && currentContent.possibleCauses.length > 0 ? (
                  <ul className="pub-bullet-list">
                    {currentContent.possibleCauses.map((c, idx) => (
                      <li key={idx} className="pub-bullet-item">
                        <span className="pub-symptom-bullet">•</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                ) : isHealthy ? (
                  <div className="dr-healthy-state-box">
                    <span>{t('diagnose.healthyCausesDesc', 'Optimal growing conditions, balanced soil moisture, adequate sunlight, and proper nutrient supply.')}</span>
                  </div>
                ) : (
                  <p className="pub-section-text">{currentContent.cause || t('diagnose.noCauseSummary', 'No specific cause listed.')}</p>
                )}
              </div>

              {/* SECTION 4: Severity */}
              <div className="pub-section-card pub-severity-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h3 className="pub-section-title" style={{ margin: 0 }}>
                    {t('diagnose.section4Title', 'Severity')}
                  </h3>
                  <span className={`dr-severity-status-pill ${severityBadgeClass}`}>
                    {severityDisplayLabel}
                  </span>
                </div>
                <div className="pub-severity-meta">
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#4b5563', lineHeight: 1.5 }}>
                    {currentContent.severityDescription || (isHealthy ? t('diagnose.healthyDesc', 'The plant is in optimal physiological health with no pathogen infection or pest activity.') : '')}
                  </p>
                </div>
              </div>

              {/* SECTION 5: Immediate Action */}
              {currentContent.immediateActions && currentContent.immediateActions.length > 0 && (
                <div className="pub-section-card">
                  <h3 className="pub-section-title">
                    {t('diagnose.section5Title', 'Immediate Action')}
                  </h3>
                  <div className="pub-step-list">
                    {currentContent.immediateActions.map((step, idx) => (
                      <div key={idx} className="pub-step-item">
                        <span className="pub-step-idx">{idx + 1}</span>
                        <div className="pub-step-text">{step}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 6: Modern Solution */}
              {currentContent.modernSolutions && currentContent.modernSolutions.length > 0 && (
                <div className="pub-section-card pub-chemical-section">
                  <h3 className="pub-section-title">
                    {t('diagnose.section6Title', 'Modern Solution')}
                  </h3>
                  <div className="pub-remedy-grid">
                    {currentContent.modernSolutions.map((chem, idx) => (
                      <div key={idx} className="pub-remedy-card chemical-item">
                        <span className="pub-remedy-tag chem-tag">
                          {t('diagnose.chemicalFungicide', 'Formulation')} #{idx + 1}
                        </span>
                        <p>{chem}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 7: Natural Solution */}
              {currentContent.naturalSolutions && currentContent.naturalSolutions.length > 0 && (
                <div className="pub-section-card pub-desi-section">
                  <h3 className="pub-section-title">
                    {t('diagnose.section7Title', 'Natural Solution')}
                  </h3>
                  <div className="pub-remedy-grid">
                    {currentContent.naturalSolutions.map((remedy, idx) => (
                      <div key={idx} className="pub-remedy-card">
                        <span className="pub-remedy-tag">
                          {t('diagnose.remedy', 'Recipe')} #{idx + 1}
                        </span>
                        <p>{remedy}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 8: Prevention */}
              {currentContent.preventionTips && currentContent.preventionTips.length > 0 && (
                <div className="pub-section-card">
                  <h3 className="pub-section-title">
                    {t('diagnose.section8Title', 'Prevention')}
                  </h3>
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

              {/* SECTION 9: When to Contact Expert */}
              {currentContent.whenToContactExpert && (
                <div className="pub-section-card pub-expert-section">
                  <h3 className="pub-section-title">
                    {t('diagnose.section9Title', 'When to Contact Expert')}
                  </h3>
                  <p className="pub-section-text">{currentContent.whenToContactExpert}</p>
                </div>
              )}

              {/* Bottom Action Footer Dock */}
              <div className="dr-bottom-dock">
                <div className="dr-dock-left-group">
                  <button 
                    type="button" 
                    className="dr-pdf-btn" 
                    onClick={handleDownloadPDF}
                    disabled={isDownloadingPdf}
                  >
                    {isDownloadingPdf ? (
                      <>
                        <Loader2 size={16} className="dr-spin-icon" />
                        <span>{t('diagnose.downloadingPdf', 'Generating PDF...')}</span>
                      </>
                    ) : (
                      <>
                        <FileDown size={16} />
                        <span>{t('diagnose.downloadPdf', 'Download PDF')}</span>
                      </>
                    )}
                  </button>

                  <button 
                    type="button" 
                    className="dr-dock-share-btn" 
                    onClick={handleShare}
                  >
                    <Share2 size={16} />
                    <span>{t('diagnose.shareReport', 'Share Report')}</span>
                  </button>
                </div>

                <div className="dr-dock-right-group">
                  <Link to="/diagnose" className="dr-rescan-btn">
                    <span>{t('diagnose.getYourOwn', 'Get your own plant diagnosis →')}</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DEDICATED 1-PAGE A4 PDF PRINT DOSSIER TEMPLATE (Captured by PDF Generator) */}
      {/* ========================================================================= */}
      {diagnosis && (
        <div ref={pdfTemplateRef} className="dr-dedicated-pdf-sheet">
          <div className="pdf-sheet-header">
            <div className="pdf-sheet-brand">
              <div className="pdf-sheet-logo-row">
                <span className="pdf-brand-title">UrbanFarm Botanical Pathology Laboratory</span>
              </div>
              <div className="pdf-brand-subtitle">Clinical Agricultural Diagnostic Dossier</div>
            </div>
            <div className="pdf-sheet-meta">
              <div className="pdf-meta-date">
                {new Date().toLocaleDateString(i18n.language === 'gu' ? 'gu-IN' : i18n.language === 'hi' ? 'hi-IN' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </div>
              <div className="pdf-meta-id">Report ID: #UF-{(id || 'PUBLIC').toString().slice(-6).toUpperCase()}</div>
              <div className={`pdf-meta-pill ${isHealthy ? 'healthy' : 'issue'}`}>
                {isHealthy ? t('diagnose.healthy', 'Healthy') : t('diagnose.issueDetected', 'Issue Detected')}
              </div>
            </div>
          </div>

          <div className="pdf-card pdf-hero-card">
            <div className="pdf-hero-layout">
              {diagnosis.imageUrl ? (
                <img src={diagnosis.imageUrl} alt={currentContent.diseaseName} className="pdf-specimen-img" />
              ) : (
                <div className="pdf-no-img">Specimen Leaf Photo</div>
              )}
              <div className="pdf-hero-details">
                <div className="pdf-hero-headline-row">
                  <span className="pdf-section-tag">{t('diagnose.section1Title', 'Diagnosis')}</span>
                  {(currentContent.plantName || diagnosis.plantName) && (
                    <span className="pdf-plant-tag">
                      {currentContent.plantName || diagnosis.plantName}
                      {currentContent.scientificName && <em> ({currentContent.scientificName})</em>}
                    </span>
                  )}
                </div>
                <div className="pdf-disease-title">{currentContent.diseaseName}</div>
                {(currentContent.shortExplanation || currentContent.description) && (
                  <div className="pdf-disease-desc">{currentContent.shortExplanation || currentContent.description}</div>
                )}
                <div className="pdf-vitals-row">
                  <div className="pdf-vital-box">
                    <span className="pdf-vital-lbl">{isHealthy ? t('diagnose.healthScore', 'Plant Vitality') : t('diagnose.damageIndex', 'Damage Index')}:</span>
                    <span className="pdf-vital-val">{isHealthy ? '100% (Optimal)' : `${currentContent.severityPercentage || (severityNorm.includes('severe') ? 80 : severityNorm.includes('mild') ? 20 : 50)}%`}</span>
                  </div>
                  <div className="pdf-vital-box">
                    <span className="pdf-vital-lbl">{t('diagnose.section4Title', 'Severity')}:</span>
                    <span className="pdf-vital-val">{severityDisplayLabel}</span>
                  </div>
                  <div className="pdf-vital-box">
                    <span className="pdf-vital-lbl">{t('diagnose.confidenceLevel', 'Confidence')}:</span>
                    <span className="pdf-vital-val">{confidencePercent}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pdf-row-2col">
            <div className="pdf-card">
              <div className="pdf-card-title-row">
                <span className="pdf-card-title">{t('diagnose.section2Title', 'Observed Symptoms')}</span>
                {currentContent.observedSymptoms?.length > 0 && (
                  <span className="pdf-counter-badge">{currentContent.observedSymptoms.length} {t('diagnose.signs', 'signs')}</span>
                )}
              </div>
              {currentContent.observedSymptoms?.length > 0 ? (
                <ul className="pdf-bullet-list">
                  {currentContent.observedSymptoms.map((s, i) => (
                    <li key={i}><span className="pdf-bullet-dot" /><span>{s}</span></li>
                  ))}
                </ul>
              ) : (
                <div className="pdf-empty-text">{t('diagnose.noSymptomsSummary', 'No specific symptoms noted.')}</div>
              )}
            </div>

            <div className="pdf-card">
              <div className="pdf-card-title-row">
                <span className="pdf-card-title">{t('diagnose.section3Title', 'Possible Cause')}</span>
              </div>
              {currentContent.possibleCauses?.length > 0 ? (
                <ul className="pdf-bullet-list">
                  {currentContent.possibleCauses.map((c, i) => (
                    <li key={i}><span className="pdf-bullet-dot" /><span>{c}</span></li>
                  ))}
                </ul>
              ) : (
                <div className="pdf-empty-text">{currentContent.cause || t('diagnose.noCauseSummary', 'No specific cause listed.')}</div>
              )}
            </div>
          </div>

          <div className="pdf-row-2col">
            <div className="pdf-card">
              <div className="pdf-card-title-row">
                <span className="pdf-card-title">{t('diagnose.section4Title', 'Severity')}</span>
                <span className="pdf-severity-pill">{severityDisplayLabel}</span>
              </div>
              <div className="pdf-severity-text">
                {currentContent.severityDescription || (isHealthy ? t('diagnose.healthyDesc', 'The plant is in optimal physiological health.') : '')}
              </div>
            </div>

            <div className="pdf-card">
              <div className="pdf-card-title-row">
                <span className="pdf-card-title">{t('diagnose.section5Title', 'Immediate Action')}</span>
                <span className="pdf-urgent-pill">{t('diagnose.firstAid', 'First Aid')}</span>
              </div>
              {currentContent.immediateActions?.length > 0 ? (
                <div className="pdf-steps-list">
                  {currentContent.immediateActions.map((act, i) => (
                    <div key={i} className="pdf-step-line">
                      <span className="pdf-step-idx">{i + 1}</span>
                      <span className="pdf-step-txt">{act}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="pdf-empty-text">{t('diagnose.noTreatmentSteps', 'No immediate action required.')}</div>
              )}
            </div>
          </div>

          <div className="pdf-row-2col">
            <div className="pdf-card">
              <div className="pdf-card-title-row">
                <span className="pdf-card-title">{t('diagnose.section6Title', 'Modern Solution')}</span>
                <span className="pdf-control-pill">{t('diagnose.targetedControl', 'Active Formulations')}</span>
              </div>
              <div className="pdf-sub-guide">{t('diagnose.modernSubtext', 'Approved active formulations:')}</div>
              {currentContent.modernSolutions?.length > 0 ? (
                <div className="pdf-remedies-list">
                  {currentContent.modernSolutions.map((chem, i) => (
                    <div key={i} className="pdf-remedy-item">
                      <span className="pdf-remedy-num">{t('diagnose.chemicalFungicide', 'Formulation')} #{i + 1}:</span>
                      <span className="pdf-remedy-txt">{chem}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="pdf-empty-text">{t('diagnose.noTreatmentAvailable', 'No chemical treatments required.')}</div>
              )}
            </div>

            <div className="pdf-card">
              <div className="pdf-card-title-row">
                <span className="pdf-card-title">{t('diagnose.section7Title', 'Natural Solution')}</span>
                <span className="pdf-organic-pill">{t('diagnose.naturalOrganic', '100% Organic')}</span>
              </div>
              <div className="pdf-sub-guide">{t('diagnose.naturalSubtext', 'Organic & herbal solutions:')}</div>
              {currentContent.naturalSolutions?.length > 0 ? (
                <div className="pdf-remedies-list">
                  {currentContent.naturalSolutions.map((nat, i) => (
                    <div key={i} className="pdf-remedy-item">
                      <span className="pdf-remedy-num">{t('diagnose.remedy', 'Recipe')} #{i + 1}:</span>
                      <span className="pdf-remedy-txt">{nat}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="pdf-empty-text">{t('diagnose.noTreatmentAvailable', 'No organic remedies required.')}</div>
              )}
            </div>
          </div>

          <div className="pdf-row-2col">
            <div className="pdf-card">
              <div className="pdf-card-title-row">
                <span className="pdf-card-title">{t('diagnose.section8Title', 'Prevention')}</span>
              </div>
              {currentContent.preventionTips?.length > 0 ? (
                <ul className="pdf-bullet-list">
                  {currentContent.preventionTips.map((tip, i) => (
                    <li key={i}><span className="pdf-bullet-dot" /><span>{tip}</span></li>
                  ))}
                </ul>
              ) : (
                <div className="pdf-empty-text">{t('diagnose.noPreventionTips', 'No prevention tips available.')}</div>
              )}
            </div>

            <div className="pdf-card">
              <div className="pdf-card-title-row">
                <span className="pdf-card-title">{t('diagnose.section9Title', 'When to Contact Expert')}</span>
              </div>
              <div className="pdf-expert-text">
                {currentContent.whenToContactExpert || t('diagnose.expertHelpGuideline', 'If disease spreads to >30% of crop, consult your local Krishi Vigyan Kendra (KVK).')}
              </div>
            </div>
          </div>

          <div className="pdf-sheet-footer">
            <span className="pdf-footer-left">UrbanFarm AI Pathology Intelligence • Clinical Single-Page Diagnostic Dossier • www.urbanfarm.app</span>
            <span className="pdf-footer-right">Page 1 of 1 • 100% Certified Agronomy Standard</span>
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

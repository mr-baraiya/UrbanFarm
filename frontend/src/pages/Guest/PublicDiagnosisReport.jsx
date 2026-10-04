import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  RiMicroscopeLine, 
  RiShieldCheckLine, 
  RiMedicineBottleLine, 
  RiCalendarEventLine, 
  RiShareLine, 
  RiCheckLine, 
  RiAlertLine, 
  RiSparklingLine,
  RiArrowLeftLine,
  RiPlantLine
} from 'react-icons/ri';
import { getDiagnosisById } from '../../services/plantService';
import { getLocalizedDynamicText } from '../../utils/localizationHelper';
import { getPublicShareUrl } from '../../utils/shareUtils';
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
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchReport();
  }, [id]);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDiagnosisById(id);
      setDiagnosis(data);
    } catch (err) {
      console.error('Failed to load diagnosis report:', err);
      setError(t('diagnose.reportNotFound', 'Diagnosis report not found or has been removed.'));
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const reportUrl = getPublicShareUrl(`/diagnose/report/${id}`);
    const diseaseName = getLocalizedDynamicText(diagnosis?.diseaseName || diagnosis?.disease || 'Plant Check', i18n.language);
    const summaryText = `🌱 UrbanFarm Botanical Diagnosis Report\nCondition: ${diseaseName}\nConfidence: ${Math.round((diagnosis?.confidence || 0) * 100)}%\n\nDiagnosed via Krishi AI:`;
    const fullCopyText = `${summaryText}\n${reportUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `UrbanFarm Diagnosis Report - ${diseaseName}`,
          text: summaryText,
          url: reportUrl,
        });
        addNotification(t('diagnose.sharedSuccess', 'Diagnosis shared successfully!'), 'success');
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(fullCopyText);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = fullCopyText;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      addNotification(t('diagnose.copiedSuccess', 'Diagnosis summary copied to clipboard!'), 'success');
    } catch (err) {
      addNotification(t('diagnose.copyFailed', 'Unable to copy report link'), 'error');
    }
  };

  const parseSteps = (rawText) => {
    if (!rawText) return [];
    if (Array.isArray(rawText)) return rawText;
    return rawText
      .split(/(?:\r?\n)+|(?=\d+\.\s+)/)
      .map(s => s.replace(/^\d+[\.\)]\s*/, '').trim())
      .filter(Boolean);
  };

  const diseaseNameRaw = diagnosis?.diseaseName || diagnosis?.disease || '';
  const isHealthy = Boolean(
    diagnosis?.isHealthy || 
    (diseaseNameRaw && diseaseNameRaw.toLowerCase().includes('healthy'))
  );

  const localizedDiseaseName = isHealthy && (!diseaseNameRaw || diseaseNameRaw.toLowerCase() === 'general condition')
    ? t('diagnose.categoryHealthy', 'Healthy')
    : getLocalizedDynamicText(diseaseNameRaw || 'General Condition', i18n.language);

  const treatmentSteps = parseSteps(diagnosis?.treatment || '');
  const confidencePercent = Math.round((diagnosis?.confidence || 0) * 100);

  const contentNode = (
    <div className="public-report-container">
      <SEO 
        title={`Botanical Diagnosis Report: ${localizedDiseaseName} - UrbanFarm`} 
        description={`View AI Plant Diagnosis for ${localizedDiseaseName}. Confidence: ${confidencePercent}%. Treatment & Prevention guidelines by Krishi AI.`}
        url={getPublicShareUrl(`/diagnose/report/${id}`)}
      />

      <div className="public-report-header">
        <Link to="/diagnose" className="back-btn">
          <RiArrowLeftLine /> {t('diagnose.backToDiagnose', 'New Diagnosis')}
        </Link>
        <div className="report-badge-pill">
          <RiSparklingLine className="sparkle-icon" /> Official Krishi AI Report
        </div>
      </div>

      {loading && (
        <div className="report-loading-card">
          <div className="loading-spinner"></div>
          <p>{t('diagnose.loadingReport', 'Fetching plant diagnosis report...')}</p>
        </div>
      )}

      {error && !loading && (
        <div className="report-error-card">
          <RiAlertLine className="error-icon" />
          <h3>{t('diagnose.notFoundTitle', 'Report Not Found')}</h3>
          <p>{error}</p>
          <Link to="/diagnose" className="btn-primary">
            <RiPlantLine /> {t('diagnose.startDiagnosis', 'Diagnose Your Plant')}
          </Link>
        </div>
      )}

      {diagnosis && !loading && (
        <div className="report-main-card">
          <div className="report-top-banner">
            <div className="banner-left">
              <span className={`status-tag ${isHealthy ? 'tag-healthy' : 'tag-warning'}`}>
                {isHealthy ? <RiCheckLine /> : <RiAlertLine />}
                {isHealthy ? t('diagnose.categoryHealthy', 'Healthy Plant') : t('diagnose.categoryDisease', 'Plant Disease Detected')}
              </span>
              <h2>{localizedDiseaseName}</h2>
              <p className="diagnosed-date">
                <RiCalendarEventLine /> {new Date(diagnosis.createdAt).toLocaleString(i18n.language === 'gu' ? 'gu-IN' : i18n.language === 'hi' ? 'hi-IN' : 'en-US')}
              </p>
            </div>
            <div className="banner-right">
              <div className="confidence-circle">
                <span className="conf-value">{confidencePercent}%</span>
                <span className="conf-label">{t('diagnose.confidenceLabel', 'AI Confidence')}</span>
              </div>
            </div>
          </div>

          {diagnosis.imageUrl && (
            <div className="report-image-frame">
              <img src={diagnosis.imageUrl} alt={localizedDiseaseName} className="report-plant-img" />
            </div>
          )}

          {diagnosis.description && (
            <div className="report-section">
              <h3><RiMicroscopeLine className="sec-icon" /> {t('diagnose.descriptionHeader', 'Description')}</h3>
              <p className="sec-text">{getLocalizedDynamicText(diagnosis.description, i18n.language)}</p>
            </div>
          )}

          {treatmentSteps.length > 0 && (
            <div className="report-section treatment-box">
              <h3><RiMedicineBottleLine className="sec-icon" /> {t('diagnose.treatmentHeader', 'Recommended Treatment Plan')}</h3>
              <ol className="treatment-list">
                {treatmentSteps.map((step, idx) => (
                  <li key={idx}>
                    <span className="step-num">{idx + 1}</span>
                    <span className="step-content">{getLocalizedDynamicText(step, i18n.language)}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div className="report-section prevention-box">
            <h3><RiShieldCheckLine className="sec-icon" /> {t('diagnose.preventionHeader', 'Prevention Guidelines')}</h3>
            <ul className="prevention-list">
              <li>{t('diagnose.tipsDefault1', 'Inspect foliage regularly and prune affected leaves')}</li>
              <li>{t('diagnose.tipsDefault2', 'Avoid overhead watering; maintain adequate air circulation')}</li>
              <li>{t('diagnose.tipsDefault3', 'Use clean, organic soil and sanitize tools before pruning')}</li>
            </ul>
          </div>

          <div className="report-footer-actions">
            <button className="btn-secondary" onClick={handleShare}>
              <RiShareLine /> {copied ? t('diagnose.copiedSuccess', 'Copied!') : t('diagnose.shareReport', 'Share Report')}
            </button>
            <Link to="/diagnose" className="btn-primary">
              <RiPlantLine /> {t('diagnose.diagnoseAnother', 'Diagnose Your Own Plant')}
            </Link>
          </div>
        </div>
      )}
    </div>
  );

  if (user) {
    return <Layout>{contentNode}</Layout>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--background)', color: 'var(--text)' }}>
      <GuestNavbar />
      <main style={{ flex: 1, padding: '2rem 1.25rem', maxWidth: '1000px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        {contentNode}
      </main>
      <GuestFooter />
    </div>
  );
};

export default PublicDiagnosisReport;

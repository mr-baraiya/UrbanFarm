import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNotification } from '../../hooks/useNotification';
import { retryGeminiTips, translateDiagnosisApi, toggleDiagnosisShare } from '../../services/plantService';
import './DiseaseResult.css';

const DiseaseResult = ({ result, isHistory = false, onAddToSchedule, onClose, onBack }) => {
  const { t, i18n } = useTranslation();
  const { addNotification } = useNotification();

  const diagnosisId = result._id || result.id;
  const initialShareId = result.shareId || diagnosisId;

  // Initial data normalization
  const initialData = {
    diseaseName: result.diseaseName || result.disease || 'Unknown Condition',
    description: result.description || '',
    cause: result.cause || '',
    treatmentSteps: Array.isArray(result.treatmentSteps) && result.treatmentSteps.length > 0
      ? result.treatmentSteps
      : (result.treatment ? [result.treatment] : []),
    preventionTips: Array.isArray(result.preventionTips) ? result.preventionTips : [],
  };

  const [currentLang, setCurrentLang] = useState(i18n.language || 'en');
  const [translationCache, setTranslationCache] = useState({
    en: initialData,
    ...(result.translations ? result.translations : {})
  });
  const [currentData, setCurrentData] = useState(initialData);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState(null);

  const [isRetryingTips, setIsRetryingTips] = useState(false);
  const [tipsError, setTipsError] = useState(result.tipsError || null);

  const [isPublic, setIsPublic] = useState(result.isPublic !== false);
  const [shareId, setShareId] = useState(initialShareId);
  const [isTogglingShare, setIsTogglingShare] = useState(false);

  const confidencePercent = Math.round((result.confidence || 0) * 100);
  const isHealthy = Boolean(
    result.isHealthy ||
    /healthy|optimal|no disease/i.test(currentData.diseaseName)
  );

  // Sync when language or cache changes
  useEffect(() => {
    if (translationCache[currentLang]) {
      setCurrentData(translationCache[currentLang]);
      setTranslationError(null);
    }
  }, [currentLang, translationCache]);

  const handleLanguageSwitch = async (langCode) => {
    if (!langCode) return;
    setCurrentLang(langCode);
    setTranslationError(null);

    // If cached, use cached immediately
    if (translationCache[langCode]) {
      setCurrentData(translationCache[langCode]);
      return;
    }

    if (!diagnosisId) {
      return;
    }

    setIsTranslating(true);
    try {
      const res = await translateDiagnosisApi(diagnosisId, langCode);
      if (res && res.translation) {
        setTranslationCache(prev => ({
          ...prev,
          [langCode]: res.translation
        }));
        setCurrentData(res.translation);
      }
    } catch (err) {
      console.error('Failed to translate diagnosis:', err);
      setTranslationError(err.response?.data?.message || t('diagnose.translationFailed', 'Translation failed. You can retry.'));
    } finally {
      setIsTranslating(false);
    }
  };

  const handleGenerateAndTranslateTips = async (langToUse = (i18n.language || 'en')) => {
    if (!diagnosisId) return;
    setIsRetryingTips(true);
    setTipsError(null);
    try {
      const res = await retryGeminiTips(diagnosisId);
      if (res && res.success) {
        const updatedEn = {
          diseaseName: currentData.diseaseName,
          description: currentData.description,
          cause: res.cause || currentData.cause,
          treatmentSteps: res.treatmentSteps || currentData.treatmentSteps,
          preventionTips: res.preventionTips || currentData.preventionTips,
        };

        setTranslationCache(prev => ({
          ...prev,
          en: updatedEn
        }));

        if (langToUse && langToUse !== 'en') {
          setIsTranslating(true);
          try {
            const transRes = await translateDiagnosisApi(diagnosisId, langToUse);
            if (transRes && transRes.translation) {
              setTranslationCache(prev => ({
                ...prev,
                [langToUse]: transRes.translation
              }));
              setCurrentData(transRes.translation);
            } else {
              setCurrentData(updatedEn);
            }
          } catch (transErr) {
            console.error('Failed to translate newly generated tips:', transErr);
            setCurrentData(updatedEn);
          } finally {
            setIsTranslating(false);
          }
        } else {
          setCurrentData(updatedEn);
        }
      }
    } catch (err) {
      console.error('Tips generation error:', err);
      setTipsError(err.response?.data?.message || err.message || t('diagnose.tipsRetryFailed', 'Could not generate AI tips at this moment. Please retry.'));
    } finally {
      setIsRetryingTips(false);
    }
  };

  // Automatically generate tips on page load if not present, and load in active language
  useEffect(() => {
    const activeLang = i18n.language || 'en';
    const hasCause = Boolean(result.cause || initialData.cause);
    const hasPrevention = Array.isArray(result.preventionTips) && result.preventionTips.length > 0;

    if (!isHealthy && (!hasCause || !hasPrevention)) {
      handleGenerateAndTranslateTips(activeLang);
    } else if (activeLang !== 'en') {
      if (translationCache[activeLang]) {
        setCurrentData(translationCache[activeLang]);
        setCurrentLang(activeLang);
      } else {
        handleLanguageSwitch(activeLang);
      }
    }
  }, [diagnosisId]);

  // Sync when user changes application language
  useEffect(() => {
    const activeLang = i18n.language || 'en';
    if (activeLang !== currentLang && !isRetryingTips) {
      handleLanguageSwitch(activeLang);
    }
  }, [i18n.language]);

  const handleToggleShare = async () => {
    if (!diagnosisId) return;
    setIsTogglingShare(true);
    try {
      const res = await toggleDiagnosisShare(diagnosisId, !isPublic);
      if (res && res.success) {
        setIsPublic(res.isPublic);
        if (res.shareId) setShareId(res.shareId);
        addNotification(
          res.isPublic
            ? t('diagnose.shareEnabled', 'Public share link enabled!')
            : t('diagnose.shareRevoked', 'Public share link revoked. The report is now private.'),
          'info'
        );
      }
    } catch (err) {
      console.error('Toggle share error:', err);
      addNotification(t('diagnose.shareToggleFailed', 'Failed to update share status.'), 'error');
    } finally {
      setIsTogglingShare(false);
    }
  };

  const handleShare = async () => {
    const publicUrl = `${window.location.origin}/d/${shareId}`;
    const shareTitle = `UrbanFarm Plant Diagnosis: ${currentData.diseaseName}`;
    const shareText = `Botanical Health Report: ${currentData.diseaseName} (${confidencePercent}% confidence). View treatment & prevention:`;

    if (!isPublic) {
      // Re-enable first
      await handleToggleShare();
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: publicUrl,
        });
        addNotification(t('diagnose.shareSuccess', 'Diagnosis shared successfully!'), 'success');
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(publicUrl);
      } else {
        const input = document.createElement('input');
        input.value = publicUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      addNotification(t('diagnose.linkCopied', 'Public diagnosis link copied to clipboard!'), 'success');
    } catch (clipErr) {
      console.error('Copy failed:', clipErr);
      addNotification(publicUrl, 'info');
    }
  };

  // Automatically sync with global i18n language
  useEffect(() => {
    if (i18n.language && i18n.language !== currentLang) {
      handleLanguageSwitch(i18n.language);
    }
  }, [i18n.language]);

  return (
    <div className="disease-result-fullpage">
      {/* Top Navigation & Actions Bar */}
      <div className="dr-topbar">
        <div className="dr-topbar-left">
          <button 
            type="button" 
            className="dr-back-btn" 
            onClick={onBack || onClose}
          >
            ← {t('diagnose.backToScanner', 'Back to Scanner')}
          </button>
          <span className="dr-report-badge">
            {isHistory ? t('diagnose.historyReport', 'Archived Report') : t('diagnose.newReport', 'Active Diagnosis')}
          </span>
        </div>

        <div className="dr-topbar-right">
          {/* Share Action */}
          <button 
            type="button" 
            className="dr-share-btn" 
            onClick={handleShare}
          >
            {t('diagnose.shareReport', 'Share Report')}
          </button>
        </div>
      </div>

      {/* Translation Banner / Error */}
      {isTranslating && (
        <div className="dr-notice-banner dr-notice-loading">
          <span className="dr-pulse-dot" />
          <span>{t('diagnose.translatingWithGemini', 'Translating diagnosis with Gemini AI...')}</span>
        </div>
      )}
      {translationError && (
        <div className="dr-notice-banner dr-notice-error">
          <span>{translationError}</span>
          <button 
            type="button" 
            className="dr-text-action-btn" 
            onClick={() => handleLanguageSwitch(currentLang)}
          >
            {t('common.retry', 'Retry')}
          </button>
        </div>
      )}



      {/* Main Full Page Grid */}
      <div className="dr-main-grid">
        {/* Left Column: Image & Health Overview */}
        <div className="dr-media-column">
          <div className="dr-card dr-image-card">
            {result.imageUrl ? (
              <img 
                src={result.imageUrl} 
                alt={currentData.diseaseName} 
                className="dr-full-image" 
              />
            ) : (
              <div className="dr-no-image-placeholder">
                <span>{t('diagnose.noImageAvailable', 'Specimen Leaf Image')}</span>
              </div>
            )}

            <div className="dr-media-details">
              <div className="dr-severity-row">
                <span className="dr-meta-label">{t('diagnose.healthStatus', 'Health Status')}</span>
                <span className={`dr-pill-tag ${isHealthy ? 'healthy' : confidencePercent > 70 ? 'critical' : 'warning'}`}>
                  {isHealthy ? t('diagnose.healthy', 'Healthy') : t('diagnose.issueDetected', 'Issue Detected')}
                </span>
              </div>

              <div className="dr-severity-row">
                <span className="dr-meta-label">{t('diagnose.confidenceLevel', 'Confidence')}</span>
                <span className="dr-confidence-text">{confidencePercent}%</span>
              </div>

              <div className="dr-confidence-meter">
                <div 
                  className="dr-confidence-fill" 
                  style={{ 
                    width: `${confidencePercent}%`,
                    backgroundColor: isHealthy ? '#6b9080' : confidencePercent > 70 ? '#c94a4a' : '#c9924a'
                  }} 
                />
              </div>

              {result.plantId?.name && (
                <div className="dr-plant-link-row">
                  <span className="dr-meta-label">{t('plants.plant', 'Plant')}</span>
                  <span className="dr-plant-name">{result.plantId.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Pathological Details, Treatment & Prevention */}
        <div className="dr-content-column">
          {/* Header Card */}
          <div className="dr-card dr-headline-card">
            <span className="dr-eyebrow">
              {isHealthy ? t('diagnose.optimalHealth', 'Botanical Assessment') : t('diagnose.pathologyReport', 'Diagnosed Issue')}
            </span>
            <h1 className="dr-disease-title">{currentData.diseaseName}</h1>
            {currentData.description && (
              <p className="dr-description-text">{currentData.description}</p>
            )}
          </div>

          {/* Root Cause Card */}
          <div className="dr-card dr-section-card">
            <div className="dr-section-header">
              <h2 className="dr-section-title">{t('diagnose.causeHeading', 'Pathological Cause & Stress Factors')}</h2>
            </div>
            {isRetryingTips ? (
              <div className="dr-tips-loading-box">
                <div className="dr-tips-loading-spinner" />
                <span>{t('diagnose.generatingTipsWithGemini', 'Analyzing pathological cause & AI tips with Gemini...')}</span>
              </div>
            ) : currentData.cause ? (
              <p className="dr-section-body">{currentData.cause}</p>
            ) : tipsError ? (
              <div className="dr-tips-error-box">
                <p>{tipsError}</p>
                <button 
                  type="button" 
                  className="dr-retry-btn" 
                  onClick={() => handleGenerateAndTranslateTips(i18n.language || 'en')}
                  disabled={isRetryingTips}
                >
                  {t('common.retry', 'Retry')}
                </button>
              </div>
            ) : (
              <p className="dr-empty-hint">{t('diagnose.noCauseSummary', 'No cause summary available.')}</p>
            )}
          </div>

          {/* Treatment Steps Card */}
          <div className="dr-card dr-section-card">
            <div className="dr-section-header">
              <h2 className="dr-section-title">{t('diagnose.treatmentStepsHeading', 'Actionable Treatment Steps')}</h2>
              <span className="dr-steps-count">{currentData.treatmentSteps.length} {t('diagnose.steps', 'steps')}</span>
            </div>

            {isRetryingTips && currentData.treatmentSteps.length <= 1 ? (
              <div className="dr-tips-loading-box">
                <div className="dr-tips-loading-spinner" />
                <span>{t('diagnose.generatingTreatmentSteps', 'Formulating actionable treatment steps with Gemini...')}</span>
              </div>
            ) : currentData.treatmentSteps.length > 0 ? (
              <div className="dr-steps-list">
                {currentData.treatmentSteps.map((step, idx) => (
                  <div key={idx} className="dr-step-item">
                    <span className="dr-step-number">{idx + 1}</span>
                    <div className="dr-step-text">{step}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="dr-empty-hint">{t('diagnose.noTreatmentSteps', 'No treatment steps recorded.')}</p>
            )}
          </div>

          {/* Prevention Tips Card */}
          <div className="dr-card dr-section-card">
            <div className="dr-section-header">
              <h2 className="dr-section-title">{t('diagnose.preventionTipsHeading', 'Long-Term Prevention Tips')}</h2>
            </div>

            {isRetryingTips && currentData.preventionTips.length === 0 ? (
              <div className="dr-tips-loading-box">
                <div className="dr-tips-loading-spinner" />
                <span>{t('diagnose.generatingPreventionTips', 'Compiling long-term prevention guidelines...')}</span>
              </div>
            ) : currentData.preventionTips.length > 0 ? (
              <div className="dr-tips-list">
                {currentData.preventionTips.map((tip, idx) => (
                  <div key={idx} className="dr-tip-item">
                    <span className="dr-tip-bullet" />
                    <div className="dr-tip-text">{tip}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="dr-empty-hint">{t('diagnose.noPreventionTips', 'No prevention tips available.')}</p>
            )}
          </div>

          {/* Bottom Action Footer */}
          <div className="dr-footer-actions">
            {onAddToSchedule && !isHealthy && (
              <button 
                type="button" 
                className="dr-schedule-btn"
                onClick={onAddToSchedule}
              >
                {t('diagnose.addToCareSchedule', 'Add Treatment to Care Schedule')}
              </button>
            )}

            <button 
              type="button" 
              className="dr-secondary-share-btn"
              onClick={handleShare}
            >
              {t('diagnose.shareReport', 'Share Report')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiseaseResult;
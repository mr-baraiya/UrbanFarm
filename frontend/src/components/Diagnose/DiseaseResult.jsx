import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNotification } from '../../hooks/useNotification';
import { retryGeminiTips, translateDiagnosisApi, toggleDiagnosisShare } from '../../services/plantService';
import { downloadDiagnosisPDF, generatePdfFileName } from '../../utils/pdfGenerator';
import { playReportNarration, stopReportNarration, isSpeechSupported } from '../../utils/reportAudioNarrator';
import {
  ArrowLeft,
  Calendar,
  Share2,
  FileDown,
  RotateCcw,
  Loader2,
  Volume2,
  VolumeX,
  Sparkles
} from 'lucide-react';
import './DiseaseResult.css';

// Data normalization for the 9 clinical agricultural sections
export const extractInitialData = (res) => {
  if (!res) return {};

  const observedSymptoms = Array.isArray(res.observedSymptoms) && res.observedSymptoms.length > 0
    ? res.observedSymptoms
    : (Array.isArray(res.symptoms) && res.symptoms.length > 0
      ? res.symptoms
      : []);

  const possibleCauses = Array.isArray(res.possibleCauses) && res.possibleCauses.length > 0
    ? res.possibleCauses
    : (Array.isArray(res.causes) && res.causes.length > 0
      ? res.causes
      : (res.cause ? [res.cause] : []));

  const immediateActions = Array.isArray(res.immediateActions) && res.immediateActions.length > 0
    ? res.immediateActions
    : (Array.isArray(res.treatmentSteps) && res.treatmentSteps.length > 0
      ? res.treatmentSteps
      : (Array.isArray(res.treatment_steps) && res.treatment_steps.length > 0
        ? res.treatment_steps
        : (res.treatment ? [res.treatment] : [])));

  const modernSolutions = Array.isArray(res.modernSolutions) && res.modernSolutions.length > 0
    ? res.modernSolutions
    : (Array.isArray(res.medicalSolutions) && res.medicalSolutions.length > 0
      ? res.medicalSolutions
      : (Array.isArray(res.medical_solutions) ? res.medical_solutions : []));

  const naturalSolutions = Array.isArray(res.naturalSolutions) && res.naturalSolutions.length > 0
    ? res.naturalSolutions
    : (Array.isArray(res.desiSolutions) && res.desiSolutions.length > 0
      ? res.desiSolutions
      : (Array.isArray(res.desi_solutions) ? res.desi_solutions : []));

  const preventionTips = Array.isArray(res.preventionTips) && res.preventionTips.length > 0
    ? res.preventionTips
    : (Array.isArray(res.prevention_tips) ? res.prevention_tips : []);

  const rawConf = res?.confidence ?? res?.confidenceScore ?? res?.confidence_score ?? res?.accuracy;
  const confidencePercentage = typeof rawConf === 'number'
    ? (rawConf <= 1 ? Math.round(rawConf * 100) : Math.round(rawConf))
    : 85;

  const rawSeverity = res?.severityLevel || res?.severity_level || (res?.isHealthy ? 'Healthy' : 'Moderate');
  const isHealthyCheck = Boolean(
    res?.isHealthy || 
    res?.is_healthy || 
    (res?.diseaseName || '').toLowerCase().includes('healthy') || 
    rawSeverity.toLowerCase() === 'healthy'
  );

  const severityPercentage = typeof res?.severityPercentage === 'number'
    ? res.severityPercentage
    : typeof res?.severity_percentage === 'number'
    ? res.severity_percentage
    : isHealthyCheck ? 0 : rawSeverity.toLowerCase().includes('severe') ? 75 : rawSeverity.toLowerCase().includes('mild') ? 20 : 40;

  return {
    plantName: res.plantName || res.plant_name || '',
    scientificName: res.scientificName || res.scientific_name || '',
    diseaseName: res.diseaseName || res.condition_name || res.disease || (isHealthyCheck ? 'Healthy Plant' : 'Condition Detected'),
    shortExplanation: res.shortExplanation || res.description || '',
    description: res.description || res.shortExplanation || '',
    observedSymptoms: observedSymptoms,
    possibleCauses: possibleCauses,
    cause: res.cause || (possibleCauses.length ? possibleCauses.join('. ') : ''),
    severityLevel: rawSeverity,
    severityPercentage: severityPercentage,
    damageIndex: severityPercentage,
    confidence: confidencePercentage,
    confidenceScore: confidencePercentage,
    confidencePercent: confidencePercentage,
    confidencePercentage: confidencePercentage,
    isHealthy: isHealthyCheck,
    severityDescription: res.severityDescription || res.severity_description || '',
    immediateActions: immediateActions,
    modernSolutions: modernSolutions,
    naturalSolutions: naturalSolutions,
    preventionTips: preventionTips,
    whenToContactExpert: res.whenToContactExpert || res.when_to_contact_expert || res.whenToSeekExpertHelp || res.when_to_seek_expert_help || '',
    noteIfUnsure: res.noteIfUnsure || res.note_if_unsure || ''
  };
};

export const detectTextLanguage = (res) => {
  if (!res) return 'en';
  const sample = [
    res.diseaseName,
    res.condition_name,
    res.disease,
    res.shortExplanation,
    res.description,
    res.plantName,
    res.plant_name,
    Array.isArray(res.observedSymptoms) ? res.observedSymptoms.join(' ') : (Array.isArray(res.symptoms) ? res.symptoms.join(' ') : ''),
    Array.isArray(res.possibleCauses) ? res.possibleCauses.join(' ') : (Array.isArray(res.causes) ? res.causes.join(' ') : ''),
    Array.isArray(res.immediateActions) ? res.immediateActions.join(' ') : (Array.isArray(res.treatmentSteps) ? res.treatmentSteps.join(' ') : ''),
    res.noteIfUnsure
  ].filter(Boolean).join(' ');

  if (!sample) return 'en';

  const gujMatches = sample.match(/[\u0A80-\u0AFF]/g) || [];
  const devMatches = sample.match(/[\u0900-\u097F]/g) || [];

  if (gujMatches.length > 5 || (gujMatches.length > devMatches.length && gujMatches.length > 0)) {
    return 'gu';
  }
  if (devMatches.length > 5 || (devMatches.length > gujMatches.length && devMatches.length > 0)) {
    return 'hi';
  }
  return 'en';
};

const DiseaseResult = ({ result, isHistory = false, onAddToSchedule, onClose, onBack }) => {
  const { t, i18n } = useTranslation();
  const { addNotification } = useNotification();
  const reportRef = useRef(null);
  const pdfTemplateRef = useRef(null);

  const diagnosisId = result?._id || result?.id;
  const initialShareId = result?.shareId || diagnosisId;

  // Check if image was classified as non-plant
  const isPlant = result?.isPlant !== false && result?.is_plant !== false;
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const [translationCache, setTranslationCache] = useState(() => {
    const init = {};
    if (result) {
      const origLang = detectTextLanguage(result);
      init[origLang] = extractInitialData(result);
      if (result.translations) {
        Object.keys(result.translations).forEach((k) => {
          const val = result.translations[k];
          if (val) init[k] = extractInitialData(val);
        });
      }
    }
    return init;
  });

  const [currentData, setCurrentData] = useState(() => {
    const activeAppLang = i18n.language || 'en';
    const origLang = detectTextLanguage(result);
    if (result?.translations?.[activeAppLang]) {
      return extractInitialData(result.translations[activeAppLang]);
    }
    if (activeAppLang === origLang) {
      return extractInitialData(result);
    }
    return extractInitialData(result);
  });
  const [currentLang, setCurrentLang] = useState(i18n.language || 'en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState(null);

  const [isRetryingTips, setIsRetryingTips] = useState(false);
  const [tipsError, setTipsError] = useState(null);

  const [isPublic, setIsPublic] = useState(result?.isPublic || false);
  const [shareId, setShareId] = useState(initialShareId);
  const [isTogglingShare, setIsTogglingShare] = useState(false);

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSpokenSentence, setCurrentSpokenSentence] = useState('');

  // Stop speech narration when component unmounts
  useEffect(() => {
    return () => {
      stopReportNarration();
    };
  }, []);

  // Stop narration if user switches report or language
  useEffect(() => {
    stopReportNarration();
    setIsSpeaking(false);
    setCurrentSpokenSentence('');
  }, [diagnosisId, currentLang, i18n.language]);

  const handleLanguageSwitch = async (targetLang, customCache = null) => {
    if (!targetLang) return;
    const cacheToUse = customCache || translationCache;
    const origLang = detectTextLanguage(result);

    // Check if translation is already cached
    const cachedItem = cacheToUse?.[targetLang];
    if (cachedItem && (cachedItem.diseaseName || cachedItem.plantName)) {
      setCurrentData(cachedItem);
      setCurrentLang(targetLang);
      setIsTranslating(false);
      return;
    }

    // If target matches original document language
    if (targetLang === origLang && result) {
      const origData = extractInitialData(result);
      setTranslationCache(prev => ({ ...prev, [origLang]: origData }));
      setCurrentData(origData);
      setCurrentLang(origLang);
      setIsTranslating(false);
      return;
    }

    setIsTranslating(true);
    setTranslationError(null);

    try {
      if (diagnosisId) {
        const transRes = await translateDiagnosisApi(diagnosisId, targetLang);
        const translationPayload = transRes?.translation || transRes?.data || transRes;
        if (translationPayload && (translationPayload.diseaseName || translationPayload.plantName || translationPayload.description)) {
          const transExtracted = extractInitialData(translationPayload);
          setTranslationCache(prev => ({ ...prev, [targetLang]: transExtracted }));
          setCurrentData(transExtracted);
          setCurrentLang(targetLang);
          return;
        }
      }
      setCurrentLang(targetLang);
    } catch (err) {
      console.error('Translation error:', err);
      setTranslationError(t('diagnose.translationFailed', 'Failed to translate report.'));
    } finally {
      setIsTranslating(false);
    }
  };

  useEffect(() => {
    if (result) {
      const activeAppLang = i18n.language || 'en';
      const origLang = detectTextLanguage(result);
      const extracted = extractInitialData(result);
      setIsPublic(result.isPublic || false);
      setShareId(result.shareId || result._id || result.id);

      const newCache = { [origLang]: extracted };
      if (result.translations) {
        Object.keys(result.translations).forEach((k) => {
          const val = result.translations[k];
          if (val) newCache[k] = extractInitialData(val);
        });
      }
      setTranslationCache(newCache);

      // Check if translation for active language is already available
      const existingLangTrans = newCache[activeAppLang];
      if (existingLangTrans && (existingLangTrans.diseaseName || existingLangTrans.plantName)) {
        setCurrentData(existingLangTrans);
        setCurrentLang(activeAppLang);
        setIsTranslating(false);
      } else if (diagnosisId && activeAppLang !== origLang && isPlant) {
        handleLanguageSwitch(activeAppLang, newCache);
      } else {
        setCurrentData(extracted);
        setCurrentLang(activeAppLang);
        setIsTranslating(false);
      }
    }
  }, [result]);

  const rawConfidence = result?.confidence ?? result?.confidence_score ?? result?.accuracy;
  const confidencePercent = typeof rawConfidence === 'number'
    ? (rawConfidence <= 1 ? Math.round(rawConfidence * 100) : Math.round(rawConfidence))
    : 85;

  const isHealthy = result?.isHealthy || 
                    currentData.diseaseName?.toLowerCase().includes('healthy') ||
                    currentData.severityLevel?.toLowerCase() === 'healthy';

  const severityNorm = (currentData.severityLevel || '').toLowerCase();
  const severityDisplayLabel = isHealthy 
    ? t('diagnose.severityHealthy', 'Healthy / Optimal') 
    : severityNorm.includes('severe')
    ? t('diagnose.severitySevere', 'Severe (Critical)')
    : severityNorm.includes('mild')
    ? t('diagnose.severityMild', 'Mild (Early Stage)')
    : t('diagnose.severityModerate', 'Moderate (Spread)');

  const severityBadgeClass = isHealthy 
    ? 'severity-badge-healthy' 
    : severityNorm.includes('severe')
    ? 'severity-badge-severe'
    : severityNorm.includes('mild')
    ? 'severity-badge-mild'
    : 'severity-badge-moderate';

  const confidenceBadgeClass = confidencePercent >= 80 
    ? 'confidence-high' 
    : confidencePercent >= 60 
    ? 'confidence-med' 
    : 'confidence-low';

  const confidenceBadgeLabel = confidencePercent >= 80 
    ? t('diagnose.highConfidence', 'High Accuracy') 
    : confidencePercent >= 60 
    ? t('diagnose.medConfidence', 'Moderate Accuracy') 
    : t('diagnose.lowConfidence', 'Low Accuracy');

  useEffect(() => {
    const activeAppLang = i18n.language || 'en';
    if (activeAppLang !== currentLang && isPlant) {
      handleLanguageSwitch(activeAppLang);
    }
  }, [i18n.language]);

  const handleGenerateAndTranslateTips = async (targetLang = currentLang) => {
    if (!diagnosisId) return;
    setIsRetryingTips(true);
    setTipsError(null);

    try {
      const response = await retryGeminiTips(diagnosisId, targetLang);
      if (response?.data) {
        const updated = extractInitialData(response.data);
        setCurrentData(updated);
        addNotification(t('diagnose.tipsUpdated', 'Clinical recommendations regenerated!'), 'success');
      }
    } catch (err) {
      console.error('Regenerate tips error:', err);
      setTipsError(t('diagnose.tipsRegenerateFailed', 'Could not regenerate treatment tips.'));
    } finally {
      setIsRetryingTips(false);
    }
  };

  const handleToggleShare = async () => {
    if (!diagnosisId) return;
    setIsTogglingShare(true);
    try {
      const response = await toggleDiagnosisShare(diagnosisId);
      if (response?.data) {
        setIsPublic(response.data.isPublic);
        setShareId(response.data.shareId || diagnosisId);
      }
    } catch (err) {
      console.error('Toggle share error:', err);
      addNotification(t('diagnose.shareToggleFailed', 'Failed to update share status.'), 'error');
    } finally {
      setIsTogglingShare(false);
    }
  };

  const handleDownloadPDF = async () => {
    const targetElement = pdfTemplateRef.current || reportRef.current;
    if (!targetElement) return;
    setIsDownloadingPdf(true);
    try {
      const fileName = generatePdfFileName(
        currentData.plantName || result?.plantName,
        currentData.diseaseName || currentData.disease || result?.diseaseName || result?.disease,
        result?.createdAt || new Date()
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
    const publicUrl = `${window.location.origin}/d/${shareId}`;
    const shareTitle = `UrbanFarm Plant Diagnosis: ${currentData.diseaseName}`;
    const shareText = `Botanical Health Report: ${currentData.diseaseName} (${confidencePercent}% confidence). View treatment & prevention:`;

    if (!isPublic) {
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

  const handleToggleSpeech = () => {
    if (!isSpeechSupported()) {
      addNotification(t('diagnose.speechNotSupported', 'Audio speech is not supported in this browser.'), 'warning');
      return;
    }

    if (isSpeaking) {
      stopReportNarration();
      setIsSpeaking(false);
      setCurrentSpokenSentence('');
      addNotification(t('diagnose.stopAudio', 'Audio stopped.'), 'info');
    } else {
      const activeLang = currentLang || i18n.language || 'en';
      const narrativeData = {
        ...currentData,
        confidence: confidencePercent,
        confidencePercent: confidencePercent,
        confidencePercentage: confidencePercent,
        confidenceScore: confidencePercent,
        severityPercentage: typeof currentData.severityPercentage === 'number'
          ? currentData.severityPercentage
          : typeof currentData.damageIndex === 'number'
          ? currentData.damageIndex
          : (isHealthy ? 0 : severityNorm.includes('severe') ? 75 : severityNorm.includes('mild') ? 20 : 40),
        severityLevel: currentData.severityLevel || (isHealthy ? 'Healthy' : 'Moderate'),
        severityDisplayLabel: severityDisplayLabel,
        isHealthy: isHealthy
      };
      playReportNarration(narrativeData, activeLang, {
        onStart: () => {
          setIsSpeaking(true);
          addNotification(t('diagnose.readingReport', 'Reading report aloud...'), 'info');
        },
        onEnd: () => {
          setIsSpeaking(false);
          setCurrentSpokenSentence('');
        },
        onError: (err) => {
          setIsSpeaking(false);
          setCurrentSpokenSentence('');
          console.warn('Speech playback notice:', err);
        },
        onSentence: (sentence) => {
          setCurrentSpokenSentence(sentence);
        }
      });
    }
  };

  // Case 1: Non-plant image detected banner
  if (!isPlant) {
    return (
      <div className="disease-result-fullpage non-plant-fullpage">
        <div className="dr-topbar">
          <div className="dr-topbar-left">
            <button 
              type="button" 
              className="dr-back-btn" 
              onClick={onBack || onClose}
            >
              <ArrowLeft size={16} />
              <span>{t('diagnose.backToScanner', 'Back to Scanner')}</span>
            </button>
          </div>
        </div>

        <div className="non-plant-card">
          <h2 className="non-plant-title">{t('diagnose.notPlantError', "This doesn't look like a plant image")}</h2>
          <p className="non-plant-desc">
            {t('diagnose.notPlantDetail', "Our AI pathology vision engine detected that the uploaded image is not a plant, leaf, flower, fruit or crop. Please upload a clear photo of a plant in natural daylight.")}
          </p>
          <div className="non-plant-actions">
            <button 
              type="button" 
              className="btn btn-primary non-plant-retry-btn"
              onClick={onBack || onClose}
            >
              <RotateCcw size={17} />
              <span>{t('diagnose.analyzeAnother', 'Analyze another image')}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Case 2: Plant detected - display clinical dossier report
  return (
    <div className="disease-result-fullpage">
      {/* Top Navigation & Action Header */}
      <div className="dr-topbar">
        <div className="dr-topbar-left">
          <button 
            type="button" 
            className="dr-back-btn" 
            onClick={onBack || onClose}
          >
            <ArrowLeft size={16} />
            <span>{t('diagnose.backToScanner', 'Back to Scanner')}</span>
          </button>
          <span className="dr-report-badge">
            {isHistory ? t('diagnose.historyReport', 'Archived Report') : t('diagnose.newReport', 'Active Diagnosis')}
          </span>
        </div>

        <div className="dr-topbar-right">
          {/* Audio Narration Button */}
          <button 
            type="button" 
            className={`dr-audio-btn ${isSpeaking ? 'active-speaking' : ''}`}
            onClick={handleToggleSpeech}
            disabled={isTranslating}
            title={isSpeaking ? t('diagnose.stopAudio', 'Stop Audio') : t('diagnose.listenReport', 'Listen to Report')}
            aria-label={isSpeaking ? 'Stop Audio Report' : 'Listen to Report'}
          >
            {isSpeaking ? (
              <>
                <VolumeX size={16} className="dr-speaker-icon dr-pulse-speaker" />
                <span>{t('diagnose.stopAudio', 'Stop Audio')}</span>
              </>
            ) : (
              <>
                <Volume2 size={16} className="dr-speaker-icon" />
                <span>{t('diagnose.listenReport', 'Listen Report')}</span>
              </>
            )}
          </button>

          <button 
            type="button" 
            className="dr-pdf-btn" 
            onClick={handleDownloadPDF}
            disabled={isDownloadingPdf || isTranslating}
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
            disabled={isTranslating}
          >
            <Share2 size={16} />
            <span>{t('diagnose.shareReport', 'Share Report')}</span>
          </button>
        </div>
      </div>

      {/* Live Audio Narration Bar */}
      {isSpeaking && currentSpokenSentence && (
        <div className="dr-live-narration-banner">
          <div className="dr-audio-waveform">
            <span className="sw-bar b1" />
            <span className="sw-bar b2" />
            <span className="sw-bar b3" />
            <span className="sw-bar b4" />
          </div>
          <div className="dr-narration-content">
            <span className="dr-narration-tag">{t('diagnose.readingReport', 'Reading report aloud...')}</span>
            <p className="dr-narration-sentence">"{currentSpokenSentence}"</p>
          </div>
          <button 
            type="button" 
            className="dr-stop-narration-btn" 
            onClick={handleToggleSpeech}
            title={t('diagnose.stopAudio', 'Stop Audio')}
          >
            {t('diagnose.stopAudio', 'Stop Audio')}
          </button>
        </div>
      )}

      {/* Translation Error (if any) */}
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

      {/* Uncertainty Notice if Low Confidence or Unsure Note */}
      {currentData.noteIfUnsure && !isTranslating && (
        <div className="dr-notice-banner dr-notice-unsure">
          <div className="dr-notice-text">
            <strong>{t('diagnose.noteIfUnsure', 'Photo & Diagnostic Note')}:</strong> {currentData.noteIfUnsure}
          </div>
        </div>
      )}

      {/* Translation State Loader vs Fully Translated Report Area */}
      {isTranslating ? (
        <div className="dr-translating-overlay-container">
          <div className="dr-card dr-translating-card">
            <div className="dr-translating-anim-box">
              <div className="dr-translating-pulse-halo" />
              <div className="dr-translating-icon-orb">
                <Sparkles size={34} className="dr-translating-sparkle-spin" />
              </div>
            </div>

            <div className="dr-translating-lang-badge">
              <span className="dr-translating-pulse-dot" />
              <span>
                {i18n.language === 'gu'
                  ? 'ગુજરાતી અનુવાદ'
                  : i18n.language === 'hi'
                  ? 'हिन्दी अनुवाद'
                  : t('diagnose.translatingEngine', 'Gemini AI Multilingual Engine')}
              </span>
            </div>

            <h2 className="dr-translating-main-title">
              {t('diagnose.translatingTitle', 'Translating Diagnosis Report...')}
            </h2>

            <p className="dr-translating-main-desc">
              {t(
                'diagnose.translatingSub',
                'Translating clinical findings, symptoms, causes, remedies and prevention advice...'
              )}
            </p>

            <div className="dr-translating-progress-track">
              <div className="dr-translating-progress-bar" />
            </div>

            <div className="dr-translating-pill-pills">
              <span className="dr-trans-pill">{t('diagnose.section1Title', 'Diagnosis')}</span>
              <span className="dr-trans-pill">{t('diagnose.section2Title', 'Observed Symptoms')}</span>
              <span className="dr-trans-pill">{t('diagnose.section5Title', 'Immediate Action')}</span>
              <span className="dr-trans-pill">{t('diagnose.section8Title', 'Prevention')}</span>
            </div>

            <div className="dr-translating-model-tag">
              <span className="dr-ai-spark-tag">{t('diagnose.translatingWithGemini', 'Translating diagnosis with Gemini AI...')}</span>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Printable Area Wrapper for PDF & Screen */}
          <div ref={reportRef} className="dr-report-printable-area">
        {/* ========================================================================= */}
        {/* HERO SECTION 1: Diagnosis & Specimen Media Banner */}
        {/* ========================================================================= */}
        <div className="dr-card dr-hero-dossier-card">
          <div className="dr-hero-grid">
            {/* Left: Specimen Image Box */}
            <div className="dr-hero-media">
              {result?.imageUrl ? (
                <img 
                  src={result.imageUrl} 
                  alt={currentData.diseaseName} 
                  className="dr-hero-image" 
                />
              ) : (
                <div className="dr-no-image-placeholder">
                  <span>{t('diagnose.noImageAvailable', 'Specimen Leaf Image')}</span>
                </div>
              )}

              <div className="dr-hero-media-tags">
                <span className={`dr-pill-tag ${isHealthy ? 'healthy' : confidencePercent > 70 ? 'critical' : 'warning'}`}>
                  {isHealthy ? t('diagnose.healthy', 'Healthy') : t('diagnose.issueDetected', 'Issue Detected')}
                </span>
              </div>
            </div>

            {/* Right: Section 1 Clinical Diagnosis */}
            <div className="dr-hero-info">
              <div className="dr-hero-top-row">
                <div className="dr-section-badge section-1-badge">
                  <span>{t('diagnose.section1Title', 'Diagnosis')}</span>
                </div>

                {(currentData.plantName || currentData.scientificName || result?.plantId?.name) && (
                  <div className="dr-plant-pill">
                    <span>{currentData.plantName || result?.plantId?.name}</span>
                    {currentData.scientificName && (
                      <em className="dr-pill-sci-name"> ({currentData.scientificName})</em>
                    )}
                  </div>
                )}
              </div>

              <h1 className="dr-hero-title">{currentData.diseaseName}</h1>

              {(currentData.shortExplanation || currentData.description) && (
                <p className="dr-hero-explanation">{currentData.shortExplanation || currentData.description}</p>
              )}

              {/* Hero Key Metrics Strip */}
              <div className="dr-hero-vitals-strip">
                <div className="dr-vital-item">
                  <span className="dr-vital-label">{isHealthy ? t('diagnose.healthScore', 'Plant Vitality') : t('diagnose.damageIndex', 'Damage Index')}:</span>
                  <span className={`dr-vital-val ${isHealthy ? 'text-healthy' : severityNorm.includes('severe') ? 'text-severe' : 'text-moderate'}`}>
                    {isHealthy ? '100% (Optimal)' : `${currentData.severityPercentage || (severityNorm.includes('severe') ? 80 : severityNorm.includes('mild') ? 20 : 50)}%`}
                  </span>
                </div>
                <span className="dr-vital-divider">•</span>
                <div className="dr-vital-item">
                  <span className="dr-vital-label">{t('diagnose.section4Title', 'Severity')}:</span>
                  <span className="dr-vital-val">{severityDisplayLabel}</span>
                </div>
                <span className="dr-vital-divider">•</span>
                <div className="dr-vital-item">
                  <span className="dr-vital-label">{t('diagnose.healthStatus', 'Assessment')}:</span>
                  <span className="dr-vital-val">{isHealthy ? t('diagnose.healthy', 'Healthy') : t('diagnose.issueDetected', 'Issue Detected')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ROW 1: Clinical Observation & Causes */}
        {/* ========================================================================= */}
        <div className="dr-dashboard-row dr-two-col-grid">
          {/* SECTION 2: Observed Symptoms */}
          <div className="dr-card dr-section-card dr-symptoms-card">
            <div className="dr-section-header">
              <h2 className="dr-section-title">
                {t('diagnose.section2Title', 'Observed Symptoms')}
              </h2>
              {currentData.observedSymptoms && currentData.observedSymptoms.length > 0 && (
                <span className="dr-steps-count">{currentData.observedSymptoms.length} {t('diagnose.signs', 'signs')}</span>
              )}
            </div>

            {currentData.observedSymptoms && currentData.observedSymptoms.length > 0 ? (
              <ul className="dr-bullet-list">
                {currentData.observedSymptoms.map((symptom, idx) => (
                  <li key={idx} className="dr-bullet-item symptom-bullet-item">
                    <span className="dr-symptom-dot" />
                    <span>{symptom}</span>
                  </li>
                ))}
              </ul>
            ) : isHealthy ? (
              <div className="dr-healthy-state-box">
                <span>{t('diagnose.healthySymptomsDesc', 'No visible spots, wilting, curling, mold, or insect infestation detected. Leaves and tissues exhibit healthy turgidity and coloration.')}</span>
              </div>
            ) : (
              <p className="dr-empty-hint">{t('diagnose.noSymptomsSummary', 'No specific visual symptoms listed.')}</p>
            )}
          </div>

          {/* SECTION 3: Possible Cause */}
          <div className="dr-card dr-section-card dr-causes-card">
            <div className="dr-section-header">
              <h2 className="dr-section-title">
                {t('diagnose.section3Title', 'Possible Cause')}
              </h2>
            </div>

            {isRetryingTips ? (
              <div className="dr-tips-loading-box">
                <div className="dr-tips-loading-spinner" />
                <span>{t('diagnose.generatingTipsWithGemini', 'Analyzing pathological causes with Gemini...')}</span>
              </div>
            ) : currentData.possibleCauses && currentData.possibleCauses.length > 0 ? (
              <div className="dr-causes-list">
                {currentData.possibleCauses.map((c, idx) => (
                  <div key={idx} className="dr-cause-item">
                    <span className="dr-cause-bullet">•</span>
                    <span>{c}</span>
                  </div>
                ))}
              </div>
            ) : isHealthy ? (
              <div className="dr-healthy-state-box">
                <span>{t('diagnose.healthyCausesDesc', 'Optimal growing conditions, balanced soil moisture, adequate sunlight, and proper nutrient supply.')}</span>
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
              <p className="dr-empty-hint">{t('diagnose.noCauseSummary', 'No specific stress factor recorded.')}</p>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ROW 2: Prognosis & Emergency First Aid */}
        {/* ========================================================================= */}
        <div className="dr-dashboard-row dr-two-col-grid">
          {/* SECTION 4: Severity & Damage Index */}
          <div className="dr-card dr-section-card dr-severity-card">
            <div className="dr-section-header">
              <h2 className="dr-section-title">
                {t('diagnose.section4Title', 'Severity')}
              </h2>
              <span className={`dr-severity-status-pill ${severityBadgeClass}`}>
                {severityDisplayLabel}
              </span>
            </div>

            <div className="dr-severity-body">
              <p className="dr-severity-desc-text">
                {currentData.severityDescription || (isHealthy ? t('diagnose.healthyDesc', 'The plant is in optimal physiological health with no pathogen infection or pest activity.') : '')}
              </p>
            </div>
          </div>

          {/* SECTION 5: Immediate Action (First Aid) */}
          <div className="dr-card dr-section-card dr-immediate-card">
            <div className="dr-section-header">
              <h2 className="dr-section-title dr-immediate-title">
                {t('diagnose.section5Title', 'Immediate Action')}
              </h2>
              <span className="dr-urgent-badge">
                {isHealthy ? t('diagnose.healthyCareRoutine', 'Daily Maintenance') : t('diagnose.firstAid', 'First Aid')}
              </span>
            </div>

            {isRetryingTips && (!currentData.immediateActions || currentData.immediateActions.length <= 1) ? (
              <div className="dr-tips-loading-box">
                <div className="dr-tips-loading-spinner" />
                <span>{t('diagnose.generatingTreatmentSteps', 'Formulating urgent immediate actions with Gemini...')}</span>
              </div>
            ) : currentData.immediateActions && currentData.immediateActions.length > 0 ? (
              <div className="dr-steps-list">
                {currentData.immediateActions.map((step, idx) => (
                  <div key={idx} className="dr-step-item immediate-step">
                    <span className="dr-step-number immediate-num">{idx + 1}</span>
                    <div className="dr-step-text">{step}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="dr-empty-hint">{t('diagnose.noTreatmentSteps', 'No immediate action steps recorded.')}</p>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ROW 3: Dual Treatment Matrix */}
        {/* ========================================================================= */}
        <div className="dr-dashboard-row dr-two-col-grid">
          {/* SECTION 6: Modern Solution (Scientific & Agricultural) */}
          <div className="dr-card dr-section-card dr-remedy-card dr-medical-card">
            <div className="dr-section-header">
              <h2 className="dr-section-title dr-medical-title">
                {t('diagnose.section6Title', 'Modern Solution')}
              </h2>
              <span className="dr-badge-chemical">
                {t('diagnose.targetedControl', 'Active Formulations')}
              </span>
            </div>
            <p className="dr-remedy-subtext">
              {t('diagnose.modernSubtext', 'Scientifically approved fungicides, pesticides, bio-controls or fertilizers with active ingredients:')}
            </p>
            {currentData.modernSolutions && currentData.modernSolutions.length > 0 ? (
              <div className="dr-remedy-grid">
                {currentData.modernSolutions.map((chem, idx) => (
                  <div key={idx} className="dr-remedy-box medical-item">
                    <div className="dr-remedy-badge">
                      <span>{t('diagnose.chemicalFungicide', 'Formulation')} #{idx + 1}</span>
                    </div>
                    <div className="dr-remedy-body">{chem}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="dr-empty-hint">{t('diagnose.noTreatmentAvailable', 'No chemical treatments required.')}</p>
            )}
          </div>

          {/* SECTION 7: Natural Solution (Traditional & Organic) */}
          <div className="dr-card dr-section-card dr-remedy-card dr-desi-card">
            <div className="dr-section-header">
              <h2 className="dr-section-title dr-desi-title">
                {t('diagnose.section7Title', 'Natural Solution')}
              </h2>
              <span className="dr-badge-natural">
                {t('diagnose.naturalOrganic', '100% Organic')}
              </span>
            </div>
            <p className="dr-remedy-subtext">
              {t('diagnose.naturalSubtext', 'Traditional Indian farm/kitchen recipes, neem preparations, and organic solutions with exact measurements:')}
            </p>
            {currentData.naturalSolutions && currentData.naturalSolutions.length > 0 ? (
              <div className="dr-remedy-grid">
                {currentData.naturalSolutions.map((remedy, idx) => (
                  <div key={idx} className="dr-remedy-box desi-item">
                    <div className="dr-remedy-badge">
                      <span>{t('diagnose.remedy', 'Recipe')} #{idx + 1}</span>
                    </div>
                    <div className="dr-remedy-body">{remedy}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="dr-empty-hint">{t('diagnose.noTreatmentAvailable', 'No natural remedies required.')}</p>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ROW 4: Prevention & Escalation */}
        {/* ========================================================================= */}
        <div className="dr-dashboard-row dr-two-col-grid">
          {/* SECTION 8: Prevention */}
          <div className="dr-card dr-section-card dr-prevention-card">
            <div className="dr-section-header">
              <h2 className="dr-section-title">
                {t('diagnose.section8Title', 'Prevention')}
              </h2>
            </div>

            {isRetryingTips && (!currentData.preventionTips || currentData.preventionTips.length === 0) ? (
              <div className="dr-tips-loading-box">
                <div className="dr-tips-loading-spinner" />
                <span>{t('diagnose.generatingPreventionTips', 'Compiling long-term prevention guidelines...')}</span>
              </div>
            ) : currentData.preventionTips && currentData.preventionTips.length > 0 ? (
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

          {/* SECTION 9: When to Contact Expert */}
          <div className="dr-card dr-section-card dr-expert-card">
            <div className="dr-section-header">
              <h2 className="dr-section-title">
                {t('diagnose.section9Title', 'When to Contact Expert')}
              </h2>
            </div>
            <p className="dr-section-body">
              {currentData.whenToContactExpert || t('diagnose.expertHelpGuideline', 'If disease spreads rapidly to over 30% of the crop, or if systemic wilting occurs despite treatment, consult your local Krishi Vigyan Kendra (KVK) or agricultural extension officer immediately.')}
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DEDICATED 1-PAGE A4 PDF PRINT DOSSIER TEMPLATE (Captured by PDF Generator) */}
      {/* ========================================================================= */}
      <div ref={pdfTemplateRef} className="dr-dedicated-pdf-sheet">
        {/* Lab Header */}
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
            <div className="pdf-meta-id">Report ID: #UF-{(diagnosisId || 'AUTO').toString().slice(-6).toUpperCase()}</div>
            <div className={`pdf-meta-pill ${isHealthy ? 'healthy' : 'issue'}`}>
              {isHealthy ? t('diagnose.healthy', 'Healthy') : t('diagnose.issueDetected', 'Issue Detected')}
            </div>
          </div>
        </div>

        {/* Section: Diagnosis (Hero Card) */}
        <div className="pdf-card pdf-hero-card">
          <div className="pdf-hero-layout">
            {result?.imageUrl ? (
              <img src={result.imageUrl} alt={currentData.diseaseName} className="pdf-specimen-img" />
            ) : (
              <div className="pdf-no-img">Specimen Leaf Photo</div>
            )}
            <div className="pdf-hero-details">
              <div className="pdf-hero-headline-row">
                <span className="pdf-section-tag">{t('diagnose.section1Title', 'Diagnosis')}</span>
                {(currentData.plantName || currentData.scientificName || result?.plantId?.name) && (
                  <span className="pdf-plant-tag">
                    {currentData.plantName || result?.plantId?.name}
                    {currentData.scientificName && <em> ({currentData.scientificName})</em>}
                  </span>
                )}
              </div>
              <div className="pdf-disease-title">{currentData.diseaseName}</div>
              {(currentData.shortExplanation || currentData.description) && (
                <div className="pdf-disease-desc">{currentData.shortExplanation || currentData.description}</div>
              )}
              <div className="pdf-vitals-row">
                <div className="pdf-vital-box">
                  <span className="pdf-vital-lbl">{isHealthy ? t('diagnose.healthScore', 'Plant Vitality') : t('diagnose.damageIndex', 'Damage Index')}:</span>
                  <span className="pdf-vital-val">{isHealthy ? '100% (Optimal)' : `${currentData.severityPercentage || (severityNorm.includes('severe') ? 80 : severityNorm.includes('mild') ? 20 : 50)}%`}</span>
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

        {/* Row 1: Observed Symptoms & Possible Cause */}
        <div className="pdf-row-2col">
          <div className="pdf-card">
            <div className="pdf-card-title-row">
              <span className="pdf-card-title">{t('diagnose.section2Title', 'Observed Symptoms')}</span>
              {currentData.observedSymptoms?.length > 0 && (
                <span className="pdf-counter-badge">{currentData.observedSymptoms.length} {t('diagnose.signs', 'signs')}</span>
              )}
            </div>
            {currentData.observedSymptoms?.length > 0 ? (
              <ul className="pdf-bullet-list">
                {currentData.observedSymptoms.map((s, i) => (
                  <li key={i}><span className="pdf-bullet-dot" /><span>{s}</span></li>
                ))}
              </ul>
            ) : isHealthy ? (
              <div className="pdf-healthy-notice">{t('diagnose.healthySymptomsDesc', 'No disease spots or insect damage observed.')}</div>
            ) : (
              <div className="pdf-empty-text">{t('diagnose.noSymptomsSummary', 'No symptoms noted.')}</div>
            )}
          </div>

          <div className="pdf-card">
            <div className="pdf-card-title-row">
              <span className="pdf-card-title">{t('diagnose.section3Title', 'Possible Cause')}</span>
            </div>
            {currentData.possibleCauses?.length > 0 ? (
              <ul className="pdf-bullet-list">
                {currentData.possibleCauses.map((c, i) => (
                  <li key={i}><span className="pdf-bullet-dot" /><span>{c}</span></li>
                ))}
              </ul>
            ) : isHealthy ? (
              <div className="pdf-healthy-notice">{t('diagnose.healthyCausesDesc', 'Optimal growing conditions and balanced nutrition.')}</div>
            ) : (
              <div className="pdf-empty-text">{currentData.cause || t('diagnose.noCauseSummary', 'No specific causes listed.')}</div>
            )}
          </div>
        </div>

        {/* Row 2: Severity Assessment & Immediate Action (First Aid) */}
        <div className="pdf-row-2col">
          <div className="pdf-card">
            <div className="pdf-card-title-row">
              <span className="pdf-card-title">{t('diagnose.section4Title', 'Severity')}</span>
              <span className="pdf-severity-pill">{severityDisplayLabel}</span>
            </div>
            <div className="pdf-severity-text">
              {currentData.severityDescription || (isHealthy ? t('diagnose.healthyDesc', 'The plant is in optimal physiological health.') : '')}
            </div>
          </div>

          <div className="pdf-card">
            <div className="pdf-card-title-row">
              <span className="pdf-card-title">{t('diagnose.section5Title', 'Immediate Action')}</span>
              <span className="pdf-urgent-pill">{t('diagnose.firstAid', 'First Aid')}</span>
            </div>
            {currentData.immediateActions?.length > 0 ? (
              <div className="pdf-steps-list">
                {currentData.immediateActions.map((act, i) => (
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

        {/* Row 3: Modern Solution & Natural Solution */}
        <div className="pdf-row-2col">
          <div className="pdf-card">
            <div className="pdf-card-title-row">
              <span className="pdf-card-title">{t('diagnose.section6Title', 'Modern Solution')}</span>
              <span className="pdf-control-pill">{t('diagnose.targetedControl', 'Active Formulations')}</span>
            </div>
            <div className="pdf-sub-guide">{t('diagnose.modernSubtext', 'Scientifically approved fungicides & pesticides:')}</div>
            {currentData.modernSolutions?.length > 0 ? (
              <div className="pdf-remedies-list">
                {currentData.modernSolutions.map((chem, i) => (
                  <div key={i} className="pdf-remedy-item">
                    <span className="pdf-remedy-num">{t('diagnose.chemicalFungicide', 'Formulation')} #{i + 1}:</span>
                    <span className="pdf-remedy-txt">{chem}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="pdf-empty-text">{t('diagnose.noTreatmentAvailable', 'No chemical control required.')}</div>
            )}
          </div>

          <div className="pdf-card">
            <div className="pdf-card-title-row">
              <span className="pdf-card-title">{t('diagnose.section7Title', 'Natural Solution')}</span>
              <span className="pdf-organic-pill">{t('diagnose.naturalOrganic', '100% Organic')}</span>
            </div>
            <div className="pdf-sub-guide">{t('diagnose.naturalSubtext', 'Traditional Indian farm recipes & neem solutions:')}</div>
            {currentData.naturalSolutions?.length > 0 ? (
              <div className="pdf-remedies-list">
                {currentData.naturalSolutions.map((nat, i) => (
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

        {/* Row 4: Prevention & When to Contact Expert */}
        <div className="pdf-row-2col">
          <div className="pdf-card">
            <div className="pdf-card-title-row">
              <span className="pdf-card-title">{t('diagnose.section8Title', 'Prevention')}</span>
            </div>
            {currentData.preventionTips?.length > 0 ? (
              <ul className="pdf-bullet-list">
                {currentData.preventionTips.map((tip, i) => (
                  <li key={i}><span className="pdf-bullet-dot" /><span>{tip}</span></li>
                ))}
              </ul>
            ) : (
              <div className="pdf-empty-text">{t('diagnose.noPreventionTips', 'No prevention tips listed.')}</div>
            )}
          </div>

          <div className="pdf-card">
            <div className="pdf-card-title-row">
              <span className="pdf-card-title">{t('diagnose.section9Title', 'When to Contact Expert')}</span>
            </div>
            <div className="pdf-expert-text">
              {currentData.whenToContactExpert || t('diagnose.expertHelpGuideline', 'If disease spreads to >30% of crop, consult your local Krishi Vigyan Kendra (KVK).')}
            </div>
          </div>
        </div>

        {/* Lab Signature Footer */}
        <div className="pdf-sheet-footer">
          <span className="pdf-footer-left">UrbanFarm AI Pathology Intelligence • Clinical Single-Page Diagnostic Dossier • www.urbanfarm.app</span>
          <span className="pdf-footer-right">Page 1 of 1 • 100% Certified Agronomy Standard</span>
        </div>
      </div>

        {/* Floating Bottom Action Dock */}
        <div className="dr-bottom-dock">
          <div className="dr-dock-left-group">
            {onAddToSchedule && !isHealthy && (
              <button 
                type="button" 
                className="dr-schedule-btn" 
                onClick={() => onAddToSchedule({ ...result, ...currentData })}
              >
                <Calendar size={16} />
                <span>{t('diagnose.addToCareSchedule', 'Add Treatment to Care Schedule')}</span>
              </button>
            )}

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
            <button 
              type="button" 
              className="dr-rescan-btn" 
              onClick={onBack || onClose}
            >
              <RotateCcw size={16} />
              <span>{t('diagnose.analyzeAnother', 'Analyze another image')}</span>
            </button>
          </div>
        </div>
        </>
      )}
    </div>
  );
};

export default DiseaseResult;
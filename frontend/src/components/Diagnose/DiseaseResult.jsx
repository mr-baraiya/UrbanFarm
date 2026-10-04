import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  RiMicroscopeLine, 
  RiFileList3Line, 
  RiCheckLine, 
  RiAlertLine, 
  RiCalendarEventLine, 
  RiDownload2Line, 
  RiShareLine, 
  RiFileTextLine, 
  RiMedicineBottleLine, 
  RiShieldCheckLine, 
  RiSparklingLine,
  RiCloseLine,
  RiFileCopyLine,
  RiWhatsappLine,
  RiShareForwardLine,
  RiQrCodeLine
} from 'react-icons/ri';
import { useNotification } from '../../hooks/useNotification';
import { getConfidenceEmoji } from '../../utils/helpers';
import { getLocalizedDynamicText } from '../../utils/localizationHelper';
import { getPublicShareUrl } from '../../utils/shareUtils';
import './DiseaseResult.css';

const DiseaseResult = ({ result, isHistory, onAddToSchedule, onClose }) => {
  const { t, i18n } = useTranslation();
  const { addNotification } = useNotification();
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);
  const diseaseNameRaw = result.disease || result.diseaseName || '';
  const descRaw = result.description || '';
  const treatmentRaw = result.treatment || '';
  const isHealthy = Boolean(
    result.isHealthy || 
    /healthy|optimal|no disease/i.test(diseaseNameRaw) || 
    /no diseases detected|looks healthy|plant appears healthy|appears healthy/i.test(descRaw) ||
    /plant appears healthy|plant looks healthy/i.test(treatmentRaw)
  );
  
  const parseTreatmentSteps = (treatment) => {
    if (!treatment) return [t('diagnose.noTreatmentAvailable', 'No specific treatment available.')];
    const steps = treatment.split(/\d\.|\n/).filter(s => s.trim().length > 0);
    if (steps.length > 1) {
      return steps.map(s => s.trim());
    }
    return [treatment];
  };

  const treatmentSteps = parseTreatmentSteps(result.treatment);

  const getSeverityLevel = (confidence, isHealthyStatus) => {
    if (isHealthyStatus) return { label: t('diagnose.severityOptimal', 'Optimal / Healthy'), color: '#2d6a4f' };
    if (!confidence) return { label: t('diagnose.severityUnknown', 'Unknown'), color: '#9a8a7a' };
    if (confidence > 0.8) return { label: t('diagnose.severityCritical', 'Critical'), color: '#ef4444' };
    if (confidence > 0.5) return { label: t('diagnose.severityModerate', 'Moderate'), color: '#f59e0b' };
    return { label: t('diagnose.severityLow', 'Low'), color: '#10b981' };
  };

  const severity = getSeverityLevel(result.confidence, isHealthy);

  const getLocalizedConfidenceLevel = (conf) => {
    if (conf >= 0.8) return t('common.high', 'High');
    if (conf >= 0.5) return t('common.medium', 'Moderate');
    return t('common.low', 'Low');
  };

  const getDiseaseCategoryKey = (disease) => {
    const lower = disease?.toLowerCase() || '';
    if (lower.includes('water') || lower.includes('overwater')) return 'categoryWater';
    if (lower.includes('fungal') || lower.includes('mildew') || lower.includes('rust')) return 'categoryFungal';
    if (lower.includes('bacterial')) return 'categoryBacterial';
    if (lower.includes('pest') || lower.includes('insect') || lower.includes('aphid')) return 'categoryPest';
    if (lower.includes('nutrient') || lower.includes('deficiency')) return 'categoryNutrient';
    if (lower.includes('healthy')) return 'categoryHealthy';
    return 'categoryGeneral';
  };

  const categoryKey = getDiseaseCategoryKey(diseaseNameRaw);
  const categoryDefault = {
    categoryWater: 'Water Issue',
    categoryFungal: 'Fungal Infection',
    categoryBacterial: 'Bacterial Infection',
    categoryPest: 'Pest Infestation',
    categoryNutrient: 'Nutrient Deficiency',
    categoryHealthy: 'Healthy',
    categoryGeneral: 'General Condition'
  }[categoryKey] || 'General Condition';

  const category = t(`diagnose.${categoryKey}`, categoryDefault);

  const getPreventionTips = (disease) => {
    const lower = disease?.toLowerCase() || '';
    if (lower.includes('water') || lower.includes('overwater')) {
      return [
        'Allow soil to dry between waterings',
        'Use well-draining potting mix',
        'Water in the morning to reduce evaporation',
        'Check drainage holes are not blocked'
      ];
    }
    if (lower.includes('fungal') || lower.includes('mildew')) {
      return [
        'Improve air circulation around plants',
        'Water at the base, not on leaves',
        'Remove affected leaves immediately',
        'Apply preventative fungicide in humid conditions'
      ];
    }
    if (lower.includes('pest') || lower.includes('aphid')) {
      return [
        'Regularly inspect plants for pests',
        'Use neem oil as a natural deterrent',
        'Introduce beneficial insects like ladybugs',
        'Quarantine new plants before introducing'
      ];
    }
    return [
      'Regularly monitor plant health',
      'Maintain consistent care routine',
      'Keep growing area clean',
      'Use quality soil and fertilizer'
    ];
  };

  const preventionTips = getPreventionTips(diseaseNameRaw);

  const getDateLocale = () => {
    if (i18n.language === 'gu') return 'gu-IN';
    if (i18n.language === 'hi') return 'hi-IN';
    return 'en-US';
  };

  const localizedDiseaseName = isHealthy && (!diseaseNameRaw || diseaseNameRaw.toLowerCase() === 'general condition')
    ? t('diagnose.categoryHealthy', 'Healthy')
    : getLocalizedDynamicText(diseaseNameRaw || 'General Condition', i18n.language);

  const reportId = result._id || result.id;
  const path = reportId ? `/diagnose/report/${reportId}` : '/diagnose';
  const publicUrl = getPublicShareUrl(path);

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(publicUrl);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = publicUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      addNotification(t('diagnose.copiedSuccess', 'Diagnosis link copied to clipboard!'), 'success');
      setShowShareModal(false);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      addNotification(t('diagnose.copyFailed', 'Unable to copy to clipboard'), 'error');
    }
  };

  const handleShareWhatsApp = () => {
    const summaryText = `🌱 UrbanFarm Botanical Diagnosis Report\nCondition: ${localizedDiseaseName || 'Plant Check'}\nCategory: ${category}\nConfidence: ${Math.round((result.confidence || 0) * 100)}%\n\nDiagnosed via Krishi AI:\n${publicUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(summaryText)}`, '_blank');
    addNotification(t('community.notifications.openingWhatsApp', 'Opening WhatsApp to share...'), 'info');
    setShowShareModal(false);
  };

  const handleShareNative = async () => {
    const summaryText = `🌱 UrbanFarm Botanical Diagnosis Report\nCondition: ${localizedDiseaseName || 'Plant Check'}\nCategory: ${category}\nConfidence: ${Math.round((result.confidence || 0) * 100)}%\n\nDiagnosed via Krishi AI:`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `UrbanFarm Diagnosis Report - ${localizedDiseaseName}`,
          text: summaryText,
          url: publicUrl,
        });
        addNotification(t('diagnose.sharedSuccess', 'Diagnosis shared successfully!'), 'success');
        setShowShareModal(false);
      } catch (err) {
        // cancelled by user
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className={`disease-result ${isHealthy ? 'healthy' : ''}`}>
      <div className="result-header">
        <h3>
          {isHistory ? (
            <><RiFileList3Line /> {t('diagnose.recordTitle', 'Diagnosis Record')}</>
          ) : (
            <><RiMicroscopeLine /> {t('diagnose.resultTitle', 'Diagnosis Result')}</>
          )}
        </h3>
        {onClose && (
          <button className="close-btn" onClick={onClose} aria-label={t('common.close', 'Close')}>
            <RiCloseLine />
          </button>
        )}
      </div>

      {/* Status */}
      <div className="result-status">
        <span className="status-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          {isHealthy ? <><RiCheckLine /> {t('diagnose.statusHealthy', 'Healthy')}</> : <><RiAlertLine /> {t('diagnose.statusIssue', 'Issue Detected')}</>}
        </span>
        <span className="severity-badge" style={{ background: severity.color + '22', color: severity.color, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          {t('diagnose.severityLabel', 'Severity: {{severity}}', { severity: severity.label })}
        </span>
      </div>

      {/* Disease Name */}
      <div className="result-disease">
        <span className="label">{t('diagnose.diagnosisLabel', 'Diagnosis:')}</span>
        <span className="value disease-name">{localizedDiseaseName}</span>
        <span className="category-tag">{category}</span>
      </div>

      {/* Confidence Meter */}
      {result.confidence > 0 && (
        <div className="result-confidence">
          <div className="confidence-header">
            <span className="label">{t('diagnose.aiConfidence', 'AI Confidence:')}</span>
            <span className="value">{Math.round(result.confidence * 100)}% ({getLocalizedConfidenceLevel(result.confidence)})</span>
          </div>
          <div className="confidence-bar">
            <div 
              className="confidence-fill" 
              style={{ 
                width: `${Math.round(result.confidence * 100)}%`,
                background: isHealthy ? '#2d6a4f' : result.confidence > 0.7 ? '#ef4444' : result.confidence > 0.4 ? '#f59e0b' : '#10b981'
              }}
            />
          </div>
        </div>
      )}

      {/* Description / Cause */}
      {result.description && (
        <div className="result-description">
          <span className="label" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <RiFileTextLine /> {t('diagnose.descriptionLabel', 'Description:')}
          </span>
          <p className="value">{getLocalizedDynamicText(result.description, i18n.language)}</p>
        </div>
      )}

      {/* Treatment Plan */}
      {result.treatment && (
        <div className="result-treatment">
          <span className="label" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <RiMedicineBottleLine /> {t('diagnose.treatmentPlan', 'Treatment Plan:')}
          </span>
          <ol className="treatment-list">
            {treatmentSteps.map((step, idx) => (
              <li key={idx}>{getLocalizedDynamicText(step, i18n.language)}</li>
            ))}
          </ol>
        </div>
      )}

      {/* Prevention Tips */}
      <div className="result-prevention">
        <span className="label" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <RiShieldCheckLine /> {t('diagnose.preventionTips', 'Prevention Tips:')}
        </span>
        <ul className="prevention-list">
          {preventionTips.map((tip, idx) => (
            <li key={idx}>{getLocalizedDynamicText(tip, i18n.language)}</li>
          ))}
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="result-action-bar">
        {result.treatment && (
          <button 
            className="btn-primary add-schedule-btn"
            onClick={onAddToSchedule}
          >
            <RiCalendarEventLine /> {t('diagnose.addToSchedule', 'Add to Schedule')}
          </button>
        )}
        <button 
          className="btn-secondary report-btn"
          onClick={() => {
            const reportText = `URBAN FARM - PLANT HEALTH & AI DIAGNOSIS REPORT\n=================================================\nDisease Detected: ${localizedDiseaseName || 'Healthy'}\nCategory: ${category}\nAI Confidence: ${Math.round((result.confidence || 0) * 100)}%\nSeverity: ${severity.label}\nDate: ${new Date().toLocaleString(getDateLocale())}\n\nDESCRIPTION:\n${result.description || 'None provided'}\n\nTREATMENT PLAN:\n${treatmentSteps.join('\n')}\n\nPREVENTION TIPS:\n${preventionTips.join('\n')}\n\nGenerated by Krishi AI\n`;
            const blob = new Blob([reportText], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `UrbanFarm_Diagnosis_${(localizedDiseaseName || 'report').replace(/\s+/g, '_')}.txt`;
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          <RiDownload2Line /> {t('diagnose.reportTxt', 'Report (.txt)')}
        </button>
        <button 
          className="btn-secondary report-btn"
          onClick={() => {
            const jsonStr = JSON.stringify(result, null, 2);
            const blob = new Blob([jsonStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `UrbanFarm_Diagnosis_${(localizedDiseaseName || 'report').replace(/\s+/g, '_')}.json`;
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          <RiDownload2Line /> {t('diagnose.jsonExport', 'JSON')}
        </button>
        <button 
          type="button" 
          className={`btn-secondary report-btn ${copied ? 'copied-btn' : ''}`}
          onClick={() => { setShowShareModal(true); setShowQrCode(false); }}
          style={copied ? { background: '#2d6a4f', color: '#ffffff', borderColor: '#2d6a4f' } : {}}
        >
          {copied ? (
            <><RiCheckLine /> {t('diagnose.copied', 'Copied!')}</>
          ) : (
            <><RiShareLine /> {t('diagnose.share', 'Share')}</>
          )}
        </button>
      </div>

      {showShareModal && (
        <div className="share-modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="share-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="share-modal-header">
              <h3>{t('community.card.shareModalTitle', 'Share Diagnosis Report')}</h3>
              <button className="close-btn" onClick={() => setShowShareModal(false)} aria-label="Close">
                <RiCloseLine />
              </button>
            </div>

            <div className="share-modal-body">
              <p className="share-post-preview-title">
                {localizedDiseaseName} ({category})
              </p>

              {!showQrCode ? (
                <div className="share-options-grid">
                  <button className="share-option-btn" onClick={handleCopyLink}>
                    <div className="share-option-icon icon-copy">
                      <RiFileCopyLine />
                    </div>
                    <span>{t('community.card.copyLink', 'Copy Link')}</span>
                  </button>

                  <button className="share-option-btn" onClick={handleShareWhatsApp}>
                    <div className="share-option-icon icon-whatsapp">
                      <RiWhatsappLine />
                    </div>
                    <span>{t('community.card.whatsApp', 'WhatsApp')}</span>
                  </button>

                  <button className="share-option-btn" onClick={handleShareNative}>
                    <div className="share-option-icon icon-apps">
                      <RiShareForwardLine />
                    </div>
                    <span>{t('community.card.otherApps', 'Other Apps')}</span>
                  </button>

                  <button className="share-option-btn" onClick={() => setShowQrCode(true)}>
                    <div className="share-option-icon icon-qr">
                      <RiQrCodeLine />
                    </div>
                    <span>{t('community.card.qrCode', 'QR Code')}</span>
                  </button>
                </div>
              ) : (
                <div className="qr-code-container" style={{ textAlign: 'center', padding: '1rem 0' }}>
                  <p className="qr-sub" style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
                    {t('community.card.scanQrCode', 'Scan QR Code to view this diagnosis report')}
                  </p>
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(publicUrl)}&color=2c5e3b&bgcolor=ffffff`} 
                    alt="Report QR Code"
                    style={{ width: '180px', height: '180px', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  />
                  <div style={{ marginTop: '1rem' }}>
                    <button className="btn-secondary" onClick={() => setShowQrCode(false)} style={{ padding: '0.35rem 1rem', fontSize: '0.85rem' }}>
                      Back to Share Options
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Additional info */}
      {result.scientificName && (
        <div className="result-meta">
          <span className="meta-label">
            <RiMicroscopeLine /> {t('diagnose.scientificInfo', 'Scientific Info:')}
          </span>
          <span className="meta-value">{result.scientificName}</span>
        </div>
      )}

      {isHistory && result.createdAt && (
        <div className="result-meta">
          <span className="meta-label">
            <RiCalendarEventLine /> {t('diagnose.diagnosedAt', 'Diagnosed:')}
          </span>
          <span className="meta-value">{new Date(result.createdAt).toLocaleString(getDateLocale())}</span>
        </div>
      )}
    </div>
  );
};

export default DiseaseResult;
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Sparkles, 
  X, 
  FlaskConical, 
  CheckCircle2, 
  AlertTriangle, 
  Sprout, 
  Sun, 
  Calendar, 
  Bookmark, 
  BookmarkCheck,
  Layers,
  Thermometer,
  Droplets
} from 'lucide-react';
import { getLocalizedDynamicText } from '../../utils/localizationHelper';
import CropCard from './CropCard';
import './CropResultsModal.css';

const CropResultsModal = ({
  isOpen,
  onClose,
  recommendations = [],
  soilAnalysis = null,
  targetCropCheck = null,
  sessionData = null,
  isHistory = false,
  onAddToPlants,
  onSave,
  historyId = null,
  isSaved = false,
  spaceAvailable = 'medium'
}) => {
  const { t, i18n } = useTranslation();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getDateLocale = () => {
    if (i18n.language === 'gu') return 'gu-IN';
    if (i18n.language === 'hi') return 'hi-IN';
    return 'en-US';
  };

  const getLocalizedSoil = (soil) => {
    if (!soil) return t('crops.soilType', 'Soil');
    const s = String(soil).toLowerCase().replace(/\s+/g, '');
    if (s === 'loam' || s.includes('દોમટ') || s.includes('दोमट') || s.includes('ગોરાડુ')) return i18n.language === 'gu' ? 'દોમટ / ગોરાડુ' : i18n.language === 'hi' ? 'दोमट' : 'Loam';
    if (s === 'sandy' || s.includes('રેતાળ') || s.includes('बलुई') || s.includes('रेतीली')) return i18n.language === 'gu' ? 'રેતાળ' : i18n.language === 'hi' ? 'बलुई' : 'Sandy';
    if (s === 'clay' || s.includes('ચીકણી') || s.includes('चिकनी')) return i18n.language === 'gu' ? 'ચીકણી માટી' : i18n.language === 'hi' ? 'चिकनी मिट्टी' : 'Clay';
    if (s === 'silty' || s.includes('કાંપવાળી') || s.includes('गाद')) return i18n.language === 'gu' ? 'કાંપવાળી' : i18n.language === 'hi' ? 'गाद' : 'Silty';
    if (s === 'peaty' || s.includes('પીટ') || s.includes('पीट')) return i18n.language === 'gu' ? 'પીટ માટી' : i18n.language === 'hi' ? 'पीट' : 'Peaty';
    if (s === 'chalky' || s.includes('ચૂનાવાળી') || s.includes('चूनेदार')) return i18n.language === 'gu' ? 'ચૂનાવાળી' : i18n.language === 'hi' ? 'चूनेदार' : 'Chalky';
    if (s === 'sandyloam' || s.includes('રેતાળગોરાડુ') || s.includes('बलुईदोमट')) return i18n.language === 'gu' ? 'રેતાળ ગોરાડુ' : i18n.language === 'hi' ? 'बलुई दोमट' : 'Sandy Loam';
    if (s === 'pottingmix' || s.includes('પોટિંગમિક્સ') || s.includes('पोटિંગમિક્સ')) return i18n.language === 'gu' ? 'પોટિંગ મિક્સ' : i18n.language === 'hi' ? 'पोटिंग मिक्स' : 'Potting Mix';
    const dynamic = getLocalizedDynamicText(soil, i18n.language);
    return dynamic || soil;
  };

  const getLocalizedSeason = (season) => {
    if (!season) return t('crops.season', 'Season');
    const s = String(season).toLowerCase();
    if (s.includes('spring') || s.includes('વસંત') || s.includes('वसंत')) return i18n.language === 'gu' ? 'વસંત' : i18n.language === 'hi' ? 'वसंत' : 'Spring';
    if (s.includes('summer') || s.includes('ઉનાળો') || s.includes('ग्रीष्म') || s.includes('गर्मी')) return i18n.language === 'gu' ? 'ઉનાળો' : i18n.language === 'hi' ? 'ग्रीष्म' : 'Summer';
    if (s.includes('fall') || s.includes('autumn') || s.includes('શરદ') || s.includes('પાનખર') || s.includes('शरद')) return i18n.language === 'gu' ? 'શરદ / પાનખર' : i18n.language === 'hi' ? 'शरद' : 'Fall';
    if (s.includes('winter') || s.includes('શિયાળો') || s.includes('શીત') || s.includes('सर्दी')) return i18n.language === 'gu' ? 'શિયાળો' : i18n.language === 'hi' ? 'शीत' : 'Winter';
    const dynamic = getLocalizedDynamicText(season, i18n.language);
    return dynamic || season;
  };

  const soilType = sessionData?.soilType || sessionData?.inputData?.soilType || 'Loam';
  const season = sessionData?.season || sessionData?.inputData?.season || 'Summer';
  const ph = sessionData?.ph || sessionData?.inputData?.ph;
  const temp = sessionData?.temperature || sessionData?.inputData?.temperature;
  const humidity = sessionData?.humidity || sessionData?.inputData?.humidity;
  const createdAt = sessionData?.createdAt;

  return (
    <div className="crop-modal-overlay" onClick={onClose}>
      <div className="crop-modal-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="crop-modal-header">
          <div className="crop-modal-title-group">
            <div className="crop-modal-badge">
              <Sparkles size={14} className="badge-sparkle" />
              <span>{t('crops.geminiAgronomyBadge', 'Gemini AI Agronomy')}</span>
            </div>
            <h3 className="crop-modal-title">
              {isHistory ? t('crops.historyModalTitle', 'Crop Recommendation Details') : t('crops.resultsModalTitle', 'AI Crop Recommendations')}
            </h3>
            <p className="crop-modal-subtitle">
              {t('crops.modalSubtitle', 'Personalized agronomic insights powered by Gemini AI')}
            </p>
          </div>

          <div className="crop-modal-header-actions">
            {isHistory && onSave && historyId && (
              <button 
                type="button" 
                className={`modal-save-btn ${isSaved ? 'saved' : ''}`}
                onClick={() => onSave(historyId)}
                title={isSaved ? t('crops.saved', 'Saved') : t('crops.save', 'Save')}
              >
                {isSaved ? (
                  <>
                    <BookmarkCheck size={14} />
                    <span>{t('crops.saved', 'Saved')}</span>
                  </>
                ) : (
                  <>
                    <Bookmark size={14} />
                    <span>{t('crops.save', 'Save')}</span>
                  </>
                )}
              </button>
            )}
            <button 
              type="button" 
              className="crop-modal-close-btn" 
              onClick={onClose}
              aria-label={t('common.close', 'Close')}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Condition Summary Pills */}
        <div className="crop-modal-conditions-bar">
          <span className="conditions-label">{t('crops.sessionConditions', 'Conditions')}:</span>
          <div className="conditions-tags">
            <span className="condition-tag soil">
              <Sprout size={13} className="cond-icon" />
              <span>{getLocalizedSoil(soilType)}</span>
            </span>
            <span className="condition-tag season">
              <Sun size={13} className="cond-icon" />
              <span>{getLocalizedSeason(season)}</span>
            </span>
            {ph !== undefined && ph !== null && (
              <span className="condition-tag ph">
                <span>pH {ph}</span>
              </span>
            )}
            {temp !== undefined && temp !== null && (
              <span className="condition-tag temp">
                <Thermometer size={13} className="cond-icon" />
                <span>{temp}°C</span>
              </span>
            )}
            {humidity !== undefined && humidity !== null && (
              <span className="condition-tag humidity">
                <Droplets size={13} className="cond-icon" />
                <span>{humidity}%</span>
              </span>
            )}
            {createdAt && (
              <span className="condition-tag date">
                <Calendar size={13} className="cond-icon" />
                <span>{new Date(createdAt).toLocaleDateString(getDateLocale(), { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </span>
            )}
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="crop-modal-body">
          {/* Soil Analysis Card */}
          {soilAnalysis && (
            <div className="soil-analysis-card modal-soil-card">
              <div className="soil-analysis-header">
                <span className="soil-badge">
                  <FlaskConical size={13} className="badge-icon" />
                  <span>{t('crops.soilProfile', 'Soil Profile')}</span>
                </span>
                <h4>{getLocalizedSoil(soilAnalysis.soilType)} {t('crops.soilAssessment', 'Soil Assessment')} (pH {soilAnalysis.ph})</h4>
              </div>
              <p className="soil-drainage-text">
                <strong>{t('crops.characteristics', 'Characteristics')}:</strong> {getLocalizedDynamicText(soilAnalysis.drainageAndTexture || soilAnalysis.characteristics, i18n.language)}
              </p>
              <p className="soil-tip-text">
                <strong>{t('crops.agronomicAdvice', 'Agronomic Advice')}:</strong> {getLocalizedDynamicText(soilAnalysis.soilManagementTip || soilAnalysis.soilAdvice || 'Ensure adequate compost incorporation.', i18n.language)}
              </p>
            </div>
          )}

          {/* Target Crop Evaluation Card */}
          {targetCropCheck && (
            <div className={`target-crop-result-card modal-target-card ${targetCropCheck.isSuitable ? 'suitable' : 'unsuitable'}`}>
              <div className="target-result-header">
                <span className={`target-suitability-pill ${targetCropCheck.isSuitable ? 'pass' : 'fail'}`}>
                  {targetCropCheck.isSuitable ? (
                    <>
                      <CheckCircle2 size={13} />
                      <span>{t('crops.suitableMatch', 'Suitable Match')}</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle size={13} />
                      <span>{t('crops.soilMismatchWarning', 'Soil Mismatch Warning')}</span>
                    </>
                  )}
                </span>
                <h4>{t('crops.evaluationFor', 'Evaluation for "{{crop}}" in {{soil}} Soil', { crop: getLocalizedDynamicText(targetCropCheck.cropName, i18n.language), soil: getLocalizedSoil(soilType) })}</h4>
              </div>

              <p className="target-explanation">
                {getLocalizedDynamicText(targetCropCheck.soilMismatchReason, i18n.language)}
              </p>

              {!targetCropCheck.isSuitable && targetCropCheck.suggestedAlternatives?.length > 0 && (
                <div className="target-alternatives-box">
                  <span className="alt-title">{t('crops.recommendedAlternatives', 'Recommended Alternatives for {{soil}} Soil:', { soil: getLocalizedSoil(soilType) })}</span>
                  <div className="alt-chips-row">
                    {targetCropCheck.suggestedAlternatives.map((alt, idx) => (
                      <span key={idx} className="alt-chip">
                        <Sprout size={12} className="alt-icon" />
                        <span>{getLocalizedDynamicText(alt, i18n.language)}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Recommendations Grid */}
          <div className="modal-crop-grid-wrap">
            <div className="modal-grid-header">
              <div className="modal-grid-title-row">
                <Layers size={16} className="grid-header-icon" />
                <h4>{t('crops.recommendationsTitle', 'Recommended Crops')}</h4>
              </div>
              <span className="modal-crops-count">
                {t('crops.cropsFound', '{{count}} crops found', { count: recommendations.length })}
              </span>
            </div>

            {recommendations.length === 0 ? (
              <div className="modal-empty-crops">
                <p>{t('crops.noCrops', 'No crops found for these specific parameters.')}</p>
              </div>
            ) : (
              <div className="crop-grid">
                {recommendations.map((crop, idx) => (
                  <CropCard 
                    key={idx} 
                    crop={crop} 
                    spaceAvailable={spaceAvailable}
                    existingPlants={[]}
                    onAddToPlants={() => onAddToPlants && onAddToPlants(crop)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="crop-modal-footer">
          <span className="modal-footer-count">
            {recommendations.length} {t('crops.recommendationsTitle', 'Recommended Crops')}
          </span>
          <button 
            type="button" 
            className="btn-primary modal-close-action-btn"
            onClick={onClose}
          >
            {t('common.close', 'Close')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CropResultsModal;

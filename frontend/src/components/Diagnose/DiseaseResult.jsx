import React, { useState } from 'react';
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
  RiCloseLine
} from 'react-icons/ri';
import { useNotification } from '../../hooks/useNotification';
import { getConfidenceEmoji } from '../../utils/helpers';
import './DiseaseResult.css';

const DiseaseResult = ({ result, isHistory, onAddToSchedule, onClose }) => {
  const { addNotification } = useNotification();
  const [copied, setCopied] = useState(false);
  const isHealthy = result.isHealthy || result.disease?.toLowerCase().includes('healthy');
  
  const parseTreatmentSteps = (treatment) => {
    if (!treatment) return ['No specific treatment available.'];
    const steps = treatment.split(/\d\.|\n/).filter(s => s.trim().length > 0);
    if (steps.length > 1) {
      return steps.map(s => s.trim());
    }
    return [treatment];
  };

  const treatmentSteps = parseTreatmentSteps(result.treatment);

  const getSeverityLevel = (confidence, isHealthyStatus) => {
    if (isHealthyStatus) return { label: 'Optimal / Healthy', color: '#2d6a4f' };
    if (!confidence) return { label: 'Unknown', color: '#9a8a7a' };
    if (confidence > 0.8) return { label: 'Critical', color: '#ef4444' };
    if (confidence > 0.5) return { label: 'Moderate', color: '#f59e0b' };
    return { label: 'Low', color: '#10b981' };
  };

  const severity = getSeverityLevel(result.confidence, isHealthy);

  const getDiseaseCategory = (disease) => {
    const lower = disease?.toLowerCase() || '';
    if (lower.includes('water') || lower.includes('overwater')) return 'Water Issue';
    if (lower.includes('fungal') || lower.includes('mildew') || lower.includes('rust')) return 'Fungal Infection';
    if (lower.includes('bacterial')) return 'Bacterial Infection';
    if (lower.includes('pest') || lower.includes('insect') || lower.includes('aphid')) return 'Pest Infestation';
    if (lower.includes('nutrient') || lower.includes('deficiency')) return 'Nutrient Deficiency';
    if (lower.includes('healthy')) return 'Healthy';
    return 'General Condition';
  };

  const category = getDiseaseCategory(result.disease);

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

  const preventionTips = getPreventionTips(result.disease);

  const handleShare = async () => {
    const shareText = `🌱 UrbanFarm Botanical Diagnosis\nCondition: ${result.disease || 'Plant Check'}\nCategory: ${category}\nConfidence: ${Math.round((result.confidence || 0) * 100)}%\n\nTreatment Summary:\n${treatmentSteps.slice(0, 2).join('\n')}\n\nDiagnosed via UrbanFarm AI Assistant: ${window.location.href}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `UrbanFarm Diagnosis - ${result.disease}`,
          text: shareText,
          url: window.location.href,
        });
        addNotification('Diagnosis shared successfully!', 'success');
        return;
      } catch (err) {
        if (err.name === 'AbortError') return; // User closed native share dialog
      }
    }

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareText);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = shareText;
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
      addNotification('Diagnosis summary copied to clipboard!', 'success');
    } catch (err) {
      console.error('Clipboard copy error:', err);
      addNotification('Unable to copy to clipboard', 'error');
    }
  };

  return (
    <div className={`disease-result ${isHealthy ? 'healthy' : ''}`}>
      <div className="result-header">
        <h3>
          {isHistory ? (
            <><RiFileList3Line /> Diagnosis Record</>
          ) : (
            <><RiMicroscopeLine /> Diagnosis Result</>
          )}
        </h3>
        {onClose && (
          <button className="close-btn" onClick={onClose} aria-label="Close">
            <RiCloseLine />
          </button>
        )}
      </div>

      {/* Status */}
      <div className="result-status">
        <span className="status-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          {isHealthy ? <><RiCheckLine /> Healthy</> : <><RiAlertLine /> Issue Detected</>}
        </span>
        <span className="severity-badge" style={{ background: severity.color + '22', color: severity.color, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          Severity: {severity.label}
        </span>
      </div>

      {/* Disease Name */}
      <div className="result-disease">
        <span className="label">Diagnosis:</span>
        <span className="value disease-name">{result.disease}</span>
        <span className="category-tag">{category}</span>
      </div>

      {/* Confidence Meter */}
      {result.confidence > 0 && (
        <div className="result-confidence">
          <div className="confidence-header">
            <span className="label">AI Confidence:</span>
            <span className="value">{Math.round(result.confidence * 100)}% ({getConfidenceEmoji(result.confidence)})</span>
          </div>
          <div className="confidence-bar">
            <div 
              className="confidence-fill" 
              style={{ 
                width: `${Math.round(result.confidence * 100)}%`,
                background: result.confidence > 0.7 ? '#ef4444' : result.confidence > 0.4 ? '#f59e0b' : '#10b981'
              }}
            />
          </div>
        </div>
      )}

      {/* Description / Cause */}
      {result.description && (
        <div className="result-description">
          <span className="label" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <RiFileTextLine /> Description:
          </span>
          <p className="value">{result.description}</p>
        </div>
      )}

      {/* Treatment Plan */}
      {result.treatment && !isHealthy && (
        <div className="result-treatment">
          <span className="label" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <RiMedicineBottleLine /> Treatment Plan:
          </span>
          <ol className="treatment-list">
            {treatmentSteps.map((step, idx) => (
              <li key={idx}>{step}</li>
            ))}
          </ol>
        </div>
      )}

      {/* Prevention Tips */}
      {!isHealthy && (
        <div className="result-prevention">
          <span className="label" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <RiShieldCheckLine /> Prevention Tips:
          </span>
          <ul className="prevention-list">
            {preventionTips.map((tip, idx) => (
              <li key={idx}>{tip}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div className="result-action-bar">
        {result.treatment && !isHealthy && (
          <button 
            className="btn-primary add-schedule-btn"
            onClick={onAddToSchedule}
          >
            <RiCalendarEventLine /> Add to Schedule
          </button>
        )}
        <button 
          className="btn-secondary report-btn"
          onClick={() => {
            const reportText = `URBAN FARM - PLANT HEALTH & AI DIAGNOSIS REPORT\n=================================================\nDisease Detected: ${result.disease || 'Healthy'}\nCategory: ${category}\nAI Confidence: ${Math.round((result.confidence || 0) * 100)}%\nSeverity: ${severity.label}\nDate: ${new Date().toLocaleString()}\n\nDESCRIPTION:\n${result.description || 'None provided'}\n\nTREATMENT PLAN:\n${treatmentSteps.join('\n')}\n\nPREVENTION TIPS:\n${preventionTips.join('\n')}\n\nGenerated by UrbanFarm AI Assistant\n`;
            const blob = new Blob([reportText], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `UrbanFarm_Diagnosis_${(result.disease || 'report').replace(/\s+/g, '_')}.txt`;
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          <RiDownload2Line /> Report (.txt)
        </button>
        <button 
          className="btn-secondary report-btn"
          onClick={() => {
            const jsonStr = JSON.stringify(result, null, 2);
            const blob = new Blob([jsonStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `UrbanFarm_Diagnosis_${(result.disease || 'report').replace(/\s+/g, '_')}.json`;
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          <RiDownload2Line /> JSON
        </button>
        <button 
          type="button"
          className={`btn-secondary report-btn ${copied ? 'copied-btn' : ''}`}
          onClick={handleShare}
          style={copied ? { background: '#2d6a4f', color: '#ffffff', borderColor: '#2d6a4f' } : {}}
        >
          {copied ? (
            <><RiCheckLine /> Copied!</>
          ) : (
            <><RiShareLine /> Share</>
          )}
        </button>
      </div>

      {/* Additional info */}
      {result.scientificName && (
        <div className="result-meta">
          <span className="meta-label">
            <RiMicroscopeLine /> Scientific Info:
          </span>
          <span className="meta-value">{result.scientificName}</span>
        </div>
      )}

      {isHistory && result.createdAt && (
        <div className="result-meta">
          <span className="meta-label">
            <RiCalendarEventLine /> Diagnosed:
          </span>
          <span className="meta-value">{new Date(result.createdAt).toLocaleString()}</span>
        </div>
      )}
    </div>
  );
};

export default DiseaseResult;
import React from 'react';
import { getConfidenceEmoji } from '../../utils/helpers';
import './DiseaseResult.css';

const DiseaseResult = ({ result, isHistory, onAddToSchedule, onClose }) => {
  // Check if it's healthy
  const isHealthy = result.isHealthy || result.disease?.toLowerCase().includes('healthy');
  
  // Parse treatment steps if available
  const parseTreatmentSteps = (treatment) => {
    if (!treatment) return ['No specific treatment available.'];
    // Split by numbers or periods
    const steps = treatment.split(/\d\.|\n/).filter(s => s.trim().length > 0);
    if (steps.length > 1) {
      return steps.map(s => s.trim());
    }
    return [treatment];
  };

  const treatmentSteps = parseTreatmentSteps(result.treatment);

  // Get severity level based on confidence
  const getSeverityLevel = (confidence) => {
    if (!confidence) return { label: 'Unknown', color: '#9a8a7a', emoji: '⚪' };
    if (confidence > 0.8) return { label: 'Critical', color: '#e8b4b4', emoji: '🔴' };
    if (confidence > 0.5) return { label: 'Moderate', color: '#f0d5c0', emoji: '🟡' };
    return { label: 'Low', color: '#a8d5ba', emoji: '🟢' };
  };

  const severity = getSeverityLevel(result.confidence);

  // Get disease type/category
  const getDiseaseCategory = (disease) => {
    const lower = disease?.toLowerCase() || '';
    if (lower.includes('water') || lower.includes('overwater')) return '💧 Water Issue';
    if (lower.includes('fungal') || lower.includes('mildew') || lower.includes('rust')) return '🍄 Fungal Infection';
    if (lower.includes('bacterial')) return '🦠 Bacterial Infection';
    if (lower.includes('pest') || lower.includes('insect') || lower.includes('aphid')) return '🐛 Pest Infestation';
    if (lower.includes('nutrient') || lower.includes('deficiency')) return '🧪 Nutrient Deficiency';
    if (lower.includes('healthy')) return '✅ Healthy';
    return '🔬 General Issue';
  };

  const category = getDiseaseCategory(result.disease);

  // Get prevention tips
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

  return (
    <div className={`disease-result ${isHealthy ? 'healthy' : ''}`}>
      <div className="result-header">
        <h3>{isHistory ? '📋 Diagnosis History' : '🔬 Diagnosis Result'}</h3>
        {onClose && (
          <button className="close-btn" onClick={onClose}>✕</button>
        )}
      </div>

      {/* Status */}
      <div className="result-status">
        <span className="status-badge">
          {isHealthy ? '✅ Healthy' : '⚠️ Disease Detected'}
        </span>
        <span className="severity-badge" style={{ background: severity.color + '33', color: severity.color }}>
          {severity.emoji} Severity: {severity.label}
        </span>
      </div>

      {/* Disease Name */}
      <div className="result-disease">
        <span className="label">Disease:</span>
        <span className="value disease-name">{result.disease}</span>
        <span className="category-tag">{category}</span>
      </div>

      {/* Confidence Meter */}
      {result.confidence > 0 && (
        <div className="result-confidence">
          <div className="confidence-header">
            <span className="label">AI Confidence:</span>
            <span className="value">{Math.round(result.confidence * 100)}% {getConfidenceEmoji(result.confidence)}</span>
          </div>
          <div className="confidence-bar">
            <div 
              className="confidence-fill" 
              style={{ 
                width: `${Math.round(result.confidence * 100)}%`,
                background: result.confidence > 0.7 ? '#e8b4b4' : result.confidence > 0.4 ? '#f0d5c0' : '#a8d5ba'
              }}
            />
          </div>
        </div>
      )}

      {/* Description / Cause */}
      {result.description && (
        <div className="result-description">
          <span className="label">📝 Description:</span>
          <p className="value">{result.description}</p>
        </div>
      )}

      {/* Symptoms Detected */}
      <div className="result-symptoms">
        <span className="label">🔍 Symptoms Detected:</span>
        <ul className="symptom-list">
          {result.disease?.toLowerCase().includes('water') && (
            <>
              <li>Yellowing leaves</li>
              <li>Wilting despite wet soil</li>
              <li>Brown, mushy roots</li>
            </>
          )}
          {result.disease?.toLowerCase().includes('fungal') && (
            <>
              <li>White powdery spots</li>
              <li>Brown or black spots with halos</li>
              <li>Rust-colored pustules</li>
            </>
          )}
          {result.disease?.toLowerCase().includes('pest') && (
            <>
              <li>Visible insects on leaves</li>
              <li>Sticky residue (honeydew)</li>
              <li>Curled or distorted leaves</li>
            </>
          )}
          {!result.disease?.toLowerCase().includes('water') && 
           !result.disease?.toLowerCase().includes('fungal') && 
           !result.disease?.toLowerCase().includes('pest') && (
            <li>Abnormal leaf appearance detected</li>
          )}
        </ul>
      </div>

      {/* Treatment Plan */}
      {result.treatment && !isHealthy && (
        <div className="result-treatment">
          <span className="label">💊 Treatment Plan:</span>
          <ol className="treatment-list">
            {treatmentSteps.map((step, idx) => (
              <li key={idx}>{step}</li>
            ))}
          </ol>
          <button 
            className="btn-primary add-schedule-btn"
            onClick={onAddToSchedule}
          >
            📅 Add to Schedule
          </button>
        </div>
      )}

      {/* Prevention Tips */}
      {!isHealthy && (
        <div className="result-prevention">
          <span className="label">🛡️ Prevention Tips:</span>
          <ul className="prevention-list">
            {preventionTips.map((tip, idx) => (
              <li key={idx}>{tip}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Additional info */}
      {result.scientificName && (
        <div className="result-meta">
          <span className="meta-label">🔬 Scientific Info:</span>
          <span className="meta-value">{result.scientificName}</span>
        </div>
      )}

      {isHistory && result.createdAt && (
        <div className="result-meta">
          <span className="meta-label">📅 Diagnosed:</span>
          <span className="meta-value">{new Date(result.createdAt).toLocaleString()}</span>
        </div>
      )}
    </div>
  );
};

export default DiseaseResult;
import React from 'react';

export default function Result({ result, onReset, t }) {
  if (!result) return null;

  // Case 1: Non-plant image detected
  if (!result.is_plant) {
    return (
      <div className="result-container non-plant-result">
        <div className="alert alert-warning non-plant-alert">
          <div className="non-plant-icon">🚫🌱</div>
          <h3>{t.notPlantError}</h3>
        </div>
        <div className="result-actions">
          <button type="button" className="btn btn-primary" onClick={onReset}>
            ↺ {t.analyzeAnother}
          </button>
        </div>
      </div>
    );
  }

  // Case 2: Plant detected - display full diagnosis
  const confidenceClass =
    result.confidence === 'high'
      ? 'badge-high'
      : result.confidence === 'low'
      ? 'badge-low'
      : 'badge-medium';

  const confidenceText =
    result.confidence === 'high'
      ? t.confHigh
      : result.confidence === 'low'
      ? t.confLow
      : t.confMedium;

  return (
    <div className="result-container">
      {/* Header Banner: Condition & Confidence Badge */}
      <div className="result-header">
        <div className="result-headline">
          <div className="condition-row">
            <h2 className="condition-title">{result.condition_name || (result.is_healthy ? t.healthyStatus : t.issueStatus)}</h2>
            <div className="badge-group">
              <span className={`badge ${confidenceClass}`}>
                {confidenceText}
              </span>
              <span className={`badge ${result.is_healthy ? 'badge-healthy' : 'badge-issue'}`}>
                {result.is_healthy ? `✓ ${t.healthyStatus}` : `⚠️ ${t.issueStatus}`}
              </span>
            </div>
          </div>

          {(result.plant_name || result.scientific_name) && (
            <div className="plant-id-row">
              {result.plant_name && (
                <span className="plant-name-text">
                  <strong>{t.plantName}:</strong> {result.plant_name}
                </span>
              )}
              {result.scientific_name && (
                <span className="scientific-name-text">
                  <em>({result.scientific_name})</em>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Uncertainty Notice if Low Confidence or Unsure */}
      {result.note_if_unsure && (
        <div className="result-section alert-note">
          <h3 className="section-title">ℹ️ {t.noteIfUnsure}</h3>
          <p className="section-content note-text">{result.note_if_unsure}</p>
        </div>
      )}

      {/* Description */}
      {result.description && (
        <div className="result-section">
          <h3 className="section-title">{t.description}</h3>
          <p className="section-content">{result.description}</p>
        </div>
      )}

      {/* Symptoms */}
      {result.symptoms && result.symptoms.length > 0 && (
        <div className="result-section">
          <h3 className="section-title">{t.symptoms}</h3>
          <ul className="result-list">
            {result.symptoms.map((item, index) => (
              <li key={`symptom-${index}`}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Causes */}
      {result.causes && result.causes.length > 0 && (
        <div className="result-section">
          <h3 className="section-title">{t.causes}</h3>
          <ul className="result-list">
            {result.causes.map((item, index) => (
              <li key={`cause-${index}`}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Treatment Steps (Step-by-step) */}
      {result.treatment_steps && result.treatment_steps.length > 0 && (
        <div className="result-section">
          <h3 className="section-title">{t.treatmentSteps}</h3>
          <ol className="result-ordered-list">
            {result.treatment_steps.map((item, index) => (
              <li key={`step-${index}`}>{item}</li>
            ))}
          </ol>
        </div>
      )}

      {/* Desi / Traditional Remedies */}
      {result.desi_solutions && result.desi_solutions.length > 0 && (
        <div className="result-section remedy-box desi-box">
          <h3 className="section-title">🌾 {t.desiSolutions}</h3>
          <ul className="result-list remedy-list">
            {result.desi_solutions.map((item, index) => (
              <li key={`desi-${index}`}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Chemical / Medical Solutions */}
      {result.medical_solutions && result.medical_solutions.length > 0 && (
        <div className="result-section remedy-box medical-box">
          <h3 className="section-title">🧪 {t.medicalSolutions}</h3>
          <ul className="result-list remedy-list">
            {result.medical_solutions.map((item, index) => (
              <li key={`medical-${index}`}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Recovery Tips */}
      {result.recovery_tips && result.recovery_tips.length > 0 && (
        <div className="result-section">
          <h3 className="section-title">{t.recoveryTips}</h3>
          <ul className="result-list">
            {result.recovery_tips.map((item, index) => (
              <li key={`recovery-${index}`}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Prevention Tips */}
      {result.prevention_tips && result.prevention_tips.length > 0 && (
        <div className="result-section">
          <h3 className="section-title">{t.preventionTips}</h3>
          <ul className="result-list">
            {result.prevention_tips.map((item, index) => (
              <li key={`prevention-${index}`}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* When to Seek Expert Help */}
      {result.when_to_seek_expert_help && (
        <div className="result-section">
          <h3 className="section-title">👨‍🌾 {t.expertHelp}</h3>
          <p className="section-content">{result.when_to_seek_expert_help}</p>
        </div>
      )}

      {/* Reset Button */}
      <div className="result-actions">
        <button type="button" className="btn btn-primary" onClick={onReset}>
          ↺ {t.analyzeAnother}
        </button>
      </div>
    </div>
  );
}

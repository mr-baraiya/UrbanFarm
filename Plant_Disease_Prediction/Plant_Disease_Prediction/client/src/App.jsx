import React, { useState, useRef, useEffect } from 'react';
import UploadBox from './components/UploadBox';
import Result from './components/Result';
import { LANGUAGES, translations } from './i18n';

export default function App() {
  const [currentLang, setCurrentLang] = useState('en');
  const [selectedImage, setSelectedImage] = useState(null); // { file, dataUrl, mimeType }
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [result, setResult] = useState(null);

  // In-memory cache for translations of the same image: { [cacheKey]: resultData }
  const cacheRef = useRef({});

  const t = translations[currentLang] || translations.en;

  // Analysis function
  const runAnalysis = async (imgData, targetLangCode) => {
    if (!imgData || !imgData.dataUrl) {
      setErrorMessage(t.errNoImage);
      return;
    }

    const langObj = LANGUAGES.find((l) => l.code === targetLangCode) || LANGUAGES[0];
    const cacheKey = `${imgData.dataUrl.slice(-100)}_${targetLangCode}`;

    // Check if result is already in cache
    if (cacheRef.current[cacheKey]) {
      setResult(cacheRef.current[cacheKey]);
      setErrorMessage('');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image: imgData.dataUrl,
          mimeType: imgData.mimeType,
          language: langObj.apiName
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Server error occurred during analysis');
      }

      // Cache successful response
      cacheRef.current[cacheKey] = data;
      setResult(data);
    } catch (err) {
      console.error('Analysis error:', err);
      setErrorMessage(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handler when user selects a new image
  const handleImageSelected = (imgData) => {
    setSelectedImage(imgData);
    setResult(null);
    setErrorMessage('');
    // Clear cache for new image
    cacheRef.current = {};
  };

  // Clear current image
  const handleClearImage = () => {
    setSelectedImage(null);
    setResult(null);
    setErrorMessage('');
    cacheRef.current = {};
  };

  // Reset entire application
  const handleReset = () => {
    setSelectedImage(null);
    setResult(null);
    setErrorMessage('');
    cacheRef.current = {};
  };

  // Language switch handler: Automatically re-run if analysis result exists
  const handleLanguageChange = (newLangCode) => {
    setCurrentLang(newLangCode);

    // If result is currently shown and we have an image, re-run or fetch from cache
    if (result && selectedImage) {
      runAnalysis(selectedImage, newLangCode);
    }
  };

  // Click on "Analyze" button
  const handleAnalyzeClick = () => {
    if (!selectedImage) {
      setErrorMessage(t.errNoImage);
      return;
    }
    runAnalysis(selectedImage, currentLang);
  };

  return (
    <div className="app-layout">
      {/* Header */}
      <header className="app-header">
        <div className="header-container">
          <div className="brand-group">
            <span className="brand-icon">🌱</span>
            <div>
              <h1 className="brand-title">{t.appTitle}</h1>
              <p className="brand-subtitle">{t.appSubtitle}</p>
            </div>
          </div>

          {/* Language Selector */}
          <div className="lang-picker-group">
            <label htmlFor="lang-select" className="lang-label">
              🌐 {t.selectLanguage}:
            </label>
            <select
              id="lang-select"
              className="lang-select"
              value={currentLang}
              onChange={(e) => handleLanguageChange(e.target.value)}
              disabled={loading}
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="main-container">
        {/* Step 1: Upload Box & Preview */}
        <section className="card upload-card">
          <UploadBox
            selectedFile={selectedImage?.file}
            previewUrl={selectedImage?.dataUrl}
            onImageSelected={handleImageSelected}
            onClearImage={handleClearImage}
            disabled={loading}
            t={t}
          />

          {/* Action Button: Analyze */}
          {selectedImage && !result && (
            <div className="analyze-action-bar">
              <button
                type="button"
                id="analyze-submit-btn"
                className="btn btn-primary btn-large"
                onClick={handleAnalyzeClick}
                disabled={loading}
              >
                {loading ? t.analyzingBtn : `🔍 ${t.analyzeBtn}`}
              </button>
            </div>
          )}
        </section>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="alert alert-error" role="alert">
            <p><strong>Error:</strong> {errorMessage}</p>
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="loading-card" aria-live="polite">
            <div className="spinner"></div>
            <h3>{t.analyzingBtn}</h3>
            <p>{t.loadingMessage}</p>
          </div>
        )}

        {/* Step 4: Diagnostic Result Section */}
        {result && !loading && (
          <section className="card result-card">
            <Result result={result} onReset={handleReset} t={t} />
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p className="disclaimer-text">
          ⚠️ {t.footerDisclaimer}
        </p>
      </footer>
    </div>
  );
}

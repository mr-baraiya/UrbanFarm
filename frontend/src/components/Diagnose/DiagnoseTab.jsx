import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { diagnosePlant, getDiagnosisHistory, getPlants, deleteDiagnosis } from '../../services/plantService';
import { useNotification } from '../../hooks/useNotification';
import { getPlantImage } from '../../utils/helpers';
import { getLocalizedDynamicText } from '../../utils/localizationHelper';
import DiseaseResult from './DiseaseResult';
import DiagnosisHistory from './DiagnosisHistory';
import ConfirmModal from '../Common/ConfirmModal';
import { Sparkles, CheckCircle2, Lightbulb } from 'lucide-react';
import './DiagnoseTab.css';

const DiagnoseTab = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const plantIdParam = searchParams.get('plant');
  
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [plants, setPlants] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState(plantIdParam || '');
  const [isDragging, setIsDragging] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });
  const fileInputRef = useRef(null);
  const { addNotification } = useNotification();

  // Camera state
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [facingMode, setFacingMode] = useState('environment');
  const videoRef = useRef(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedPlant && plants.length > 0) {
      const match = plants.find(p => p._id === selectedPlant);
      if (match) {
        const plantImg = getPlantImage(match);
        if (plantImg && !image) {
          setPreview(plantImg);
        }
      }
    } else if (!selectedPlant && !image) {
      setPreview(null);
    }
  }, [selectedPlant, plants, image]);

  const loadData = async () => {
    try {
      const [historyData, plantsData] = await Promise.all([
        getDiagnosisHistory(),
        getPlants(),
      ]);
      setHistory(historyData || []);
      setFilteredHistory(historyData || []);
      setPlants(plantsData || []);

      if (plantIdParam) {
        setSelectedPlant(plantIdParam);
        const targetPlant = (plantsData || []).find(p => p._id === plantIdParam);
        if (targetPlant) {
          const autoImg = getPlantImage(targetPlant);
          if (autoImg) {
            setPreview(autoImg);
          }
          addNotification(t('diagnose.selectedPlantNotification', { name: getLocalizedDynamicText(targetPlant.name, i18n.language) }), 'info');
        }
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  useEffect(() => {
    applyFilters();
  }, [history, searchTerm, filterStatus]);

  const applyFilters = () => {
    let filtered = [...history];
    
    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(h => {
        const dName = (h.diseaseName || '').toLowerCase();
        const localizedDName = getLocalizedDynamicText(h.diseaseName, i18n.language).toLowerCase();
        const pName = (h.plantId?.name || '').toLowerCase();
        const localizedPName = getLocalizedDynamicText(h.plantId?.name, i18n.language).toLowerCase();
        return dName.includes(term) || localizedDName.includes(term) || pName.includes(term) || localizedPName.includes(term);
      });
    }
    
    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(h => {
        const isHealthy = h.isHealthy || h.diseaseName?.toLowerCase().includes('healthy');
        if (filterStatus === 'needs_attention') return !isHealthy && !h.isResolved;
        if (filterStatus === 'healthy') return isHealthy;
        if (filterStatus === 'resolved') return h.isResolved && !isHealthy;
        if (filterStatus === 'critical') return !isHealthy && !h.isResolved && h.confidence > 0.7;
        if (filterStatus === 'monitoring') return !isHealthy && !h.isResolved && h.confidence > 0.4 && h.confidence <= 0.7;
        return true;
      });
    }
    
    setFilteredHistory(filtered);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleImageFile(file);
    } else {
      addNotification(t('diagnose.dropImageError', 'Please drop an image file'), 'error');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleImageFile(file);
    }
    e.target.value = '';
  };

  const handleImageFile = (file) => {
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setSelectedPlant('');
    setResult(null);
    setSelectedHistory(null);
  };

  const handlePlantSelect = (e) => {
    const pId = e.target.value;
    setSelectedPlant(pId);
    setImage(null);
    setResult(null);
    setSelectedHistory(null);
    
    if (pId) {
      const match = plants.find(p => p._id === pId);
      if (match) {
        const plantImg = getPlantImage(match);
        setPreview(plantImg || null);
      }
    } else {
      setPreview(null);
    }
  };

  const handleCameraCapture = async () => {
    try {
      setIsCameraOpen(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode }
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setIsCameraOpen(false);
      addNotification(t('diagnose.cameraAccessDenied', 'Camera access denied or unavailable. Please browse an image.'), 'error');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraOpen(false);
  };

  const handleSwitchCamera = async () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
    }
    const newFacingMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newFacingMode);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: newFacingMode }
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Failed to switch camera:', err);
      stopCamera();
    }
  };

  const handleSnapPhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `leaf-capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
        handleImageFile(file);
        stopCamera();
        addNotification(t('diagnose.photoCaptured', 'Photo captured ready for diagnosis!'), 'success');
      }
    }, 'image/jpeg', 0.9);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image && !preview) {
      addNotification(t('diagnose.selectImageFirst', 'Please upload or take a leaf photo first'), 'warning');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      if (image) {
        formData.append('image', image);
      } else if (preview && selectedPlant) {
        formData.append('imageUrl', preview);
      }

      if (selectedPlant) {
        formData.append('plantId', selectedPlant);
      }

      const activeLangName = i18n.language === 'gu' ? 'Gujarati' : i18n.language === 'hi' ? 'Hindi' : 'English';
      formData.append('language', activeLangName);

      const response = await diagnosePlant(formData);
      const resData = response.diagnosis || response;
      setResult(resData);
      
      // Update history
      loadData();
      addNotification(t('diagnose.analysisComplete', 'AI leaf pathology assessment complete!'), 'success');
    } catch (error) {
      console.error('Diagnosis failed:', error);
      const errMsg = error.response?.data?.message || t('diagnose.errorOccurred', 'Diagnosis failed. Please ensure leaf is clearly visible and retry.');
      addNotification(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleHistoryClick = (item) => {
    setSelectedHistory(item);
    setResult(null);
  };

  const handleAddToSchedule = (diag) => {
    if (!diag) return;
    const diseaseName = diag.diseaseName || diag.disease || 'Plant Health Treatment';
    
    // Combine treatment actions into clear description
    const actions = [];
    if (diag.immediateActions && diag.immediateActions.length > 0) {
      actions.push(`[${t('diagnose.section5Title', 'Immediate Action')}]:\n` + diag.immediateActions.map((a, i) => `${i + 1}. ${a}`).join('\n'));
    }
    if (diag.naturalSolutions && diag.naturalSolutions.length > 0) {
      actions.push(`[${t('diagnose.section7Title', 'Natural Solution')}]:\n` + diag.naturalSolutions.map((s, i) => `• ${s}`).join('\n'));
    }
    if (diag.modernSolutions && diag.modernSolutions.length > 0) {
      actions.push(`[${t('diagnose.section6Title', 'Modern Solution')}]:\n` + diag.modernSolutions.map((s, i) => `• ${s}`).join('\n'));
    }
    if (diag.treatmentSteps && diag.treatmentSteps.length > 0) {
      actions.push(`[${t('diagnose.treatment', 'Treatment Steps')}]:\n` + diag.treatmentSteps.map((s, i) => `${i + 1}. ${s}`).join('\n'));
    }
    if (diag.treatment && !diag.treatmentSteps?.length && !diag.immediateActions?.length) {
      actions.push(diag.treatment);
    }
    if (diag.preventionTips && diag.preventionTips.length > 0) {
      actions.push(`[${t('diagnose.section8Title', 'Prevention')}]:\n` + diag.preventionTips.map((s, i) => `• ${s}`).join('\n'));
    }

    const rawPlantId = diag.plantId?._id || diag.plantId || selectedPlant || '';
    const targetPlantId = typeof rawPlantId === 'string' && rawPlantId.length === 24 ? rawPlantId : '';

    const isSevere = (diag.severityLevel || diag.severity || '').toLowerCase().includes('severe') || (diag.confidence || 0) > 0.7;

    const taskData = {
      title: `${t('diagnose.treatment', 'Treatment')}: ${diseaseName}`,
      description: actions.join('\n\n') || `Care routine for ${diseaseName}`,
      type: 'pest_check',
      priority: isSevere ? 'high' : 'medium',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      plantId: targetPlantId || undefined,
    };
    
    sessionStorage.setItem('quickTask', JSON.stringify(taskData));
    navigate('/app/schedule', { state: { quickTask: taskData } });
  };

  const handleDeleteDiagnosisClick = (id) => {
    if (!id) return;
    setDeleteConfirm({ isOpen: true, id });
  };

  const handleConfirmDeleteDiagnosis = async () => {
    const id = deleteConfirm.id;
    if (!id) return;
    try {
      await deleteDiagnosis(id);
      setHistory(prev => prev.filter(item => (item._id || item.id) !== id));
      setFilteredHistory(prev => prev.filter(item => (item._id || item.id) !== id));
      if (selectedHistory && (selectedHistory._id || selectedHistory.id) === id) {
        setSelectedHistory(null);
      }
      if (result && (result._id || result.id) === id) {
        setResult(null);
      }
      addNotification(t('diagnose.deletedSuccess', 'Diagnosis record deleted successfully'), 'success');
    } catch (error) {
      console.error('Failed to delete diagnosis:', error);
      const errMsg = error.response?.data?.message || t('diagnose.deleteFailed', 'Failed to delete diagnosis record');
      addNotification(errMsg, 'error');
    }
  };

  const activePlantObj = plants.find(p => p._id === selectedPlant);

  // If a result is active, render full page report mode!
  if (result || selectedHistory) {
    const activeItem = result || selectedHistory;
    return (
      <div className="diagnose-tab diagnose-fullpage-mode">
        <DiseaseResult 
          result={activeItem} 
          isHistory={Boolean(selectedHistory)}
          onAddToSchedule={(diagData) => handleAddToSchedule(diagData || activeItem)}
          onBack={() => { setResult(null); setSelectedHistory(null); }}
          onClose={() => { setResult(null); setSelectedHistory(null); }}
        />
      </div>
    );
  }

  return (
    <div className="diagnose-tab">
      <div className="diagnose-page-header">
        <h2>{t('diagnose.title', 'Plant Disease Diagnosis')}</h2>
        <p className="diagnose-subtitle">
          {t('diagnose.subtitle', "Upload a clear photo of your plant's leaves or select a plant to run AI disease detection.")}
        </p>
      </div>
      
      <div className="diagnose-layout">
        {/* Left Column - Upload & Context */}
        <div className="diagnose-left">
          <div className="diagnose-upload-section">
            {/* Plant selector */}
            <div className="plant-selector">
              <label>{t('diagnose.selectPlantContext', 'Select Plant for Context:')}</label>
              <div className="plant-selector-inner">
                {activePlantObj && (
                  <div className="plant-selector-thumb">
                    <img 
                      src={getPlantImage(activePlantObj)} 
                      alt={activePlantObj.name} 
                    />
                  </div>
                )}
                <select 
                  value={selectedPlant} 
                  onChange={handlePlantSelect}
                >
                  <option value="">{t('diagnose.noSpecificPlant', '-- No specific plant (General Diagnosis) --')}</option>
                  {plants.map(p => (
                    <option key={p._id} value={p._id}>
                      {getLocalizedDynamicText(p.name, i18n.language)} {p.variety ? `(${p.variety})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Plant Needs Attention Alert Banner */}
            {activePlantObj && (activePlantObj.health === 'warning' || activePlantObj.health === 'unhealthy') && (
              <div className="plant-needs-attention-banner">
                <span className="banner-alert-dot" />
                <div className="banner-alert-content">
                  <strong>{t('diagnose.needsAttention', 'Needs Attention')}:</strong>{' '}
                  {t('diagnose.plantNeedsAttentionAlert', 'This plant has been flagged as needing attention! Run a fresh diagnosis or schedule treatment.')}
                </div>
              </div>
            )}

            {/* Upload area with drag & drop */}
            <div 
              className={`upload-area ${isDragging ? 'dragging' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              {preview ? (
                <div className="preview-container">
                  <img src={preview} alt="Preview" className="preview-image" />
                </div>
              ) : (
                <div className="upload-placeholder">
                  <div className="upload-box-graphic">
                    <span className="upload-box-dot" />
                  </div>
                  <span className="upload-text">{t('diagnose.dropImage', 'Click or drag image to upload')}</span>
                  <span className="upload-subtext">{t('diagnose.supportsFormats', 'Supports JPG, PNG, WEBP')}</span>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
            </div>

            <div className="upload-actions">
              <button 
                type="button" 
                className="btn-secondary"
                onClick={handleCameraCapture}
              >
                {t('diagnose.takePhoto', 'Take Photo')}
              </button>
              <button 
                type="button" 
                className="btn-secondary"
                onClick={() => fileInputRef.current?.click()}
              >
                {t('diagnose.browseFiles', 'Browse Files')}
              </button>
              <button 
                type="submit" 
                className="btn-primary" 
                onClick={handleSubmit}
                disabled={(!image && !preview) || loading}
              >
                {loading ? t('diagnose.analyzing', 'Analyzing...') : t('diagnose.runDiagnosis', 'Run Diagnosis')}
              </button>
            </div>

            {/* Get a Better Diagnosis Guidelines Box */}
            <div className="photo-guide-card">
              <div className="photo-guide-header">
                <div className="photo-guide-badge">
                  <Sparkles size={14} className="guide-sparkle-icon" />
                  <span>{t('diagnose.betterDiagnosisTitle', 'Get a Better Diagnosis')}</span>
                </div>
                <p className="photo-guide-sub">{t('diagnose.betterDiagnosisSubtitle', 'Upload one clear photo of your plant.')}</p>
              </div>

              <ul className="photo-guide-list">
                <li className="photo-guide-item">
                  <CheckCircle2 size={15} className="guide-check-icon" />
                  <span>{t('diagnose.betterDiagnosisPoint1', 'Show the affected area clearly.')}</span>
                </li>
                <li className="photo-guide-item">
                  <CheckCircle2 size={15} className="guide-check-icon" />
                  <span>{t('diagnose.betterDiagnosisPoint2', 'Use good lighting.')}</span>
                </li>
                <li className="photo-guide-item">
                  <CheckCircle2 size={15} className="guide-check-icon" />
                  <span>{t('diagnose.betterDiagnosisPoint3', 'Keep the image in focus.')}</span>
                </li>
              </ul>

              <div className="photo-guide-tip">
                <Lightbulb size={15} className="guide-tip-icon" />
                <p>
                  <strong>{t('diagnose.betterDiagnosisTipLabel', 'Tip:')}</strong>{' '}
                  {t('diagnose.betterDiagnosisTip', 'A clear, close-up photo helps identify plant problems more accurately.')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - History */}
        <div className="diagnose-right">
          <DiagnosisHistory 
            history={filteredHistory}
            onItemClick={handleHistoryClick}
            selectedId={selectedHistory?._id}
            filterStatus={filterStatus}
            onFilterChange={setFilterStatus}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onAddToSchedule={handleAddToSchedule}
            onDelete={handleDeleteDiagnosisClick}
          />
        </div>
      </div>

      {/* Custom Delete Confirm Modal */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        title={t('diagnose.deleteTitle', 'Delete Diagnosis Record')}
        message={t('diagnose.confirmDelete', 'Are you sure you want to delete this diagnosis record?')}
        confirmText={t('common.delete', 'Delete')}
        cancelText={t('common.cancel', 'Cancel')}
        isDanger={true}
        onConfirm={handleConfirmDeleteDiagnosis}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
      />

      {/* Live Camera Viewfinder Modal */}
      {isCameraOpen && (
        <div className="camera-modal-overlay" onClick={stopCamera}>
          <div className="camera-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="camera-modal-header">
              <h3>{t('diagnose.liveCamera', 'Live Plant Leaf Camera')}</h3>
              <button className="camera-close-btn" onClick={stopCamera} aria-label={t('common.close', 'Close Camera')}>
                ✕
              </button>
            </div>
            <div className="camera-viewport">
              <video ref={videoRef} autoPlay playsInline muted className="camera-video" />
              <div className="camera-guide-box" />
            </div>
            <div className="camera-modal-actions">
              <button type="button" className="btn-secondary" onClick={handleSwitchCamera}>
                {t('diagnose.switchCamera', 'Switch Camera')}
              </button>
              <button type="button" className="btn-primary camera-snap-btn" onClick={handleSnapPhoto}>
                {t('diagnose.capturePhoto', 'Capture Photo')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiagnoseTab;
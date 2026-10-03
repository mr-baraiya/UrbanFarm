import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  RiMicroscopeLine, 
  RiCameraLine, 
  RiCameraSwitchLine,
  RiFolderUploadLine, 
  RiSparklingLine, 
  RiPlantLine, 
  RiCheckLine,
  RiAlertLine,
  RiCloseLine
} from 'react-icons/ri';
import { TbPlant2 } from 'react-icons/tb';
import { diagnosePlant, getDiagnosisHistory, getPlants } from '../../services/plantService';
import { useNotification } from '../../hooks/useNotification';
import { getPlantImage } from '../../utils/helpers';
import { getLocalizedDynamicText } from '../../utils/localizationHelper';
import DiseaseResult from './DiseaseResult';
import DiagnosisHistory from './DiagnosisHistory';
import './DiagnoseTab.css';

const DiagnoseTab = () => {
  const { t, i18n } = useTranslation();
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
  const fileInputRef = useRef(null);
  const { addNotification } = useNotification();

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
    setSelectedPlant(''); // Auto move to "-- No specific plant (General Diagnosis) --"
    setResult(null);
    setSelectedHistory(null);
  };

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [facingMode, setFacingMode] = useState('environment');
  const videoRef = useRef(null);

  const startCamera = async (mode = 'environment') => {
    try {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
      setCameraStream(stream);
      setIsCameraOpen(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Webcam stream error, falling back to camera input picker:', err);
      // Fallback to direct device camera input
      const cameraInput = document.createElement('input');
      cameraInput.type = 'file';
      cameraInput.accept = 'image/*';
      cameraInput.capture = 'environment';
      cameraInput.onchange = (e) => {
        if (e.target.files && e.target.files[0]) {
          handleImageFile(e.target.files[0]);
        }
      };
      cameraInput.click();
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraOpen(false);
  };

  const handleCameraCapture = () => {
    startCamera(facingMode);
  };

  const handleSnapPhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `leaf_photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
        handleImageFile(file);
        stopCamera();
        addNotification(t('diagnose.photoCaptured', 'Leaf photo captured successfully!'), 'success');
      }
    }, 'image/jpeg', 0.92);
  };

  const handleSwitchCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  useEffect(() => {
    if (isCameraOpen && videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
    }
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraOpen, cameraStream]);

  const handlePlantSelect = (e) => {
    const plantId = e.target.value;
    setSelectedPlant(plantId);
    setImage(null);
    if (plantId) {
      const targetPlant = plants.find(p => p._id === plantId);
      if (targetPlant) {
        setPreview(getPlantImage(targetPlant));
      }
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image && !preview) {
      addNotification(t('diagnose.selectPlantOrImage', 'Please select a plant or provide an image for diagnosis'), 'error');
      return;
    }
    setLoading(true);
    const formData = new FormData();
    if (image) {
      formData.append('image', image);
    } else if (preview) {
      formData.append('imageUrl', preview);
    }
    if (selectedPlant) {
      formData.append('plantId', selectedPlant);
    }
    try {
      const diagnosis = await diagnosePlant(formData);
      setResult(diagnosis);
      addNotification(t('diagnose.diagnosisComplete', 'Diagnosis complete!'), 'success');
      loadData(); // Refresh history
    } catch (error) {
      addNotification(t('diagnose.diagnosisFailed', 'Diagnosis failed'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleHistoryClick = (item) => {
    setSelectedHistory(item);
    setResult(null);
    setPreview(null);
    setImage(null);
  };

  const handleAddToSchedule = (diagnosis) => {
    const taskData = {
      title: `Treatment: ${diagnosis.disease}`,
      description: diagnosis.treatment || 'Follow treatment plan',
      type: 'other',
      priority: diagnosis.confidence > 0.7 ? 'high' : 'medium',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      plantId: diagnosis.plantId || selectedPlant || '',
    };
    sessionStorage.setItem('quickTask', JSON.stringify(taskData));
    window.location.href = '/app/schedule';
  };

  const activePlantObj = plants.find(p => p._id === selectedPlant);

  return (
    <div className="diagnose-tab">
      <h2>
        <RiMicroscopeLine className="header-icon" /> {t('diagnose.title', 'Plant Disease Diagnosis')}
      </h2>
      
      <div className="diagnose-layout">
        {/* Left Column - Upload & Results */}
        <div className="diagnose-left">
          <div className="diagnose-upload-section">
            <p>{t('diagnose.subtitle', "Upload a clear photo of your plant's leaves or select a plant to run AI disease detection.")}</p>
            
            {/* Plant selector */}
            <div className="plant-selector">
              <label>{t('diagnose.selectPlantContext', 'Select Plant for Context:')}</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%' }}>
                {activePlantObj && (
                  <div style={{ width: '38px', height: '38px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, border: '1px solid var(--border-light, rgba(0,0,0,0.1))' }}>
                    <img 
                      src={getPlantImage(activePlantObj)} 
                      alt={activePlantObj.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  </div>
                )}
                <select 
                  value={selectedPlant} 
                  onChange={handlePlantSelect}
                  style={{ flex: 1 }}
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

            {/* Upload area with drag & drop */}
            <div 
              className={`upload-area ${isDragging ? 'dragging' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              {preview ? (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={preview} alt="Preview" className="preview-image" style={{ maxHeight: '240px', borderRadius: '12px', objectFit: 'contain' }} />
                </div>
              ) : (
                <div className="upload-placeholder">
                  <span className="upload-icon">
                    <RiCameraLine />
                  </span>
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
                <RiCameraLine /> {t('diagnose.takePhoto', 'Take Photo')}
              </button>
              <button 
                type="button" 
                className="btn-secondary"
                onClick={() => fileInputRef.current?.click()}
              >
                <RiFolderUploadLine /> {t('diagnose.browseFiles', 'Browse Files')}
              </button>
              <button 
                type="submit" 
                className="btn-primary" 
                onClick={handleSubmit}
                disabled={(!image && !preview) || loading}
              >
                {loading ? (
                  t('diagnose.analyzing', 'Analyzing...')
                ) : (
                  <>
                    <RiSparklingLine /> {t('diagnose.runDiagnosis', 'Run Diagnosis')}
                  </>
                )}
              </button>
            </div>
          </div>

          {result && (
            <div className="diagnose-result-section">
              <DiseaseResult 
                result={result} 
                onAddToSchedule={() => handleAddToSchedule(result)}
              />
            </div>
          )}

          {selectedHistory && (
            <div className="diagnose-result-section">
              <DiseaseResult 
                result={selectedHistory} 
                isHistory={true}
                onAddToSchedule={() => handleAddToSchedule(selectedHistory)}
                onClose={() => setSelectedHistory(null)}
              />
            </div>
          )}
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
          />
        </div>
      </div>

      {/* Live Camera Viewfinder Modal */}
      {isCameraOpen && (
        <div className="camera-modal-overlay" onClick={stopCamera}>
          <div className="camera-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="camera-modal-header">
              <h3>
                <RiCameraLine /> {t('diagnose.liveCamera', 'Live Plant Leaf Camera')}
              </h3>
              <button className="camera-close-btn" onClick={stopCamera} aria-label={t('common.close', 'Close Camera')}>
                <RiCloseLine />
              </button>
            </div>
            <div className="camera-viewport">
              <video ref={videoRef} autoPlay playsInline muted className="camera-video" />
              <div className="camera-guide-box" />
            </div>
            <div className="camera-modal-actions">
              <button type="button" className="btn-secondary" onClick={handleSwitchCamera}>
                <RiCameraSwitchLine /> {t('diagnose.switchCamera', 'Switch Camera')}
              </button>
              <button type="button" className="btn-primary camera-snap-btn" onClick={handleSnapPhoto}>
                <RiCameraLine /> {t('diagnose.capturePhoto', 'Capture Photo')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiagnoseTab;
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { diagnosePlant, getDiagnosisHistory, getPlants } from '../../services/plantService';
import { useNotification } from '../../hooks/useNotification';
import DiseaseResult from './DiseaseResult';
import DiagnosisHistory from './DiagnosisHistory';
import './DiagnoseTab.css';

const DiagnoseTab = () => {
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
    applyFilters();
  }, [history, filterStatus, searchTerm]);

  const loadData = async () => {
    try {
      const [historyData, plantsData] = await Promise.all([
        getDiagnosisHistory(),
        getPlants(),
      ]);
      setHistory(historyData || []);
      setFilteredHistory(historyData || []);
      setPlants(plantsData || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...history];
    
    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(h => 
        h.diseaseName.toLowerCase().includes(term) ||
        (h.plantId?.name && h.plantId.name.toLowerCase().includes(term))
      );
    }
    
    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(h => {
        if (filterStatus === 'resolved') return h.isResolved;
        if (filterStatus === 'critical') return h.confidence > 0.7 && !h.isResolved;
        if (filterStatus === 'monitoring') return h.confidence <= 0.7 && !h.isResolved;
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
      addNotification('Please drop an image file', 'error');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleImageFile(file);
    }
  };

  const handleImageFile = (file) => {
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
    setSelectedHistory(null);
  };

  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // For now, we'll use a file input with capture attribute
      // A more robust solution would use a video element and canvas
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment';
      input.click();
      input.onchange = (e) => {
        if (e.target.files[0]) {
          handleImageFile(e.target.files[0]);
        }
      };
    } catch (error) {
      addNotification('Camera access denied. Please upload an image.', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('image', image);
    if (selectedPlant) {
      formData.append('plantId', selectedPlant);
    }
    try {
      const diagnosis = await diagnosePlant(formData);
      setResult(diagnosis);
      addNotification('Diagnosis complete!', 'success');
      loadData(); // Refresh history
    } catch (error) {
      addNotification('Diagnosis failed', 'error');
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
    // Navigate to schedule with pre-filled data
    const taskData = {
      title: `Treatment: ${diagnosis.disease}`,
      description: diagnosis.treatment || 'Follow treatment plan',
      type: 'other',
      priority: diagnosis.confidence > 0.7 ? 'high' : 'medium',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      plantId: diagnosis.plantId || selectedPlant || '',
    };
    // Store in sessionStorage for the schedule page to pick up
    sessionStorage.setItem('quickTask', JSON.stringify(taskData));
    window.location.href = '/app/schedule';
  };

  return (
    <div className="diagnose-tab">
      <h2>🔬 Plant Disease Diagnosis</h2>
      
      <div className="diagnose-layout">
        {/* Left Column - Upload & Results */}
        <div className="diagnose-left">
          <div className="diagnose-upload-section">
            <p>Upload a photo of your plant's leaf to detect diseases.</p>
            
            {/* Plant selector */}
            <div className="plant-selector">
              <label>Link to Plant (optional):</label>
              <select 
                value={selectedPlant} 
                onChange={(e) => setSelectedPlant(e.target.value)}
              >
                <option value="">None</option>
                {plants.map(p => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
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
                <img src={preview} alt="Preview" className="preview-image" />
              ) : (
                <div className="upload-placeholder">
                  <span className="upload-icon">📸</span>
                  <span className="upload-text">Click or drag to upload</span>
                  <span className="upload-subtext">Supports JPG, PNG, GIF</span>
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
                📷 Take Photo
              </button>
              <button 
                type="button" 
                className="btn-secondary"
                onClick={() => fileInputRef.current?.click()}
              >
                📁 Browse Files
              </button>
              <button 
                type="submit" 
                className="btn-primary" 
                onClick={handleSubmit}
                disabled={!image || loading}
              >
                {loading ? 'Analyzing...' : '🔬 Diagnose'}
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
    </div>
  );
};

export default DiagnoseTab;
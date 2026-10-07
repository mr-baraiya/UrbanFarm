import React, { useRef, useState } from 'react';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function UploadBox({
  selectedFile,
  previewUrl,
  onImageSelected,
  onClearImage,
  disabled,
  t
}) {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Validate file: type, size, and ensure it loads into an Image object
  const validateAndProcessFile = (file) => {
    setValidationError('');

    if (!file) return;

    // 1. File type check
    const isMimeAllowed = ALLOWED_MIME_TYPES.includes(file.type);
    const hasValidExt = /\.(jpe?g|png|webp)$/i.test(file.name);
    if (!isMimeAllowed && !hasValidExt) {
      setValidationError(t.errFileType);
      return;
    }

    // 2. File size check (max 5 MB)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setValidationError(t.errFileSize);
      return;
    }

    // 3. Image loads properly check
    const reader = new FileReader();
    reader.onerror = () => {
      setValidationError(t.errCorruptImage);
    };
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      const img = new Image();
      img.onload = () => {
        if (img.naturalWidth > 0 && img.naturalHeight > 0) {
          onImageSelected({
            file,
            dataUrl,
            mimeType: file.type || 'image/jpeg'
          });
        } else {
          setValidationError(t.errCorruptImage);
        }
      };
      img.onerror = () => {
        setValidationError(t.errCorruptImage);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndProcessFile(file);
    }
    // Reset input value so re-selecting same file triggers onChange
    e.target.value = '';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndProcessFile(file);
    }
  };

  const handleTriggerUpload = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="upload-section">
      <input
        ref={fileInputRef}
        type="file"
        id="plant-photo-input"
        accept="image/jpeg,image/png,image/webp,image/*"
        capture="environment"
        onChange={handleInputChange}
        disabled={disabled}
        style={{ display: 'none' }}
      />

      {previewUrl ? (
        <div className="preview-container">
          <div className="preview-box">
            <img
              src={previewUrl}
              alt={t.selectedImage}
              className="preview-image"
            />
          </div>
          <div className="preview-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleTriggerUpload}
              disabled={disabled}
            >
              📷 {t.changeImage}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClearImage}
              disabled={disabled}
            >
              ✕ Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`dropzone ${dragActive ? 'dropzone-active' : ''} ${disabled ? 'dropzone-disabled' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleTriggerUpload}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') handleTriggerUpload();
          }}
        >
          <div className="dropzone-icon">🌱</div>
          <h2 className="dropzone-title">{t.uploadTitle}</h2>
          <p className="dropzone-text">{t.uploadInstructions}</p>
          <p className="dropzone-hint">{t.uploadCamera}</p>
          <span className="dropzone-badge">{t.uploadLimit}</span>
        </div>
      )}

      {validationError && (
        <div className="alert alert-error" role="alert">
          ⚠️ {validationError}
        </div>
      )}
    </div>
  );
}

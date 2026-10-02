import React, { useRef } from 'react';
import { RiQrCodeLine, RiCloseLine, RiDownload2Line, RiFileCopyLine } from 'react-icons/ri';
import { TbPlant2 } from 'react-icons/tb';
import { useNotification } from '../../hooks/useNotification';
import './QRCodeModal.css';

const QRCodeModal = ({ plant, onClose }) => {
  const qrRef = useRef(null);
  const { addNotification } = useNotification();

  if (!plant) return null;

  const plantUrl = `${window.location.origin}/app/plants/${plant._id}`;
  const encodedText = encodeURIComponent(plantUrl);
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedText}&color=2c5e3b&bgcolor=ffffff`;

  const handleDownload = async () => {
    try {
      const response = await fetch(qrImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `QR_${plant.name.replace(/\s+/g, '_')}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      addNotification('QR Code downloaded!', 'success');
    } catch (err) {
      window.open(qrImageUrl, '_blank');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(plantUrl);
    addNotification('Plant link copied to clipboard!', 'success');
  };

  return (
    <div className="qr-modal-overlay" onClick={onClose}>
      <div className="qr-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="qr-modal-header">
          <h3>
            <RiQrCodeLine className="qr-header-icon" /> Plant QR Code
          </h3>
          <button className="qr-close-btn" onClick={onClose} aria-label="Close">
            <RiCloseLine />
          </button>
        </div>
        <div className="qr-modal-body">
          <div className="qr-plant-info">
            <TbPlant2 className="qr-plant-icon" />
            <span className="qr-plant-name">{plant.name}</span>
            {plant.variety && <span className="qr-plant-variety">({plant.variety})</span>}
          </div>

          <div className="qr-code-frame" ref={qrRef}>
            <img src={qrImageUrl} alt={`QR code for ${plant.name}`} className="qr-image" />
          </div>

          <p className="qr-instructions">
            Scan this QR code with a smartphone camera to quickly view plant health, schedule, and growth history.
          </p>

          <div className="qr-link-box">
            <input type="text" readOnly value={plantUrl} />
            <button className="btn-secondary-small" onClick={handleCopyLink}>
              <RiFileCopyLine /> Copy
            </button>
          </div>

          <div className="qr-modal-actions">
            <button className="btn-secondary" onClick={onClose}>Close</button>
            <button className="btn-primary" onClick={handleDownload}>
              <RiDownload2Line /> Download QR Code
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;

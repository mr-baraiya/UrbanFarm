import React from 'react';
import { FaExclamationTriangle, FaTrash, FaTimes, FaCheck } from 'react-icons/fa';
import './ConfirmModal.css';

const ConfirmModal = ({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed with this action?',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  isDanger = true,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="confirm-modal-overlay" onClick={onClose}>
      <div className="confirm-modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="confirm-modal-close" onClick={onClose} aria-label="Close">
          <FaTimes />
        </button>

        <div className="confirm-modal-body">
          <div className={`confirm-modal-icon ${isDanger ? 'danger' : 'warning'}`}>
            {isDanger ? <FaTrash /> : <FaExclamationTriangle />}
          </div>

          <h3 className="confirm-modal-title">{title}</h3>
          <p className="confirm-modal-message">{message}</p>

          <div className="confirm-modal-actions">
            <button
              type="button"
              className="confirm-btn confirm-btn-cancel"
              onClick={onClose}
            >
              {cancelText}
            </button>
            <button
              type="button"
              className={`confirm-btn ${isDanger ? 'confirm-btn-danger' : 'confirm-btn-primary'}`}
              onClick={() => {
                onConfirm();
                onClose();
              }}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;

import React from 'react';
import './Modal.css';

const ConfirmModal = ({ 
  open, 
  title, 
  message, 
  confirmText = "Confirmar", 
  cancelText = "Cancelar", 
  onConfirm, 
  onCancel,
  type = "warning" // warning, danger, info
}) => {
  if (!open) return null;

  const getIcon = () => {
    switch (type) {
      case 'danger': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '❓';
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content confirm-modal">
        <div className="modal-header">
          <h3 className="modal-title">
            <span className="modal-icon">{getIcon()}</span>
            {title}
          </h3>
        </div>
        <div className="modal-body">
          <p className="confirm-message">{message}</p>
        </div>
        <div className="modal-footer">
          <button className="modal-btn cancel-btn" onClick={onCancel}>
            {cancelText}
          </button>
          <button className={`modal-btn confirm-btn ${type}`} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
import React from 'react';
import './Modal.css';

const Modal = ({ open, title, children, onClose, onConfirm, confirmText = "Guardar" }) => {
  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{title}</h3>
          <button onClick={onClose} className="modal-close-btn">✕</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">Cancelar</button>
          <button onClick={onConfirm} className="btn btn-primary">{confirmText}</button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
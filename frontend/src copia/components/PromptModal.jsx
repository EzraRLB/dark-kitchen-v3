import React, { useState } from 'react';
import './Modal.css';

const PromptModal = ({ 
  open, 
  title, 
  message, 
  placeholder = "", 
  inputType = "text",
  confirmText = "Confirmar", 
  cancelText = "Cancelar", 
  onConfirm, 
  onCancel 
}) => {
  const [inputValue, setInputValue] = useState('');

  if (!open) return null;

  const handleConfirm = () => {
    onConfirm(inputValue);
    setInputValue('');
  };

  const handleCancel = () => {
    onCancel();
    setInputValue('');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content prompt-modal">
        <div className="modal-header">
          <h3 className="modal-title">
            <span className="modal-icon">🔒</span>
            {title}
          </h3>
        </div>
        <div className="modal-body">
          <p className="prompt-message">{message}</p>
          <input
            type={inputType}
            className="modal-input prompt-input"
            placeholder={placeholder}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            autoFocus
          />
        </div>
        <div className="modal-footer">
          <button className="modal-btn cancel-btn" onClick={handleCancel}>
            {cancelText}
          </button>
          <button className="modal-btn confirm-btn" onClick={handleConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromptModal;
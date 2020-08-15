import React from 'react';

const ConfirmDialog = ({ title, message, onConfirm, onCancel }) => (
  <div className="auth-overlay">
    <div className="auth-dialog sk-panel">
      <div className="sk-panel-header">
        <div className="sk-panel-header-title">{title}</div>
      </div>
      <div className="sk-panel-content">
        <div className="sk-panel-section sk-panel-hero">
          <div className="sk-panel-row">
            <div className="sk-h1">{message}</div>
          </div>
        </div>
      </div>
      <div className="sk-panel-footer">
        <div className="sk-button-group stretch">
          <div className="sk-button neutral" onClick={onCancel}>
            <div className="sk-label">Cancel</div>
          </div>
          <div className="sk-button info" onClick={onConfirm}>
            <div className="sk-label">Confirm</div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default ConfirmDialog;

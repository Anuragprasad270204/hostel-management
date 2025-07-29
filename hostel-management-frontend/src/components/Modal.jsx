// src/components/Modal.jsx
import React from 'react';

function Modal({ show, title, onClose, children }) {
  if (!show) {
    return null; // Don't render if not shown
  }

  return (
    <div
      className="modal fade show"
      tabIndex="-1"
      role="dialog"
      style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }} // Custom styling for backdrop
      aria-labelledby="modalTitle"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="modalTitle">{title}</h5>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            {children} {/* Render whatever content is passed inside the modal */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Modal;
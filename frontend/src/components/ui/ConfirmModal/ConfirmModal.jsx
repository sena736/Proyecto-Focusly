import React from "react";
import { FiAlertTriangle, FiX } from "react-icons/fi";
import "./ConfirmModal.css";

const ConfirmModal = ({
  isOpen,
  title = "¿Estás seguro?",
  message = "Esta acción no se puede deshacer.",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
  type = "danger",
}) => {
  if (!isOpen) return null;

  return (
    <div className="confirm-modal-overlay" onClick={onCancel}>
      <div
        className="confirm-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="confirm-modal-close"
          onClick={onCancel}
          aria-label="Cerrar"
        >
          <FiX />
        </button>

        <div className={`confirm-modal-icon ${type}`}>
          <FiAlertTriangle />
        </div>

        <h2>{title}</h2>

        <p>{message}</p>

        <div className="confirm-modal-actions">
          <button
            className="confirm-modal-cancel"
            onClick={onCancel}
          >
            {cancelText}
          </button>

          <button
            className={`confirm-modal-confirm ${type}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
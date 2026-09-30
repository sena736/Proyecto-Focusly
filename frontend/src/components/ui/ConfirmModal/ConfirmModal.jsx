import React from "react";
import { FiAlertTriangle, FiX } from "react-icons/fi";
import "./ConfirmModal.css";

const ConfirmModal = ({
  isOpen,
  title = "¿Estás seguro?",
  message = "Esta acción no se puede deshacer.",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  loadingText = "Procesando...",
  onConfirm,
  onCancel,
  type = "danger",
  isLoading = false,
}) => {
  if (!isOpen) return null;

  // While a request is in flight the dialog cannot be dismissed
  const handleCancel = () => {
    if (isLoading) return;
    onCancel?.();
  };

  return (
    <div
      className="confirm-modal-overlay"
      onClick={handleCancel}
      role="presentation"
    >
      <div
        className="confirm-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        <button
          type="button"
          className="confirm-modal-close"
          onClick={handleCancel}
          disabled={isLoading}
          aria-label="Cerrar"
        >
          <FiX />
        </button>

        <div className={`confirm-modal-icon ${type}`}>
          <FiAlertTriangle />
        </div>

        <h2 id="confirm-modal-title">{title}</h2>

        <p>{message}</p>

        <div className="confirm-modal-actions">
          <button
            type="button"
            className="confirm-modal-cancel"
            onClick={handleCancel}
            disabled={isLoading}
          >
            {cancelText}
          </button>

          <button
            type="button"
            className={`confirm-modal-confirm ${type}`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? loadingText : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;

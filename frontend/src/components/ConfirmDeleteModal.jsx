import React from "react";

const ConfirmDeleteModal = ({
  isOpen,
  taskName = "esta tarea",
  onConfirm,
  onCancel,
  isDeleting = false,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="confirm-delete-overlay"
      onClick={onCancel}
      role="presentation"
    >
      <div
        className="confirm-delete-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-delete-title"
      >
        <div className="confirm-delete-icon">
          🗑️
        </div>

        <div className="confirm-delete-content">
          <h2 id="confirm-delete-title">
            ¿Eliminar tarea?
          </h2>

          <p>
            ¿Estás segura de que deseas eliminar{" "}
            <strong>"{taskName}"</strong>?
          </p>

          <span className="confirm-delete-warning">
            Esta acción no se puede deshacer.
          </span>
        </div>

        <div className="confirm-delete-actions">
          <button
            type="button"
            className="confirm-delete-cancel"
            onClick={onCancel}
            disabled={isDeleting}
          >
            Cancelar
          </button>

          <button
            type="button"
            className="confirm-delete-confirm"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
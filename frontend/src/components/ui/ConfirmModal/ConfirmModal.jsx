import "./ConfirmModal.css";

function ConfirmModal({
  isOpen,
  title = "¿Estás seguro?",
  message = "Esta acción no se puede deshacer.",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-icon">?</div>

        <h2>{title}</h2>

        <p>{message}</p>

        <div className="modal-buttons">
          <button className="modal-cancel" onClick={onCancel}>
            {cancelText}
          </button>

          <button className="modal-confirm" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;

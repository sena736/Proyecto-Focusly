import { useEffect } from "react";
import { createPortal } from "react-dom";
import "./Modal.css";

/**
 * Modal reutilizable para Focusly.
 *
 * Ejemplo:
 * <Modal
 *   isOpen={showModal}
 *   onClose={() => setShowModal(false)}
 *   title="Nueva tarea"
 *   description="Agrega una actividad para organizar tu tiempo."
 *   confirmText="Guardar"
 *   onConfirm={handleSave}
 * >
 *   <input ... />
 * </Modal>
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  showCancel = true,
  showConfirm = true,
  variant = "default",
  closeOnOverlay = true,
  closeOnEscape = true,
  loading = false,
  icon,
}) {
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !loading) {
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, closeOnEscape, onClose, loading]);

  if (!isOpen) return null;

  const handleOverlayClick = (event) => {
    if (closeOnOverlay && event.target === event.currentTarget && !loading) {
      onClose?.();
    }
  };

  const handleConfirm = async () => {
    if (!onConfirm || loading) return;
    await onConfirm();
  };

  const modal = (
    <div
      className="focusly-modal-overlay"
      role="presentation"
      onMouseDown={handleOverlayClick}
    >
      <section
        className={`focusly-modal focusly-modal--${variant}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="focusly-modal-title"
        aria-describedby={description ? "focusly-modal-description" : undefined}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="focusly-modal-decoration" aria-hidden="true" />

        <button
          type="button"
          className="focusly-modal-close"
          aria-label="Cerrar ventana"
          onClick={onClose}
          disabled={loading}
        >
          ×
        </button>

        <div className="focusly-modal-header">
          {icon && (
            <div className="focusly-modal-icon" aria-hidden="true">
              {icon}
            </div>
          )}

          <div>
            <h2 id="focusly-modal-title">{title}</h2>
            {description && <p id="focusly-modal-description">{description}</p>}
          </div>
        </div>

        {children && <div className="focusly-modal-body">{children}</div>}

        {(showCancel || showConfirm) && (
          <footer className="focusly-modal-footer">
            {showCancel && (
              <button
                type="button"
                className="focusly-modal-button focusly-modal-button--secondary"
                onClick={onClose}
                disabled={loading}
              >
                {cancelText}
              </button>
            )}

            {showConfirm && (
              <button
                type="button"
                className={`focusly-modal-button focusly-modal-button--primary ${
                  variant === "danger" ? "focusly-modal-button--danger" : ""
                }`}
                onClick={handleConfirm}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="focusly-modal-spinner" />
                    Procesando...
                  </>
                ) : (
                  confirmText
                )}
              </button>
            )}
          </footer>
        )}
      </section>
    </div>
  );

  return createPortal(modal, document.body);
}

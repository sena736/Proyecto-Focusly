import { useEffect, useId, useRef, useState } from "react";
import "./Select.css";

/**
 * Select reutilizable para Focusly.
 *
 * Uso:
 * <Select
 *   label="Rol"
 *   value={role}
 *   onChange={setRole}
 *   options={[
 *     { value: "usuario", label: "Usuario" },
 *     { value: "admin", label: "Administrador" },
 *   ]}
 * />
 *
 * También acepta:
 * - placeholder
 * - helperText
 * - error
 * - disabled
 * - required
 * - icon
 * - searchable
 */

export default function Select({
  label,
  value = "",
  onChange,
  options = [],
  placeholder = "Selecciona una opción",
  helperText,
  error,
  disabled = false,
  required = false,
  icon,
  searchable = false,
  name,
  id,
  className = "",
}) {
  const generatedId = useId();
  const selectId = id || `focusly-select-${generatedId}`;
  const listId = `${selectId}-listbox`;

  const wrapperRef = useRef(null);
  const searchRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selectedOption = options.find(
    (option) => String(option.value) === String(value),
  );

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(query.toLowerCase()),
  );

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        setOpen(false);
        setQuery("");
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    if (open && searchable) {
      searchRef.current?.focus();
    }
  }, [open, searchable]);

  const handleSelect = (option) => {
    if (option.disabled) return;

    onChange?.(option.value, option);
    setOpen(false);
    setQuery("");
  };

  const handleKeyDown = (event) => {
    if (disabled) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen((current) => !current);
    }

    if (event.key === "Escape") {
      setOpen(false);
    }
  };

  const classes = [
    "focusly-select",
    open ? "is-open" : "",
    error ? "has-error" : "",
    disabled ? "is-disabled" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} ref={wrapperRef}>
      {label && (
        <label className="focusly-select__label" htmlFor={selectId}>
          {label}
          {required && <span aria-hidden="true"> *</span>}
        </label>
      )}

      <input type="hidden" name={name} value={value ?? ""} />

      <button
        id={selectId}
        type="button"
        className="focusly-select__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-invalid={Boolean(error)}
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={handleKeyDown}
      >
        <span className="focusly-select__trigger-content">
          {icon && (
            <span className="focusly-select__icon" aria-hidden="true">
              {icon}
            </span>
          )}

          <span
            className={`focusly-select__value ${
              !selectedOption ? "is-placeholder" : ""
            }`}
          >
            {selectedOption?.label || placeholder}
          </span>
        </span>

        <span className="focusly-select__arrow" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path
              d="m7 9 5 5 5-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      {open && (
        <div
          className="focusly-select__menu"
          role="listbox"
          id={listId}
          aria-labelledby={selectId}
        >
          {searchable && (
            <div className="focusly-select__search">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle
                  cx="11"
                  cy="11"
                  r="6.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <path
                  d="m16 16 4 4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>

              <input
                ref={searchRef}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar..."
                aria-label="Buscar opciones"
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    event.stopPropagation();
                    setOpen(false);
                  }
                }}
              />
            </div>
          )}

          <div className="focusly-select__options">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const isSelected = String(option.value) === String(value);

                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    disabled={option.disabled}
                    className={`focusly-select__option ${
                      isSelected ? "is-selected" : ""
                    } ${option.disabled ? "is-option-disabled" : ""}`}
                    onClick={() => handleSelect(option)}
                  >
                    <span>{option.label}</span>

                    {isSelected && (
                      <svg
                        className="focusly-select__check"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          d="m5 12 4.2 4.2L19 6.8"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="focusly-select__empty">
                No se encontraron opciones
              </div>
            )}
          </div>
        </div>
      )}

      {(error || helperText) && (
        <p className={`focusly-select__message ${error ? "is-error" : ""}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
}

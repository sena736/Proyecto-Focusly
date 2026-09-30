import React, { useId } from "react";
import "./Input.css";

const Input = ({
  label,
  type = "text",
  name,
  id,
  value,
  onChange,
  placeholder = "",
  icon,
  endAdornment,
  labelAction,
  error,
  disabled = false,
  required = false,
  showRequiredMark = false,
  className = "",
  ...props
}) => {
  // `id` defaults to `name` so the label keeps pointing at the control.
  const generatedId = useId();
  // Without id/name a generated one keeps the label and the error message linked.
  const controlId = id ?? name ?? generatedId;
  const errorId = error ? `${controlId}-error` : undefined;

  const fieldClasses = ["input-field", className].filter(Boolean).join(" ");

  const wrapperClasses = [
    "input-wrapper",
    error ? "input-error" : "",
    disabled ? "input-disabled" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const labelElement = label && (
    <label htmlFor={controlId} className="input-label">
      {label}

      {showRequiredMark && (
        <span className="input-required" aria-hidden="true">
          *
        </span>
      )}
    </label>
  );

  return (
    <div className={fieldClasses}>
      {labelElement &&
        (labelAction ? (
          <div className="input-label-row">
            {labelElement}
            {labelAction}
          </div>
        ) : (
          labelElement
        ))}

      <div className={wrapperClasses}>
        {icon && <span className="input-icon">{icon}</span>}

        <input
          id={controlId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          {...props}
          disabled={disabled}
          required={required}
          aria-required={showRequiredMark && !required ? "true" : undefined}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={errorId}
          className="input-control"
        />

        {endAdornment && <span className="input-end">{endAdornment}</span>}
      </div>

      {error && (
        <span id={errorId} className="input-error-message">
          {error}
        </span>
      )}
    </div>
  );
};

export default Input;

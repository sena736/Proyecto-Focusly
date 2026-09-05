import React from "react";
import "./Input.css";

const Input = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder = "",
  icon,
  error,
  disabled = false,
  required = false,
  ...props
}) => {
  return (
    <div className="input-field">

      {label && (
        <label htmlFor={name} className="input-label">
          {label}

          {required && (
            <span className="input-required">*</span>
          )}
        </label>
      )}

      <div
        className={`input-wrapper ${
          error ? "input-error" : ""
        } ${disabled ? "input-disabled" : ""}`}
      >
        {icon && (
          <span className="input-icon">
            {icon}
          </span>
        )}

        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className="input-control"
          {...props}
        />
      </div>

      {error && (
        <span className="input-error-message">
          {error}
        </span>
      )}

    </div>
  );
};

export default Input;
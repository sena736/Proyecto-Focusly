import React from "react";
import { FiShield, FiChevronDown } from "react-icons/fi";
import "./RoleSelect.css";

const RoleSelect = ({
  value = "Usuario",
  onChange,
  label = "Rol",
  name = "role",
  disabled = false,
  required = false,
  error = "",
}) => {
  const roles = [
    {
      value: "Invitado",
      label: "Invitado",
    },
    {
      value: "Usuario",
      label: "Usuario",
    },
    {
      value: "Administrador",
      label: "Administrador",
    },
  ];

  return (
    <div className="role-select-container">

      {/* Label */}
      {label && (
        <label htmlFor={name} className="role-select-label">
          {label}

          {required && (
            <span className="role-required">*</span>
          )}
        </label>
      )}

      {/* Select */}
      <div
        className={`role-select-wrapper ${
          error ? "role-select-error" : ""
        } ${disabled ? "role-select-disabled" : ""}`}
      >
        <FiShield className="role-select-icon" />

        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className="role-select"
        >
          <option value="" disabled>
            Seleccionar rol
          </option>

          {roles.map((role) => (
            <option
              key={role.value}
              value={role.value}
            >
              {role.label}
            </option>
          ))}
        </select>

        <FiChevronDown className="role-select-arrow" />
      </div>

      {/* Error */}
      {error && (
        <span className="role-select-error-message">
          {error}
        </span>
      )}

    </div>
  );
};

export default RoleSelect;
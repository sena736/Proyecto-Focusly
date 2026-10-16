import React, { useState } from "react";
import Alert from "../../ui/Alert/Alert";
import Button from "../../ui/Button/Button";
import Input from "../../ui/Input/Input";
import "./ProfileEditForm.css";

export const MAX_NAME_LENGTH = 100;

/**
 * Mirrors the backend rules (PATCH /profile): required, trimmed, 1..100.
 * Returns the error message, or "" when the name is valid.
 */
const validateName = (value) => {
  const trimmed = value.trim();

  if (/\p{Cc}/u.test(trimmed)) {
    return "El nombre contiene caracteres no válidos.";
  }

  // Nothing visible left once format/zero-width characters are removed.
  if (!trimmed.replace(/[\p{Cf}\s]/gu, "")) {
    return "El nombre es obligatorio.";
  }

  // Count code points, not UTF-16 units, so an emoji is one character.
  if ([...trimmed].length > MAX_NAME_LENGTH) {
    return `El nombre no puede superar ${MAX_NAME_LENGTH} caracteres.`;
  }

  return "";
};

const ProfileEditForm = ({
  initialName = "",
  onSubmit,
  onCancel,
  loading = false,
  error = "",
}) => {
  const [name, setName] = useState(initialName);
  const [nameError, setNameError] = useState("");

  const handleChange = (event) => {
    setName(event.target.value);

    // Remove the error once the user starts correcting the field.
    if (nameError) {
      setNameError("");
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const validationError = validateName(name);

    if (validationError) {
      setNameError(validationError);
      return;
    }

    onSubmit?.({ name: name.trim() });
  };

  return (
    <form className="profile-edit-form" onSubmit={handleSubmit} noValidate>
      {error && <Alert type="error" message={error} showClose={false} />}

      <Input
        label="Nombre"
        id="profile-name"
        name="name"
        type="text"
        value={name}
        onChange={handleChange}
        placeholder="Tu nombre"
        autoComplete="name"
        autoFocus
        disabled={loading}
        error={nameError}
        showRequiredMark
      />

      <div className="profile-edit-form__actions">
        <Button
          type="button"
          variant="secondary"
          className="profile-edit-form__cancel"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </Button>

        <Button
          type="submit"
          className="profile-edit-form__submit"
          loading={loading}
          loadingText="Guardando..."
        >
          Guardar cambios
        </Button>
      </div>
    </form>
  );
};

export default ProfileEditForm;

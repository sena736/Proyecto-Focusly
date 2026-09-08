// src/utils/validators.js

/* =========================================================
   FOCUSLY - VALIDADORES
========================================================= */

/* =========================================================
   1. VALIDAR CAMPO OBLIGATORIO
========================================================= */

/**
 * Verifica que un valor no esté vacío.
 *
 * @param {string|number|null|undefined} value
 * @returns {boolean}
 */
export const isRequired = (value) => {
  if (value === null || value === undefined) {
    return false;
  }

  return String(value).trim().length > 0;
};

/* =========================================================
   2. VALIDAR EMAIL
========================================================= */

/**
 * Verifica que un correo electrónico tenga
 * un formato válido.
 *
 * @param {string} email
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  if (!email) return false;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailRegex.test(email.trim());
};

/* =========================================================
   3. VALIDAR LONGITUD MÍNIMA
========================================================= */

/**
 * @param {string} value
 * @param {number} min
 * @returns {boolean}
 */
export const hasMinLength = (value, min = 1) => {
  if (!value) return false;

  return value.trim().length >= min;
};

/* =========================================================
   4. VALIDAR LONGITUD MÁXIMA
========================================================= */

/**
 * @param {string} value
 * @param {number} max
 * @returns {boolean}
 */
export const hasMaxLength = (value, max) => {
  if (value === null || value === undefined) {
    return true;
  }

  return String(value).trim().length <= max;
};

/* =========================================================
   5. VALIDAR RANGO DE LONGITUD
========================================================= */

/**
 * @param {string} value
 * @param {number} min
 * @param {number} max
 * @returns {boolean}
 */
export const isLengthBetween = (value, min, max) => {
  if (!value) return false;

  const length = value.trim().length;

  return length >= min && length <= max;
};

/* =========================================================
   6. VALIDAR NOMBRE
========================================================= */

/**
 * Permite:
 *
 * Oscar Pérez
 * María José
 * Juan Carlos
 *
 * @param {string} name
 * @returns {boolean}
 */
export const isValidName = (name) => {
  if (!name) return false;

  const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s'-]+$/;

  return nameRegex.test(name.trim());
};

/* =========================================================
   7. VALIDAR NÚMERO POSITIVO
========================================================= */

/**
 * @param {number|string} value
 * @returns {boolean}
 */
export const isPositiveNumber = (value) => {
  if (value === "" || value === null || value === undefined) {
    return false;
  }

  const number = Number(value);

  return Number.isFinite(number) && number > 0;
};

/* =========================================================
   8. VALIDAR ENTERO POSITIVO
========================================================= */

/**
 * Ejemplos válidos:
 *
 * 1
 * 5
 * 25
 *
 * @param {number|string} value
 * @returns {boolean}
 */
export const isPositiveInteger = (value) => {
  if (value === "" || value === null || value === undefined) {
    return false;
  }

  const number = Number(value);

  return Number.isInteger(number) && number > 0;
};

/* =========================================================
   9. VALIDAR NÚMERO DENTRO DE UN RANGO
========================================================= */

/**
 * @param {number|string} value
 * @param {number} min
 * @param {number} max
 * @returns {boolean}
 */
export const isNumberBetween = (value, min, max) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return false;
  }

  return number >= min && number <= max;
};

/* =========================================================
   10. VALIDAR FECHA
========================================================= */

/**
 * Verifica que un valor pueda convertirse
 * correctamente en una fecha.
 *
 * @param {string|Date|number} date
 * @returns {boolean}
 */
export const isValidDateValue = (date) => {
  if (!date) return false;

  const parsedDate = new Date(date);

  return !Number.isNaN(parsedDate.getTime());
};

/* =========================================================
   11. VALIDAR FECHA ACTUAL O FUTURA
========================================================= */

/**
 * Útil para la fecha límite de una tarea.
 *
 * Permite:
 *
 * - Hoy
 * - Mañana
 * - Cualquier fecha futura
 *
 * @param {string|Date|number} date
 * @returns {boolean}
 */
export const isTodayOrFutureDate = (date) => {
  if (!isValidDateValue(date)) {
    return false;
  }

  const selectedDate = new Date(date);
  const today = new Date();

  selectedDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return selectedDate >= today;
};

/* =========================================================
   12. VALIDAR ROL
========================================================= */

/**
 * Roles permitidos por Focusly.
 *
 * @param {string} role
 * @returns {boolean}
 */
export const isValidRole = (role) => {
  const roles = ["USER", "ADMIN"];

  return roles.includes(role);
};

/* =========================================================
   13. VALIDAR TÍTULO DE TAREA
========================================================= */

/**
 * Valida el título de una tarea.
 *
 * Reglas frontend:
 *
 * - Obligatorio
 * - Mínimo 3 caracteres
 * - Máximo 100 caracteres
 *
 * @param {string} title
 * @returns {boolean}
 */
export const isValidTaskTitle = (title) => {
  if (!isRequired(title)) {
    return false;
  }

  return isLengthBetween(title, 3, 100);
};

/* =========================================================
   14. VALIDAR DESCRIPCIÓN DE TAREA
========================================================= */

/**
 * La descripción puede estar vacía.
 *
 * Si existe, no puede superar
 * los 500 caracteres.
 *
 * @param {string} description
 * @returns {boolean}
 */
export const isValidTaskDescription = (description) => {
  if (!description) {
    return true;
  }

  return hasMaxLength(description, 500);
};

/* =========================================================
   15. VALIDAR FORMULARIO DE TAREA
========================================================= */

/**
 * Retorna un objeto con los errores encontrados.
 *
 * Si no existen errores:
 *
 * {}
 *
 * @param {Object} task
 * @returns {Object}
 */
export const validateTask = (task = {}) => {
  const errors = {};

  /* -------------------------
     Título
  ------------------------- */

  if (!isRequired(task.title)) {
    errors.title = "El título de la tarea es obligatorio.";
  } else if (!hasMinLength(task.title, 3)) {
    errors.title = "El título debe tener al menos 3 caracteres.";
  } else if (!hasMaxLength(task.title, 100)) {
    errors.title = "El título no puede superar los 100 caracteres.";
  }

  /* -------------------------
     Descripción
  ------------------------- */

  if (task.description && !hasMaxLength(task.description, 500)) {
    errors.description = "La descripción no puede superar los 500 caracteres.";
  }

  /* -------------------------
     Fecha límite
  ------------------------- */

  if (task.dueDate) {
    if (!isValidDateValue(task.dueDate)) {
      errors.dueDate = "La fecha seleccionada no es válida.";
    } else if (!isTodayOrFutureDate(task.dueDate)) {
      errors.dueDate = "La fecha límite no puede ser anterior a hoy.";
    }
  }

  return errors;
};

/* =========================================================
   16. VALIDAR PERFIL
========================================================= */

/**
 * Valida los campos editables del perfil.
 *
 * @param {Object} profile
 * @returns {Object}
 */
export const validateProfile = (profile = {}) => {
  const errors = {};

  /* -------------------------
     Nombre
  ------------------------- */

  if (!isRequired(profile.name)) {
    errors.name = "El nombre es obligatorio.";
  } else if (!hasMinLength(profile.name, 2)) {
    errors.name = "El nombre debe tener al menos 2 caracteres.";
  } else if (!hasMaxLength(profile.name, 80)) {
    errors.name = "El nombre no puede superar los 80 caracteres.";
  } else if (!isValidName(profile.name)) {
    errors.name = "El nombre contiene caracteres no permitidos.";
  }

  /* -------------------------
     Email
  ------------------------- */

  if (profile.email) {
    if (!isValidEmail(profile.email)) {
      errors.email = "El correo electrónico no es válido.";
    }
  }

  return errors;
};

/* =========================================================
   17. VALIDAR CONFIGURACIÓN DEL POMODORO
========================================================= */

/**
 * Valida los tiempos configurados
 * para el Pomodoro.
 *
 * @param {Object} settings
 * @returns {Object}
 */
export const validatePomodoroSettings = (settings = {}) => {
  const errors = {};

  /* -------------------------
     Tiempo de enfoque
  ------------------------- */

  if (!isPositiveInteger(settings.workMinutes)) {
    errors.workMinutes =
      "El tiempo de enfoque debe ser un número entero positivo.";
  } else if (!isNumberBetween(settings.workMinutes, 1, 120)) {
    errors.workMinutes =
      "El tiempo de enfoque debe estar entre 1 y 120 minutos.";
  }

  /* -------------------------
     Tiempo de descanso
  ------------------------- */

  if (!isPositiveInteger(settings.breakMinutes)) {
    errors.breakMinutes =
      "El tiempo de descanso debe ser un número entero positivo.";
  } else if (!isNumberBetween(settings.breakMinutes, 1, 60)) {
    errors.breakMinutes =
      "El tiempo de descanso debe estar entre 1 y 60 minutos.";
  }

  return errors;
};

/* =========================================================
   18. COMPROBAR SI EXISTEN ERRORES
========================================================= */

/**
 * Permite comprobar rápidamente si un objeto
 * de validación contiene errores.
 *
 * @param {Object} errors
 * @returns {boolean}
 */
export const hasErrors = (errors = {}) => {
  return Object.keys(errors).length > 0;
};

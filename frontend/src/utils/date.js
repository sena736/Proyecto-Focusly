// src/utils/date.js

/* =========================================================
   FOCUSLY - UTILIDADES PARA FECHAS
========================================================= */

/* =========================================================
   1. CONFIGURACIÓN
========================================================= */

const DEFAULT_LOCALE = "es-CO";

/* =========================================================
   2. CONVERTIR UN VALOR A DATE
========================================================= */

/**
 * Convierte un valor recibido a un objeto Date.
 *
 * @param {string|Date|number} date
 * @returns {Date|null}
 */
export const parseDate = (date) => {
  if (!date) return null;

  const parsedDate = date instanceof Date ? date : new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate;
};

/* =========================================================
   3. VALIDAR FECHA
========================================================= */

/**
 * Verifica si un valor representa una fecha válida.
 *
 * @param {string|Date|number} date
 * @returns {boolean}
 */
export const isValidDate = (date) => {
  return parseDate(date) !== null;
};

/* =========================================================
   4. FORMATEAR FECHA
========================================================= */

/**
 * Convierte una fecha a:
 *
 * 7 sep 2026
 *
 * @param {string|Date|number} date
 * @returns {string}
 */
export const formatDate = (date) => {
  const parsedDate = parseDate(date);

  if (!parsedDate) return "";

  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsedDate);
};

/* =========================================================
   5. FORMATEAR FECHA LARGA
========================================================= */

/**
 * Convierte una fecha a:
 *
 * lunes, 7 de septiembre de 2026
 *
 * @param {string|Date|number} date
 * @returns {string}
 */
export const formatLongDate = (date) => {
  const parsedDate = parseDate(date);

  if (!parsedDate) return "";

  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsedDate);
};

/* =========================================================
   6. FORMATEAR FECHA Y HORA
========================================================= */

/**
 * Ejemplo:
 *
 * 7 sep 2026, 8:30 p. m.
 *
 * @param {string|Date|number} date
 * @returns {string}
 */
export const formatDateTime = (date) => {
  const parsedDate = parseDate(date);

  if (!parsedDate) return "";

  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(parsedDate);
};

/* =========================================================
   7. FORMATEAR SOLO HORA
========================================================= */

/**
 * Ejemplo:
 *
 * 8:30 p. m.
 *
 * @param {string|Date|number} date
 * @returns {string}
 */
export const formatTime = (date) => {
  const parsedDate = parseDate(date);

  if (!parsedDate) return "";

  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    hour: "numeric",
    minute: "2-digit",
  }).format(parsedDate);
};

/* =========================================================
   8. OBTENER FECHA PARA INPUT TYPE="DATE"
========================================================= */

/**
 * Convierte una fecha a:
 *
 * 2026-09-07
 *
 * Útil para:
 *
 * <input type="date" />
 *
 * @param {string|Date|number} date
 * @returns {string}
 */
export const formatDateForInput = (date) => {
  const parsedDate = parseDate(date);

  if (!parsedDate) return "";

  const year = parsedDate.getFullYear();

  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");

  const day = String(parsedDate.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

/* =========================================================
   9. OBTENER LA FECHA DE HOY
========================================================= */

/**
 * Retorna la fecha actual en formato:
 *
 * 2026-09-07
 *
 * @returns {string}
 */
export const getToday = () => {
  return formatDateForInput(new Date());
};

/* =========================================================
   10. COMPROBAR SI UNA FECHA ES HOY
========================================================= */

/**
 * @param {string|Date|number} date
 * @returns {boolean}
 */
export const isToday = (date) => {
  const parsedDate = parseDate(date);

  if (!parsedDate) return false;

  const today = new Date();

  return (
    parsedDate.getFullYear() === today.getFullYear() &&
    parsedDate.getMonth() === today.getMonth() &&
    parsedDate.getDate() === today.getDate()
  );
};

/* =========================================================
   11. COMPROBAR SI UNA FECHA YA VENCIÓ
========================================================= */

/**
 * Útil para determinar si una tarea está vencida.
 *
 * Se compara solamente la fecha, ignorando la hora.
 *
 * @param {string|Date|number} date
 * @returns {boolean}
 */
export const isPastDate = (date) => {
  const parsedDate = parseDate(date);

  if (!parsedDate) return false;

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  parsedDate.setHours(0, 0, 0, 0);

  return parsedDate < today;
};

/* =========================================================
   12. COMPROBAR SI UNA FECHA ES FUTURA
========================================================= */

/**
 * @param {string|Date|number} date
 * @returns {boolean}
 */
export const isFutureDate = (date) => {
  const parsedDate = parseDate(date);

  if (!parsedDate) return false;

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  parsedDate.setHours(0, 0, 0, 0);

  return parsedDate > today;
};

/* =========================================================
   13. DIFERENCIA EN DÍAS
========================================================= */

/**
 * Calcula la diferencia de días entre dos fechas.
 *
 * @param {string|Date|number} startDate
 * @param {string|Date|number} endDate
 * @returns {number|null}
 */
export const differenceInDays = (startDate, endDate) => {
  const start = parseDate(startDate);
  const end = parseDate(endDate);

  if (!start || !end) return null;

  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const difference = end.getTime() - start.getTime();

  return Math.round(difference / (1000 * 60 * 60 * 24));
};

/* =========================================================
   14. DÍAS RESTANTES
========================================================= */

/**
 * Retorna cuántos días faltan para una fecha.
 *
 * Ejemplo:
 *
 * 0  -> hoy
 * 1  -> mañana
 * -1 -> venció ayer
 *
 * @param {string|Date|number} date
 * @returns {number|null}
 */
export const daysUntil = (date) => {
  return differenceInDays(new Date(), date);
};

/* =========================================================
   15. TEXTO AMIGABLE PARA FECHAS DE TAREAS
========================================================= */

/**
 * Convierte una fecha en texto más amigable.
 *
 * Ejemplos:
 *
 * Hoy
 * Mañana
 * Ayer
 * En 3 días
 * Hace 2 días
 *
 * @param {string|Date|number} date
 * @returns {string}
 */
export const getRelativeDateLabel = (date) => {
  const days = daysUntil(date);

  if (days === null) return "";

  if (days === 0) {
    return "Hoy";
  }

  if (days === 1) {
    return "Mañana";
  }

  if (days === -1) {
    return "Ayer";
  }

  if (days > 1) {
    return `En ${days} días`;
  }

  return `Hace ${Math.abs(days)} días`;
};

/* =========================================================
   16. TEXTO PARA FECHA DE VENCIMIENTO
========================================================= */

/**
 * Especialmente útil para TaskCard.
 *
 * Ejemplos:
 *
 * Vence hoy
 * Vence mañana
 * Vence en 4 días
 * Vencida hace 2 días
 *
 * @param {string|Date|number} date
 * @returns {string}
 */
export const getDueDateLabel = (date) => {
  const days = daysUntil(date);

  if (days === null) return "";

  if (days === 0) {
    return "Vence hoy";
  }

  if (days === 1) {
    return "Vence mañana";
  }

  if (days > 1) {
    return `Vence en ${days} días`;
  }

  if (days === -1) {
    return "Vencida ayer";
  }

  return `Vencida hace ${Math.abs(days)} días`;
};

/* =========================================================
   17. ORDENAR POR FECHA ASCENDENTE
========================================================= */

/**
 * Ordena elementos desde la fecha más cercana
 * hasta la más lejana.
 *
 * No modifica el array original.
 *
 * @param {Array} items
 * @param {string} dateField
 * @returns {Array}
 */
export const sortByDateAscending = (items = [], dateField = "dueDate") => {
  return [...items].sort((a, b) => {
    const dateA = parseDate(a[dateField]);
    const dateB = parseDate(b[dateField]);

    if (!dateA && !dateB) return 0;

    if (!dateA) return 1;

    if (!dateB) return -1;

    return dateA.getTime() - dateB.getTime();
  });
};

/* =========================================================
   18. ORDENAR POR FECHA DESCENDENTE
========================================================= */

/**
 * Útil para historial de Pomodoro.
 *
 * @param {Array} items
 * @param {string} dateField
 * @returns {Array}
 */
export const sortByDateDescending = (items = [], dateField = "createdAt") => {
  return [...items].sort((a, b) => {
    const dateA = parseDate(a[dateField]);
    const dateB = parseDate(b[dateField]);

    if (!dateA && !dateB) return 0;

    if (!dateA) return 1;

    if (!dateB) return -1;

    return dateB.getTime() - dateA.getTime();
  });
};

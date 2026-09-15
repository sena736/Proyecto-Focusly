// src/utils/constants.js

/* =========================================================
   FOCUSLY - CONSTANTES GLOBALES
========================================================= */

/* =========================================================
   1. ROLES DE USUARIO
========================================================= */

export const USER_ROLES = {
  USER: "USER",
  ADMIN: "ADMIN",
};

/* =========================================================
   2. RUTAS DE LA APLICACIÓN
========================================================= */

export const ROUTES = {
  HOME: "/",
  ABOUT: "/about",
  LOGIN: "/login",

  DASHBOARD: "/dashboard",
  POMODORO: "/pomodoro",
  TASKS: "/tasks",
  MOTIVATION: "/motivation",
  PROFILE: "/profile",
  SETTINGS: "/settings",

  ADMIN: "/admin",
  ADMIN_USERS: "/admin/users",
  ADMIN_SETTINGS: "/admin/settings",
};

/* =========================================================
   3. ENDPOINTS DEL BACKEND
========================================================= */

export const API_ENDPOINTS = {
  AUTH: {
    GOOGLE: "/auth/google",
    GOOGLE_CALLBACK: "/auth/google/callback",
    LOGOUT: "/auth/logout",
    ME: "/auth/me",
  },

  PROFILE: {
    BASE: "/profile",
  },

  TASKS: {
    BASE: "/tasks",
    BY_ID: (id) => `/tasks/${id}`,
  },

  POMODORO: {
    BASE: "/pomodoro-sessions",
  },

  PHRASES: {
    RANDOM: "/phrases/random",
  },

  USERS: {
    BASE: "/users",
    ROLE: (id) => `/users/${id}/role`,
  },
};

/* =========================================================
   4. ESTADOS DE TAREAS
========================================================= */

export const TASK_STATUS = {
  PENDING: "PENDING",
  COMPLETED: "COMPLETED",
};

/* =========================================================
   5. FILTROS DE TAREAS
========================================================= */

export const TASK_FILTERS = {
  ALL: "ALL",
  PENDING: "PENDING",
  COMPLETED: "COMPLETED",
};

/* =========================================================
   6. TIPOS DE POMODORO
========================================================= */

export const POMODORO_TYPES = {
  WORK: "WORK",
  BREAK: "BREAK",
};

/* =========================================================
   7. CONFIGURACIÓN PREDETERMINADA DEL POMODORO
========================================================= */

export const POMODORO_DEFAULTS = {
  WORK_MINUTES: 25,
  SHORT_BREAK_MINUTES: 5,
};

/* =========================================================
   8. TEMA DE LA APLICACIÓN
========================================================= */

export const THEMES = {
  LIGHT: "light",
  DARK: "dark",
};

/* =========================================================
   9. CLAVES DE STORAGE
========================================================= */

export const STORAGE_KEYS = {
  AUTH_TOKEN: "focusly_token",
  THEME: "focusly_theme",
};

/* =========================================================
   10. CONFIGURACIÓN DE PAGINACIÓN
========================================================= */

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
};

/* =========================================================
   11. QUERY KEYS - REACT QUERY
========================================================= */

export const QUERY_KEYS = {
  AUTH_USER: ["auth-user"],
  PROFILE: ["profile"],
  TASKS: ["tasks"],
  POMODORO_SESSIONS: ["pomodoro-sessions"],
  MOTIVATIONAL_PHRASE: ["motivational-phrase"],
  USERS: ["users"],
};

/* =========================================================
   12. MENSAJES GENERALES
========================================================= */

export const MESSAGES = {
  GENERIC_ERROR: "Ha ocurrido un error. Inténtalo nuevamente.",

  NETWORK_ERROR: "No fue posible conectar con el servidor.",

  UNAUTHORIZED: "Tu sesión ha expirado. Inicia sesión nuevamente.",

  FORBIDDEN: "No tienes permisos para realizar esta acción.",

  TASK_CREATED: "Tarea creada correctamente.",

  TASK_UPDATED: "Tarea actualizada correctamente.",

  TASK_DELETED: "Tarea eliminada correctamente.",

  PROFILE_UPDATED: "Perfil actualizado correctamente.",

  ROLE_UPDATED: "Rol actualizado correctamente.",
};

/* =========================================================
   13. DATOS GENERALES DE LA APLICACIÓN
========================================================= */

export const APP_CONFIG = {
  NAME: "Focusly",
  DESCRIPTION:
    "Organiza tus tareas, mejora tu enfoque y crea mejores hábitos de estudio.",
};

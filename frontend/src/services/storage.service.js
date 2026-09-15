// src/services/storage.service.js

import {
  STORAGE_KEYS,
  THEMES,
} from "../utils/constants";


/* =========================================================
   FOCUSLY - STORAGE SERVICE
   Manejo centralizado de localStorage
========================================================= */


/* =========================================================
   1. VERIFICAR DISPONIBILIDAD
========================================================= */

/**
 * Verifica si localStorage está disponible.
 *
 * @returns {boolean}
 */
export const isStorageAvailable = () => {
  try {
    const testKey = "__focusly_storage_test__";

    localStorage.setItem(
      testKey,
      testKey
    );

    localStorage.removeItem(testKey);

    return true;
  } catch {
    return false;
  }
};


/* =========================================================
   2. GUARDAR VALOR
========================================================= */

/**
 * Guarda un valor en localStorage.
 *
 * Los objetos y arrays son convertidos
 * automáticamente a JSON.
 *
 * @param {string} key
 * @param {*} value
 * @returns {boolean}
 */
export const setStorageItem = (
  key,
  value
) => {
  if (!key || !isStorageAvailable()) {
    return false;
  }

  try {
    const serializedValue =
      JSON.stringify(value);

    localStorage.setItem(
      key,
      serializedValue
    );

    return true;
  } catch (error) {
    console.error(
      "Error al guardar en localStorage:",
      error
    );

    return false;
  }
};


/* =========================================================
   3. OBTENER VALOR
========================================================= */

/**
 * Recupera un valor almacenado.
 *
 * Intenta convertir automáticamente
 * el contenido desde JSON.
 *
 * @param {string} key
 * @param {*} defaultValue
 * @returns {*}
 */
export const getStorageItem = (
  key,
  defaultValue = null
) => {
  if (!key || !isStorageAvailable()) {
    return defaultValue;
  }

  try {
    const value =
      localStorage.getItem(key);

    if (value === null) {
      return defaultValue;
    }

    return JSON.parse(value);
  } catch (error) {
    console.error(
      "Error al leer localStorage:",
      error
    );

    return defaultValue;
  }
};


/* =========================================================
   4. ELIMINAR VALOR
========================================================= */

/**
 * Elimina una clave específica.
 *
 * @param {string} key
 * @returns {boolean}
 */
export const removeStorageItem = (
  key
) => {
  if (!key || !isStorageAvailable()) {
    return false;
  }

  try {
    localStorage.removeItem(key);

    return true;
  } catch (error) {
    console.error(
      "Error al eliminar de localStorage:",
      error
    );

    return false;
  }
};


/* =========================================================
   5. VERIFICAR SI EXISTE UNA CLAVE
========================================================= */

/**
 * @param {string} key
 * @returns {boolean}
 */
export const hasStorageItem = (
  key
) => {
  if (!key || !isStorageAvailable()) {
    return false;
  }

  return localStorage.getItem(key) !== null;
};


/* =========================================================
   6. LIMPIAR DATOS DE FOCUSLY
========================================================= */

/**
 * Elimina solamente las preferencias
 * conocidas de Focusly.
 *
 * No utiliza localStorage.clear()
 * para evitar eliminar datos de otras
 * aplicaciones del mismo dominio.
 */
export const clearFocuslyStorage = () => {
  if (!isStorageAvailable()) {
    return;
  }

  Object.values(STORAGE_KEYS).forEach(
    (key) => {
      localStorage.removeItem(key);
    }
  );
};


/* =========================================================
   7. GUARDAR TEMA
========================================================= */

/**
 * Guarda la preferencia de tema.
 *
 * @param {"light"|"dark"} theme
 * @returns {boolean}
 */
export const saveTheme = (theme) => {
  const validThemes = [
    THEMES.LIGHT,
    THEMES.DARK,
  ];

  if (!validThemes.includes(theme)) {
    return false;
  }

  return setStorageItem(
    STORAGE_KEYS.THEME,
    theme
  );
};


/* =========================================================
   8. OBTENER TEMA
========================================================= */

/**
 * Recupera el tema guardado.
 *
 * Si no existe, retorna null para que
 * ThemeContext pueda consultar la
 * preferencia del sistema operativo.
 *
 * @returns {"light"|"dark"|null}
 */
export const getSavedTheme = () => {
  const theme = getStorageItem(
    STORAGE_KEYS.THEME
  );

  if (
    theme !== THEMES.LIGHT &&
    theme !== THEMES.DARK
  ) {
    return null;
  }

  return theme;
};


/* =========================================================
   9. ELIMINAR TEMA GUARDADO
========================================================= */

/**
 * Elimina la preferencia de tema.
 *
 * @returns {boolean}
 */
export const removeSavedTheme = () => {
  return removeStorageItem(
    STORAGE_KEYS.THEME
  );
};


/* =========================================================
   10. OBTENER PREFERENCIA DEL SISTEMA
========================================================= */

/**
 * Detecta si el sistema operativo o
 * navegador utiliza modo oscuro.
 *
 * @returns {"light"|"dark"}
 */
export const getSystemTheme = () => {
  if (
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches
  ) {
    return THEMES.DARK;
  }

  return THEMES.LIGHT;
};


/* =========================================================
   11. OBTENER TEMA INICIAL
========================================================= */

/**
 * Prioridad:
 *
 * 1. Tema guardado por el usuario.
 * 2. Preferencia del sistema.
 *
 * @returns {"light"|"dark"}
 */
export const getInitialTheme = () => {
  const savedTheme = getSavedTheme();

  if (savedTheme) {
    return savedTheme;
  }

  return getSystemTheme();
};
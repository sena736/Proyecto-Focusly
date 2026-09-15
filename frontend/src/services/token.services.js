// src/services/token.service.js

/* =========================================================
   FOCUSLY - TOKEN SERVICE
   Manejo del JWT en memoria
========================================================= */


/* =========================================================
   1. TOKEN EN MEMORIA
========================================================= */

let authToken = null;


/* =========================================================
   2. GUARDAR TOKEN
========================================================= */

/**
 * Guarda el JWT en memoria.
 *
 * @param {string} token
 */
export const setToken = (token) => {
  if (!token) {
    authToken = null;
    return;
  }

  authToken = token;
};


/* =========================================================
   3. OBTENER TOKEN
========================================================= */

/**
 * Retorna el JWT almacenado en memoria.
 *
 * @returns {string|null}
 */
export const getToken = () => {
  return authToken;
};


/* =========================================================
   4. ELIMINAR TOKEN
========================================================= */

/**
 * Elimina el JWT almacenado.
 */
export const removeToken = () => {
  authToken = null;
};


/* =========================================================
   5. VERIFICAR SI EXISTE TOKEN
========================================================= */

/**
 * Indica si actualmente existe
 * un token almacenado en memoria.
 *
 * @returns {boolean}
 */
export const hasToken = () => {
  return Boolean(authToken);
};


/* =========================================================
   6. OBTENER TOKEN COMO BEARER
========================================================= */

/**
 * Retorna el valor listo para enviarlo
 * en el header Authorization.
 *
 * Ejemplo:
 *
 * Bearer eyJhbGciOiJIUzI1NiIs...
 *
 * @returns {string|null}
 */
export const getBearerToken = () => {
  if (!authToken) {
    return null;
  }

  return `Bearer ${authToken}`;
};
// src/api/api.js

import axios from "axios";

import {
  getToken,
  removeToken,
} from "../services/token.service";


/* =========================================================
   FOCUSLY - CONFIGURACIÓN DE AXIOS
========================================================= */


/* =========================================================
   1. URL BASE DE LA API
========================================================= */

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000/api/v1";


/* =========================================================
   2. CREAR INSTANCIA DE AXIOS
========================================================= */

const api = axios.create({
  baseURL: API_URL,

  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },

  timeout: 10000,
});


/* =========================================================
   3. INTERCEPTOR DE PETICIONES
========================================================= */

/**
 * Antes de realizar cada petición:
 *
 * 1. Obtiene el JWT almacenado en memoria.
 * 2. Si existe, lo agrega al header Authorization.
 *
 * Authorization:
 * Bearer <token>
 */

api.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);


/* =========================================================
   4. INTERCEPTOR DE RESPUESTAS
========================================================= */

/**
 * Permite manejar errores comunes
 * provenientes del backend.
 *
 * Ejemplos:
 *
 * 400 -> Petición incorrecta
 * 401 -> Sesión inválida o expirada
 * 403 -> Sin permisos
 * 404 -> Recurso no encontrado
 * 500 -> Error interno
 */

api.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    const status =
      error.response?.status;

    /*
     * 401 - TOKEN INVÁLIDO O EXPIRADO
     *
     * Eliminamos el JWT almacenado
     * en memoria.
     */

    if (status === 401) {
      removeToken();
    }

    return Promise.reject(error);
  }
);


/* =========================================================
   5. EXPORTAR INSTANCIA
========================================================= */

export default api;
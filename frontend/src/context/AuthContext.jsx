// src/context/AuthContext.jsx

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import api from "../api/api";

import {
  getToken,
  setToken,
  removeToken,
} from "../services/token.service";

import {
  API_ENDPOINTS,
  USER_ROLES,
} from "../utils/constants";


/* =========================================================
   FOCUSLY - AUTH CONTEXT
========================================================= */


/* =========================================================
   1. CREAR CONTEXTO
========================================================= */

export const AuthContext = createContext(null);


/* =========================================================
   2. PROVIDER
========================================================= */

export const AuthProvider = ({
  children,
}) => {
  /* -------------------------------------------------------
     Estado del usuario
  ------------------------------------------------------- */

  const [user, setUser] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [authError, setAuthError] =
    useState(null);


  /* =======================================================
     3. OBTENER USUARIO ACTUAL
  ======================================================= */

  /**
   * Consulta:
   *
   * GET /api/v1/auth/me
   *
   * El interceptor de api.js agrega automáticamente:
   *
   * Authorization: Bearer <token>
   */

  const fetchCurrentUser =
    useCallback(async () => {
      const token = getToken();

      if (!token) {
        setUser(null);
        setLoading(false);

        return null;
      }

      try {
        setLoading(true);
        setAuthError(null);

        const response = await api.get(
          API_ENDPOINTS.AUTH.ME
        );

        /*
         * Se asume que el backend responde:
         *
         * {
         *   user: {
         *     id: 1,
         *     name: "Usuario",
         *     email: "usuario@gmail.com",
         *     avatarUrl: "...",
         *     role: "USER"
         *   }
         * }
         */

        const currentUser =
          response.data?.user ??
          response.data;

        setUser(currentUser);

        return currentUser;
      } catch (error) {
        removeToken();

        setUser(null);

        setAuthError(
          error.response?.data?.message ||
            "No fue posible obtener la sesión."
        );

        return null;
      } finally {
        setLoading(false);
      }
    }, []);


  /* =======================================================
     4. ESTABLECER SESIÓN
  ======================================================= */

  /**
   * Esta función será utilizada después
   * de que Google OAuth haya terminado
   * correctamente.
   *
   * Recibe el JWT generado por el backend.
   *
   * @param {string} token
   */

  const establishSession =
    useCallback(
      async (token) => {
        if (!token) {
          setAuthError(
            "No se recibió un token de autenticación."
          );

          return null;
        }

        try {
          setLoading(true);
          setAuthError(null);

          /*
           * Guardamos el JWT únicamente
           * en memoria.
           */

          setToken(token);

          /*
           * Ahora consultamos /auth/me
           * para obtener el usuario.
           */

          const currentUser =
            await fetchCurrentUser();

          if (!currentUser) {
            throw new Error(
              "No fue posible obtener el usuario."
            );
          }

          return currentUser;
        } catch (error) {
          removeToken();

          setUser(null);

          setAuthError(
            error.response?.data?.message ||
              error.message ||
              "No fue posible iniciar sesión."
          );

          return null;
        } finally {
          setLoading(false);
        }
      },
      [fetchCurrentUser]
    );


  /* =======================================================
     5. INICIAR AUTENTICACIÓN CON GOOGLE
  ======================================================= */

  /**
   * Redirige al endpoint del backend:
   *
   * GET /api/v1/auth/google
   *
   * El backend inicia el flujo OAuth
   * con Google.
   */

  const loginWithGoogle =
    useCallback(() => {
      const apiUrl =
        import.meta.env.VITE_API_URL ||
        "http://localhost:3000/api/v1";

      window.location.href =
        `${apiUrl}${API_ENDPOINTS.AUTH.GOOGLE}`;
    }, []);


  /* =======================================================
     6. CERRAR SESIÓN
  ======================================================= */

  const logout =
    useCallback(async () => {
      try {
        /*
         * Avisamos al backend.
         *
         * Si el backend solamente utiliza
         * JWT stateless, esta petición puede
         * limitarse a responder correctamente.
         */

        await api.post(
          API_ENDPOINTS.AUTH.LOGOUT
        );
      } catch (error) {
        /*
         * Aunque falle el backend,
         * eliminamos la sesión local.
         */

        console.error(
          "Error al cerrar sesión:",
          error
        );
      } finally {
        removeToken();

        setUser(null);
        setAuthError(null);
      }
    }, []);


  /* =======================================================
     7. LIMPIAR ERROR
  ======================================================= */

  const clearAuthError =
    useCallback(() => {
      setAuthError(null);
    }, []);


  /* =======================================================
     8. COMPROBAR AUTENTICACIÓN
  ======================================================= */

  const isAuthenticated =
    Boolean(user);


  /* =======================================================
     9. COMPROBAR ROL ADMINISTRADOR
  ======================================================= */

  const isAdmin =
    user?.role === USER_ROLES.ADMIN;


  /* =======================================================
     10. COMPROBAR ROL
  ======================================================= */

  /**
   * Ejemplo:
   *
   * hasRole(USER_ROLES.ADMIN)
   */

  const hasRole =
    useCallback(
      (role) => {
        return user?.role === role;
      },
      [user]
    );


  /* =======================================================
     11. ACTUALIZAR USUARIO LOCAL
  ======================================================= */

  /**
   * Útil después de actualizar el perfil.
   *
   * updateUser({
   *   name: "Nuevo nombre"
   * });
   */

  const updateUser =
    useCallback((userData) => {
      setUser((currentUser) => {
        if (!currentUser) {
          return null;
        }

        return {
          ...currentUser,
          ...userData,
        };
      });
    }, []);


  /* =======================================================
     12. CARGA INICIAL
  ======================================================= */

  useEffect(() => {
    const initializeAuth = async () => {
      const token = getToken();

      if (!token) {
        setLoading(false);
        return;
      }

      await fetchCurrentUser();
    };

    initializeAuth();
  }, [fetchCurrentUser]);


  /* =======================================================
     13. VALOR DEL CONTEXTO
  ======================================================= */

  const value = useMemo(
    () => ({
      /* Estado */
      user,
      loading,
      authError,

      /* Información derivada */
      isAuthenticated,
      isAdmin,

      /* Acciones */
      loginWithGoogle,
      establishSession,
      logout,
      fetchCurrentUser,
      updateUser,
      hasRole,
      clearAuthError,
    }),
    [
      user,
      loading,
      authError,
      isAuthenticated,
      isAdmin,
      loginWithGoogle,
      establishSession,
      logout,
      fetchCurrentUser,
      updateUser,
      hasRole,
      clearAuthError,
    ]
  );


  /* =======================================================
     14. PROVIDER
  ======================================================= */

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
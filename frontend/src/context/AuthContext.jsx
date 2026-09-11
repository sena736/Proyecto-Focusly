import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getCurrentSession,
  loginWithGoogle,
  logout as logoutApi,
} from "../api/auth.api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = Boolean(user);

  /**
   * Recupera la sesión existente al cargar la aplicación.
   */
  const loadSession = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getCurrentSession();

      const authenticatedUser = response?.user ?? response?.data?.user ?? null;

      setUser(authenticatedUser);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  /**
   * Inicia el login mediante Google.
   *
   * El backend se encarga del flujo OAuth.
   */
  const login = useCallback(() => {
    loginWithGoogle();
  }, []);

  /**
   * Elimina la sesión del servidor y del cliente.
   */
  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated,
      login,
      logout,
      refreshSession: loadSession,
    }),
    [user, loading, isAuthenticated, login, logout, loadSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe utilizarse dentro de un AuthProvider.");
  }

  return context;
};

export default AuthContext;

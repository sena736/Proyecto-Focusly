import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// =====================================================
// PÁGINAS PÚBLICAS
// =====================================================

import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";

// =====================================================
// PÁGINAS PROTEGIDAS
// =====================================================

import Dashboard from "../pages/Dashboard";
//import Tasks from "../components/Tasks";
import Pomodoro from "../components/Pomodoro";
import Motivation from "../components/MotivationalQuote";
//import Profile from "../pages/Profile";
import Settings from "../pages/Settings";
import Admin from "../pages/Admin";

// =====================================================
// RUTA PROTEGIDA
// =====================================================

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("focusly_token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// =====================================================
// RUTA PARA ADMINISTRADOR
// =====================================================

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("focusly_token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const usuario = JSON.parse(
    localStorage.getItem("focusly_usuario") || "{}"
  );

  /*
   * El DDS contempla los roles:
   * - Invitado
   * - Usuario
   * - Administrador
   *
   * La comprobación del rol deberá coincidir
   * posteriormente con la respuesta real del backend.
   */

  if (usuario.rol !== "Administrador") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// =====================================================
// ROUTER PRINCIPAL
// =====================================================

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* =========================================
            RUTAS PÚBLICAS
            ========================================= */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/registro"
          element={<Register />}
        />


        {/* =========================================
            RUTAS PROTEGIDAS
            ========================================= */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* <Route
          path="/tareas"
          element={
            <ProtectedRoute>
              <Tasks />
            </ProtectedRoute>
          }
        /> */}

        <Route
          path="/pomodoro"
          element={
            <ProtectedRoute>
              <Pomodoro />
            </ProtectedRoute>
          }
        />

        <Route
          path="/motivacion"
          element={
            <ProtectedRoute>
              <Motivation />
            </ProtectedRoute>
          }
        />

    {/*     <Route
          path="/perfil"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
 */}
        <Route
          path="/configuracion"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />


        {/* =========================================
            PANEL ADMINISTRATIVO
            ========================================= */}

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          }
        />


        {/* =========================================
            RUTA NO ENCONTRADA
            ========================================= */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;



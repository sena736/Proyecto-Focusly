import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Páginas públicas
import Home from "../pages/Home/Home";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";

// Páginas del usuario autenticado
import Dashboard from "../pages/Dashboard/Dashboard";
import Pomodoro from "../pages/Pomodoro/Pomodoro";
import Tasks from "../pages/Tasks/Tasks";
import Motivation from "../pages/Motivation/Motivation";
import Profile from "../pages/Profile/Profile";
import Settings from "../pages/Settings/Settings";

// Páginas administrativas
import Users from "../pages/admin/Users/Users";

// Protección de rutas
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";

// Layout de usuario autenticado
import UserLayout from "../layouts/UserLayout/UserLayout";

const AppRoutes = () => {
	return (
		<BrowserRouter>
			<Routes>
				{/* =========================
            RUTAS PÚBLICAS
        ========================== */}

				<Route path="/" element={<Home />} />
				<Route path="/login" element={<Login />} />
				<Route path="/register" element={<Register />} />

				{/* =========================
            USUARIO REGISTRADO
            (comparten el layout con sidebar real)
        ========================== */}

				<Route
					element={
						<ProtectedRoute>
							<UserLayout />
						</ProtectedRoute>
					}
				>
					<Route path="/dashboard" element={<Dashboard />} />
					<Route path="/pomodoro" element={<Pomodoro />} />
					<Route path="/tasks" element={<Tasks />} />
					<Route path="/motivation" element={<Motivation />} />
					<Route path="/profile" element={<Profile />} />
					<Route path="/settings" element={<Settings />} />

					{/* =========================
              ADMINISTRADOR
          ========================== */}

					<Route
						path="/admin/users"
						element={
							<AdminRoute>
								<Users />
							</AdminRoute>
						}
					/>
				</Route>

				{/* =========================
            RUTA NO ENCONTRADA
        ========================== */}

				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
		</BrowserRouter>
	);
};

export default AppRoutes;

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
import Users from "../pages/Users/Users";

// Protección de rutas
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";

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
        ========================== */}

				<Route
					path="/dashboard"
					element={
						<ProtectedRoute>
							<Dashboard />
						</ProtectedRoute>
					}
				/>

				<Route
					path="/pomodoro"
					element={
						<ProtectedRoute>
							<Pomodoro />
						</ProtectedRoute>
					}
				/>

				<Route
					path="/tasks"
					element={
						<ProtectedRoute>
							<Tasks />
						</ProtectedRoute>
					}
				/>

				<Route
					path="/motivation"
					element={
						<ProtectedRoute>
							<Motivation />
						</ProtectedRoute>
					}
				/>

				<Route
					path="/profile"
					element={
						<ProtectedRoute>
							<Profile />
						</ProtectedRoute>
					}
				/>

				<Route
					path="/settings"
					element={
						<ProtectedRoute>
							<Settings />
						</ProtectedRoute>
					}
				/>

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

				{/* =========================
            RUTA NO ENCONTRADA
        ========================== */}

				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
		</BrowserRouter>
	);
};

export default AppRoutes;

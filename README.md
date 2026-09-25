# Focusly

Aplicación web de gestión de tareas y productividad con técnica Pomodoro. Proyecto académico desarrollado por un equipo de 5 personas bajo metodología Scrum, con documentación formal (ERS, DDS y Plan de Trabajo).

## Stack

**Backend**
- Node.js + Express 5
- Prisma ORM 7 (`@prisma/adapter-mariadb`) sobre MySQL
- Autenticación con Google OAuth (`google-auth-library`) + JWT
- Bcrypt para hashing de contraseñas

**Frontend**
- React 19 + Vite
- React Router 7
- TanStack Query (React Query) para estado del servidor
- Axios

## Estructura del repositorio

```
Focusly/
├── backend/          # API REST (Express + Prisma + MySQL)
│   ├── prisma/        # schema.prisma, migraciones, seed
│   └── src/
│       ├── config/     # cliente Prisma
│       ├── controllers/
│       ├── services/
│       ├── repositories/
│       ├── routes/
│       └── app.js      # punto de montaje de todas las rutas
├── frontend/         # SPA (React + Vite)
│   └── src/
│       ├── api/         # clientes fetch/axios por recurso
│       ├── components/  # organizados por dominio (tasks/, profile/, admin/, layout/)
│       ├── context/      # AuthContext, ThemeContext
│       ├── hooks/
│       ├── pages/        # una carpeta por pantalla
│       └── routes/       # AppRoutes, ProtectedRoute, AdminRoute
└── docs/             # ERS, DDS y Plan de Trabajo (.docx) + mapas de pantallas
```

## Requisitos previos

- Node.js
- MySQL
- Cuenta de Google Cloud con credenciales OAuth (para el login)

## Cómo levantar el proyecto local

El backend y el frontend son dos aplicaciones independientes, cada una con su propio `package.json` — hay que instalar y correr ambas por separado.

### Backend

```bash
cd backend
npm install
```

Creá un archivo `.env` en `backend/` con estas variables (no hay `.env.example` en el repo todavía — pedíselo a alguien del equipo o armalo con estos nombres):

```
DATABASE_URL=
PORT=3000
JWT_SECRET=
JWT_EXPIRES_IN=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FRONTEND_URL=
```

```bash
npx prisma migrate dev
node prisma/seed.js
npm run dev
```

El servidor queda en `http://localhost:3000`, con un health check en `/api/health`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Necesita saber dónde está el backend — creá `frontend/.env` con:

```
VITE_API_URL=http://localhost:3000/api/v1
```

## Endpoints principales

| Ruta | Módulo |
|---|---|
| `/api/v1/auth` | Autenticación (Google OAuth + JWT) |
| `/api/v1/profile` | Perfil del usuario autenticado |
| `/api/v1/tasks` | CRUD de tareas |
| `/api/v1/pomodoro-sessions` | Registro de sesiones Pomodoro |
| `/api/v1/phrases` | Frases motivacionales |

> `/api/v1/users` (gestión de usuarios por parte de un admin) todavía no está montado en `backend/src/app.js` — ver tablero de tareas.

## Pantallas del frontend

Públicas: Home, Login, Register.
Autenticadas: Dashboard, Tasks, Pomodoro, Motivation, Profile, Settings.
Administración (requiere rol `ADMIN`): `/admin/users`.

## Documentación

Los documentos formales del proyecto están en [`docs/`](docs/):
- `Focusly_ERS_v1.1.docx` — Especificación de Requisitos de Software
- `Focusly_DDS_v1.0.docx` — Diseño Detallado de Software
- `Focusly_Plan_de_Trabajo_v1.0.docx` — planificación por sprints

El seguimiento de tareas del equipo se lleva en el tablero Kanban de Notion del proyecto, organizado por sprint.

## Equipo

Proyecto desarrollado en el marco de un curso de ingeniería de software, con roles de Scrum Master/Líder Técnico, Backend, Frontend (x2) y UX/QA.

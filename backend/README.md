# Focusly Backend

Backend de la API de Focusly. Esta guía contiene lo necesario para
levantar el proyecto localmente.

## Requisitos previos

- **Node.js** y **npm**.
- **MySQL** funcionando localmente o una instancia de desarrollo
  accesible.
- Una base de datos para Focusly.
- Credenciales de Google OAuth para probar el login, cuando
  corresponda.

## Instalación

Desde la carpeta `backend`:

```bash
npm install
```

## Configurar las variables de entorno

Copiá el archivo de ejemplo:

```bash
cp .env.example .env
```

En Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Después abrí `.env` y completá los valores de tu entorno. Revisá
especialmente:

```env
DATABASE_URL=mysql://usuario:password@host:puerto/focusly
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=...
JWT_SECRET=...
JWT_EXPIRES_IN=24h
FRONTEND_URL=...
```

No subas `.env` al repositorio si contiene credenciales reales.

## Base de datos y Prisma

Con MySQL disponible y `DATABASE_URL` configurada, ejecutá:

```bash
npx prisma migrate dev
```

Luego cargá los datos iniciales:

```bash
node prisma/seed.js
```

Si necesitás generar el cliente de Prisma:

```bash
npx prisma generate
```

## Levantar el servidor

Para iniciar el backend en desarrollo:

```bash
npm run dev
```

## Endpoints principales

La API utiliza el prefijo `/api/v1`.

---

Recurso Qué hace

---

`/api/v1/auth` Gestiona el acceso con Google, el
callback de autenticación, la
sesión y la consulta del usuario
autenticado.

`/api/v1/tasks` Permite listar, crear, editar,
completar y eliminar las tareas del
usuario autenticado.

`/api/v1/profile` Permite consultar el perfil y
actualizar los datos editables,
como apodo y preferencias.

`/api/v1/pomodoro-sessions` Registra sesiones Pomodoro
completadas y permite consultar el
historial del usuario.

`/api/v1/phrases` Proporciona frases motivacionales,
incluida la obtención de una frase
aleatoria.

`/api/v1/users` Permite gestionar usuarios y
operaciones administrativas, como
modificar el rol de un usuario.

---

### Rutas frecuentes

**Autenticación** - `GET /api/v1/auth/google` -
`GET /api/v1/auth/google/callback` - `POST /api/v1/auth/logout` -
`GET /api/v1/auth/me`

**Tareas** - `GET /api/v1/tasks` - `POST /api/v1/tasks` -
`PATCH /api/v1/tasks/:id` - `DELETE /api/v1/tasks/:id`

**Perfil** - `GET /api/v1/profile` - `PATCH /api/v1/profile`

**Pomodoro** - `POST /api/v1/pomodoro-sessions` -
`GET /api/v1/pomodoro-sessions`

**Frases** - `GET /api/v1/phrases/random`

**Usuarios** - `/api/v1/users` - `/api/v1/users/:id/role`

Las rutas protegidas requieren el JWT mediante el header
`Authorization: Bearer <token>`.

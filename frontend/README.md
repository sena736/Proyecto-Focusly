# Focusly

Focusly es una aplicación web diseñada para ayudar a los estudiantes a organizar sus actividades académicas, administrar sus tareas y mejorar su concentración mediante herramientas como el temporizador Pomodoro y frases motivacionales.

## 1. Requisitos previos

Antes de ejecutar el proyecto, asegúrate de tener instalado:

- Node.js (versión 18 o superior).
- npm (incluido con Node.js).
- Visual Studio Code (recomendado).
- Backend de Focusly configurado y disponible.

Para comprobar que Node.js y npm están instalados, ejecuta:

```bash
node -v
npm -v
```

## 2. Instalación

Clona o descarga el repositorio y abre una terminal dentro de la carpeta `frontend`.

```bash
cd frontend
```

Instala las dependencias del proyecto:

```bash
npm install
```

## 3. Variables de entorno

Crea un archivo llamado `.env` dentro de la carpeta `frontend`.

Agrega la siguiente variable:

```env
VITE_API_URL=http://localhost:3000/api/v1
```

Esta variable indica la dirección base de la API del backend.

Si el backend utiliza otro puerto o dirección, modifica el valor según su configuración.

Las variables de entorno utilizadas por Vite deben comenzar con `VITE_` para poder ser accesibles desde el frontend.

No agregues contraseñas, claves privadas ni secretos del backend en este archivo.

## 4. Ejecución del frontend

Para iniciar el servidor de desarrollo, ejecuta desde la carpeta `frontend`:

```bash
npm run dev
```

Vite mostrará una dirección local en la terminal, normalmente:

```text
http://localhost:5173
```

Abre esa dirección en el navegador para acceder a Focusly.

Para detener el servidor, presiona `Ctrl + C` en la terminal.

## 5. Ejecución del backend

El backend debe estar ejecutándose en paralelo con el frontend para que las funcionalidades que dependen de la API funcionen correctamente.

El frontend muestra la interfaz y permite la interacción del usuario, mientras que el backend procesa las solicitudes, administra la autenticación y se comunica con la base de datos.

Si el backend está apagado, algunas pantallas podrán mostrar su estructura visual, pero las funciones que requieren información del servidor, como iniciar sesión, consultar usuarios o guardar tareas, no funcionarán correctamente.

Antes de utilizar la aplicación, verifica que:

- El servidor backend esté iniciado.
- La base de datos esté configurada y disponible.
- La variable `VITE_API_URL` apunte a la dirección correcta del backend.

## 6. Pantallas principales

| Pantalla                    | Ruta           |
| --------------------------- | -------------- |
| Panel principal (Dashboard) | `/dashboard`   |
| Inicio de sesión            | `/login`       |
| Registro                    | `/register`    |
| Mis tareas                  | `/tasks`       |
| Mi perfil                   | `/perfil`      |
| Administración de usuarios  | `/admin/users` |

### Descripción de las pantallas

**Dashboard:** muestra el panel principal con herramientas de organización, temporizador Pomodoro, tareas y frases motivacionales.

**Inicio de sesión y registro:** permiten acceder a una cuenta o crear una nueva cuenta de usuario.

**Mis tareas:** permite consultar, crear, editar, completar y eliminar tareas académicas.

**Mi perfil:** permite consultar la información personal de la cuenta.

**Administración de usuarios:** permite consultar los usuarios registrados y administrar sus roles, según los permisos de la cuenta.

## 7. Tecnologías utilizadas

- React para construir la interfaz de usuario.
- Vite como herramienta de desarrollo del frontend.
- React Router para la navegación entre pantallas.
- TanStack Query (React Query) para gestionar las consultas y mutaciones de la API.
- CSS para los estilos y el diseño adaptable.

---

Proyecto académico Focusly.

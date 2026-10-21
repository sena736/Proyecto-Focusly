# Guía de demostración de Focusly

Guía para presentar el proyecto: preparación, cuentas, guion de ~10-12
minutos, límites actuales y solución de problemas. Lo que figura acá se
verificó contra el código y, donde se indica, **también en ejecución**
(sección 7); lo que no se pudo probar está marcado como **verificar antes
de la presentación**.

## Reglas de oro para la demo

- **No recargues la página (F5) ni escribas direcciones en la barra.** El
  token vive solo en memoria: recargar o abrir una URL a mano cierra la
  sesión y vuelve al login. Navegá siempre con los enlaces de la propia
  aplicación (menú lateral, barra inferior en móvil, avatar).
- **Ejecutá `npm run seed:demo` el mismo día de la presentación**: las
  fechas de las tareas y de las sesiones se calculan respecto del momento
  en que lo corrés.
- **Ensayá una vez completa** con el backend y el frontend corriendo, sobre
  todo el ciclo de Pomodoro de 1 minuto y el cambio de rol.
- Si bajaste el enfoque a 1 minuto, **volvé a ponerlo en 25** al terminar:
  la duración queda guardada en el navegador.
- Antes de arrancar, comprobá que **nadie más esté usando los puertos 3000
  y 5173** (otro proyecto abierto es la causa más común de fallos raros).

## 1. Preparación (en este orden)

1. **Dependencias**: `npm install` en `backend` y en `frontend`.
2. **Variables de entorno**: copiá `backend/.env.example` a `backend/.env` y
   `frontend/.env.example` a `frontend/.env`, y completá los valores de tu
   entorno (no se documentan acá). En el frontend, `VITE_API_URL` debe
   apuntar al backend (por defecto `http://localhost:3000/api/v1`).
3. **Migraciones** (desde `backend`): `npx prisma migrate deploy`.
4. **Frases motivacionales** (desde `backend`): `npm run seed`.
   Ojo: este comando **reemplaza** todas las frases existentes por las 20 del
   proyecto.
5. **Datos de demostración** (desde `backend`): `npm run seed:demo`.
6. **Verificar el destino** (opcional, no escribe nada):
   `npm run seed:demo -- --check`. Muestra host, nombre de la base, si es
   local, si el seed estaría permitido y cuántos datos demo existen. Nunca
   imprime usuario ni contraseña de la base.
7. **Arrancar el backend**: `npm run dev` (puerto `3000` por defecto; se
   puede comprobar en `http://localhost:3000/api/health`).
8. **Arrancar el frontend** (desde `frontend`): `npm run dev` y abrir
   `http://localhost:5173`.

**Si los puertos 3000 o 5173 están ocupados** por otro proyecto, se puede
levantar Focusly en otros puertos sin tocar ningún `.env` (las variables de
entorno del proceso tienen prioridad sobre el archivo). Ejemplo con el
backend en `3100` y el frontend en `5190`:

- PowerShell, desde `backend`:
  `$env:PORT="3100"; $env:FRONTEND_URL="http://localhost:5190"; node src/server.js`
- PowerShell, desde `frontend`:
  `$env:VITE_API_URL="http://localhost:3100/api/v1"; npx vite --port 5190 --strictPort`
- Bash: `PORT=3100 FRONTEND_URL=http://localhost:5190 node src/server.js` y
  `VITE_API_URL=http://localhost:3100/api/v1 npx vite --port 5190 --strictPort`

Después abrí `http://localhost:5190`. (Esta variante se probó el
21 de octubre de 2026 y funcionó.)

Protecciones del seed de demostración: se niega a correr con
`NODE_ENV=production`, y contra una base que no sea `localhost`,
`127.0.0.1` o `::1` salvo que definas `DEMO_SEED_ALLOW_REMOTE` con el
nombre exacto de la base.

## 2. Cuentas de demostración

La contraseña de **todas** las cuentas es la constante `DEMO_PASSWORD`
definida en `backend/prisma/seed-demo.js` (se puede reemplazar con la
variable de entorno `DEMO_PASSWORD`, mínimo 6 caracteres, al ejecutar el
seed).

| Rol | Correo | Datos |
| --- | --- | --- |
| Administrador | `administrador@focusly.demo` | Sin tareas, 2 sesiones Pomodoro. Accede a `/admin` y `/admin/users`. |
| Usuario (principal) | `camila.rojas@focusly.demo` | Cuenta "Camila Rojas". 12 tareas (7 pendientes, 5 completadas, ~42%), con una vencida, una para hoy, una para mañana, algunas de la próxima semana y 2 sin fecha. 17 sesiones Pomodoro en los últimos 7 días. |
| Usuario | `andres.gomez@focusly.demo` | "Andrés Gómez". 6 tareas y 8 sesiones. Sirve para mostrar el aislamiento de datos. |
| Usuario | `laura.perez@focusly.demo` | "Laura Pérez". 3 tareas y 4 sesiones. |
| Usuario (vacío) | `sofia.martinez@focusly.demo` | "Sofía Martínez". Sin tareas ni sesiones: muestra los estados vacíos. Buena candidata para el cambio de rol. |

## 3. Guion sugerido (~10-12 minutos)

Empezá con la cuenta de **Camila**. Cada paso corresponde a una pantalla
que existe hoy en el código.

1. **Landing y tema oscuro (1 min)** — En `/` se ve la presentación del
   producto (Pomodoro, tareas, frases y modo oscuro) y los accesos a
   iniciar sesión y registrarse. El interruptor de tema está en
   Configuración (paso 10).
2. **Registro e inicio de sesión (1 min)** — En `/register` se crea una
   cuenta con nombre, correo y contraseña (mínimo 6 caracteres, con
   confirmación). En `/login` iniciá sesión con Camila. El botón de Google
   solo funciona si hay credenciales configuradas (ver sección 4); si no,
   aparece deshabilitado y el inicio con correo funciona igual.
3. **Dashboard (1,5 min)** — `/dashboard`: saludo con el nombre ("¡Hola,
   Camila!"), anillo de progreso de tareas (~42%), resumen de pendientes y
   completadas, las primeras 5 tareas (se pueden tildar desde acá), el
   temporizador Pomodoro y la tarjeta "Tu impulso de hoy" con el botón
   "Nueva frase".
4. **Tareas (2 min)** — `/tasks`: los filtros **Todas / Pendientes /
   Completadas / Prioridad** (este último muestra solo las de prioridad
   alta) tienen contenido con Camila. Mostrá la tarea vencida. Creá una
   tarea con "+ Nueva tarea" (el formulario exige título y fecha), editala,
   completala con la casilla y eliminala (hay un modal de confirmación).
   Volvé al dashboard para ver que el porcentaje cambió.
5. **Pomodoro y sus tres modos (1 min)** — `/pomodoro`: pestañas
   **Enfoque / Descanso corto / Descanso largo**, contador de pomodoros
   completados y botones Iniciar, Pausar, Continuar, Reiniciar y Siguiente.
6. **Ajustes de duración (30 s)** — Debajo del temporizador, los botones
   − y + cambian los minutos de Trabajo, Descanso corto y Descanso largo
   (entre 1 y 90). Se bloquean con un ciclo en marcha o en pausa; se
   guardan en el navegador.
7. **Historial real y ciclo corto (2 min)** — El "Historial Pomodoro" lista
   las sesiones guardadas de Camila (las 10 más recientes, de la más nueva
   a la más vieja). Para mostrar cómo se guarda una sesión nueva sin
   esperar 25 minutos: bajá el enfoque a **1 minuto**, tocá Iniciar,
   mostrá **Pausar** y **Continuar**, y dejá que termine: aparece "¡Ciclo
   terminado!", el modo pasa al descanso corto (05:00) y la sesión nueva
   queda arriba del historial, sin recargar. Mientras el ciclo está en
   marcha o en pausa, los botones de duración quedan bloqueados con un
   texto que lo explica. (Verificado en ejecución: ver sección 7.)
   Al terminar, **volvé el enfoque a 25 minutos**.
8. **Motivación (30 s)** — `/motivation`: una frase aleatoria y botón para
   pedir otra.
9. **Perfil y edición del nombre (1 min)** — `/profile`: datos de la
   cuenta. Editá el nombre; al guardar se actualiza también el saludo del
   dashboard ("¡Hola, ...!"). (Al terminar, podés volver a poner
   "Camila Rojas" o re-ejecutar `npm run seed:demo`.)
10. **Configuración y tema oscuro (30 s)** — `/settings`: interruptor de
    "Modo oscuro"; se aplica al instante y se guarda en el navegador.
11. **Panel de administración (1,5 min)** — Cerrá sesión (barra lateral)
    e ingresá con el administrador. En la barra lateral aparece la sección
    ADMINISTRACIÓN. `/admin` muestra el total de usuarios y de sesiones
    Pomodoro; `/admin/users` lista los usuarios con un selector de rol.
    Cambiá el rol de **Sofía** (no el de la cuenta administradora, para no
    quedarte sin acceso de admin en plena demo). Para dejarlo como estaba,
    volvé a poner USER o re-ejecutá `npm run seed:demo` (restablece nombre,
    rol y contraseña de las cuentas demo). **Verificar antes de la
    presentación**: el selector de rol se ve y funciona como lista
    desplegable, pero el cambio en sí no se probó en el navegador.
    Si tu base ya tenía otras cuentas, aparecen también en la lista y en el
    total de usuarios del panel; el seed no las toca ni las borra.
12. **Aislamiento de datos (1 min)** — Cerrá sesión e ingresá con Andrés o
    Sofía: cada usuario ve solo sus tareas y sus sesiones (Sofía ve los
    estados vacíos de tareas y de historial). Un usuario común **no ve** el
    enlace de administración en el menú. Ojo: no lo demuestres escribiendo
    `/admin` en la barra, porque eso recarga la página y cierra la sesión;
    esa redirección está cubierta por los tests, no es para mostrar en vivo.
13. **Vista móvil (30 s)** — Con las herramientas del navegador, reducí el
    ancho: aparece la barra inferior (Inicio, Tareas, Pomodoro, Motivación,
    Perfil) y el botón ☰ abre la barra lateral con Configuración, la
    administración (si es admin) y Cerrar sesión.

## 4. Qué NO está implementado todavía (y cómo responder)

- **Recuperación de contraseña**: no existe. Respuesta: está fuera de lo
  entregado hoy; el acceso es con correo y contraseña o con Google.
- **Estadísticas**: no hay pantalla de estadísticas; quedó fuera del
  alcance del ERS. Lo más cercano es el progreso de tareas del dashboard y
  los totales del panel de administración.
- **Consentimiento de datos y política de privacidad**: pendientes; no hay
  pantallas ni flujos para eso.
- **Inicio de sesión con Google**: el código está, pero solo funciona si
  están configuradas las credenciales de Google Cloud (`VITE_GOOGLE_CLIENT_ID`
  en el frontend y `GOOGLE_CLIENT_ID` en el backend). Sin ellas el botón
  aparece deshabilitado.
- **Despliegue e integración continua**: pendientes (no hay configuración
  de CI en el repositorio; la app se demuestra en local).
- **La sesión vive en memoria**: el token no se guarda en el navegador, así
  que recargar la página (F5) o abrir una dirección escrita a mano cierra
  la sesión y vuelve al login (verificado en ejecución). Es el diseño que
  pide el documento de diseño. Evitá recargar durante la demo.
- **No hay forma de volver a la portada con la sesión iniciada**: el menú
  no incluye un enlace a `/`, así que la portada solo se muestra antes de
  iniciar sesión.
- **Dos temporizadores independientes**: el del Dashboard y el de la página
  Pomodoro son instancias separadas; no comparten el tiempo.
- **Salir de la pantalla de Pomodoro con un ciclo en marcha lo cancela**:
  el temporizador se detiene y esa sesión no se guarda. El botón
  "Siguiente" tampoco guarda nada: solo salta de fase.
- **Fechas de tareas**: desde la interfaz una tarea nueva exige fecha; las
  dos tareas "sin fecha" de Camila vienen de los datos de demostración.

## 5. Cómo reiniciar los datos de demo

Volver a ejecutar `npm run seed:demo` desde `backend`. Es idempotente:
reemplaza las tareas y sesiones de las cuentas `@focusly.demo`, restablece
sus nombres, roles y contraseña, y no toca ningún otro usuario. Las
fechas se recalculan respecto del momento en que lo ejecutás, así que
conviene correrlo el mismo día de la presentación.

## 6. Solución de problemas

- **Migraciones pendientes** (errores de tabla o columna inexistente):
  `npx prisma migrate deploy` desde `backend`.
- **`Task.completed does not exist`** (o un error similar de columna): el
  cliente de Prisma es viejo. Ejecutá `npx prisma generate` y reiniciá el
  backend.
- **Puerto ocupado**: cerrá el proceso que usa el puerto o cambiá `PORT`
  en el backend (por defecto `3000`) y ajustá `VITE_API_URL` en el
  frontend. Vite usa `5173` por defecto.
- **Errores de CORS**: el backend solo acepta `http://localhost:5173` y el
  valor de `FRONTEND_URL`. Si servís el frontend desde otra dirección,
  definí `FRONTEND_URL` con ese origen y reiniciá el backend.
- **El frontend no llega a la API**: revisá `VITE_API_URL` (debe incluir
  `/api/v1`) y reiniciá Vite después de cambiar el `.env`.
- **El seed se niega a correr**: lee el motivo en el mensaje (producción o
  base remota). Revisá el destino con `npm run seed:demo -- --check`.
- **Inicio de sesión rechazado con un error raro** (por ejemplo un 400 con
  un mensaje que no es de Focusly): casi seguro hay **otro proyecto
  respondiendo en el puerto 3000**. Comprobá qué proceso lo usa o levantá
  Focusly en otros puertos (ver la sección 1).

## 7. Qué se verificó en ejecución (21 de octubre de 2026)

Se probó con el backend y el frontend de la rama `main` corriendo en
local, contra MySQL en `localhost`, con los datos de este seed:

- **Inicio de sesión** de Camila, del administrador y de Sofía; una
  contraseña incorrecta se rechaza con 401.
- **Dashboard de Camila**: saludo, 7 pendientes y 5 completadas, progreso
  del 42% y fechas de vencimiento correctas (la tarea vencida figura con su
  fecha real).
- **Tareas**: las 12 tareas, el filtro Pendientes (7) y el filtro
  Prioridad (4); **crear** (201), **editar** con la fecha precargada
  (200), **completar** y **eliminar** con confirmación (204), sin errores.
- **Pomodoro**: con el enfoque en 1 minuto, el contador baja, **Pausar**
  congela el tiempo y el botón pasa a **Continuar**, los ajustes se
  bloquean con su texto de ayuda y, al terminar, aparece "¡Ciclo terminado!",
  el modo pasa a descanso corto (05:00) y el navegador hace un
  `POST /pomodoro-sessions` (201): la sesión nueva aparece arriba del
  historial sin recargar.
- **Perfil**: editar el nombre (`PATCH /profile`, 200) lo actualiza en la
  tarjeta y en la cabecera del dashboard.
- **Administración**: `/admin` muestra el total de usuarios y de sesiones, y
  `/admin/users` lista a todos con un selector de rol.
- **Configuración**: el interruptor cambia entre tema claro y oscuro y la
  elección se guarda.
- **Vista móvil (375 px)**: barra inferior con las 5 secciones, botón ☰ que
  abre el menú lateral por encima de la barra, sin desplazamiento
  horizontal.
- **Seguridad (API)**: un usuario no puede leer, editar ni borrar una
  sesión Pomodoro ajena (404); un usuario común recibe 403 en las listas de
  administración; sin token se rechaza (401); una sesión con datos
  inválidos se rechaza (400); el perfil y la lista de usuarios no incluyen
  contraseñas.

**No se probó**: el **cambio de rol desde la interfaz** (solo se verificó
que la lista y los selectores se muestran), el inicio de sesión con Google,
el descanso largo tras cuatro ciclos, la portada con sesión iniciada, otros
navegadores ni otros tamaños de pantalla. Ensayá esos puntos antes de
presentar.

**Detalles de redacción a tener en cuenta**: el diálogo de eliminar tarea
dice "¿Estás segura...?" en femenino para cualquier usuario.

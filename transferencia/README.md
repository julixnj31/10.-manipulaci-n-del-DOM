# Gestión de Tareas - Transferencia

## Descripción breve del proyecto

Este proyecto es una aplicación web de gestión de tareas asociadas a usuarios. Está construida con HTML, CSS y JavaScript moderno (módulos ES6) y consume datos desde una API local `json-server`.

## Objetivo de la actividad

El objetivo es demostrar:

- Manipulación del DOM para crear interfaces dinámicas.
- Implementación de un CRUD completo de tareas.
- Modularización con ES6 `import` / `export`.
- Empaquetado simple para ejecución local y presentación en red.
- Conectividad frontend-backend correcta para uso en otra computadora de la misma red.

## Requisitos para ejecutarlo

- Node.js instalado en el equipo.
- Acceso de red entre el equipo anfitrión y el equipo evaluación.
- Puerto `8080` libre para el frontend.
- Puerto `3000` libre para `json-server`.

## Instalación de dependencias

### Frontend

Desde la carpeta `transferencia`:

```bash
npm install
```

### Backend

Desde la carpeta `servidor`:

```bash
npm install
```

## Comandos para iniciar el proyecto

### Iniciar frontend

Desde `transferencia`:

```bash
npm start
```

Esto levanta un servidor HTTP en el puerto `8080`, accesible desde `http://localhost:8080` y desde la IP de la máquina.

### Iniciar json-server

Desde `servidor`:

```bash
npm start
```

Esto inicia `json-server` en el puerto `3000` usando `--host 0.0.0.0`, lo que permite conexiones desde otros equipos en la misma red.

## Estructura de carpetas después de la modularización

```
transferencia/
├── README.md
├── index.html
├── package.json
├── package-lock.json
├── style.css
└── src/
    ├── api/
    │   └── api.js
    ├── events/
    │   └── events.js
    ├── storage/
    │   └── storage.js
    ├── ui/
    │   └── ui.js
    ├── validations/
    │   └── validations.js
    └── app.js
```

## Explicación de los módulos

### `src/api/api.js`

Este módulo centraliza todas las peticiones `fetch` a la API. Contiene funciones para:

- buscar usuarios por documento.
- obtener tareas por usuario.
- crear tareas.
- actualizar tareas.
- eliminar tareas.

También maneja los errores de la API y normaliza la URL usando `window.location.hostname`, de modo que la app pueda usarse con la IP del equipo anfitrión.

### `src/ui/ui.js`

Este módulo administra todo el renderizado en el DOM y la interacción visual. Sus responsabilidades son:

- seleccionar elementos HTML.
- mostrar/ocultar mensajes de feedback.
- renderizar el usuario encontrado.
- habilitar/deshabilitar el formulario.
- renderizar la tabla de tareas.
- generar botones de `Editar` y `Eliminar` por fila.
- actualizar el contador de tareas.

### `src/validations/validations.js`

Este módulo valida los formularios de búsqueda y de tarea. Sus funciones principales son:

- verificar que el documento no esté vacío.
- validar título, descripción y estado de la tarea.
- normalizar valores y devolver resultados claros para la UI.

### `src/storage/storage.js`

Administra el respaldo local en `localStorage`. Sus responsabilidades son:

- cargar tareas locales por usuario.
- guardar tareas locales.
- agregar o actualizar una tarea local.
- eliminar una tarea local.
- combinar tareas del servidor con las locales en caso de desconexión.

### `src/events/events.js`

Este módulo enlaza los eventos del DOM con los manejadores principales. Centraliza:

- el submit del formulario de búsqueda.
- el submit del formulario de tarea.
- el botón de cancelar edición.

### `src/app.js`

Es el punto de entrada principal. Aquí se administra la lógica de negocio completa:

- control de estado global (`currentUser`, `currentTasks`, `editingTaskId`).
- flujo de búsqueda de usuario.
- carga de tareas asociadas.
- creación, actualización y eliminación de tareas.
- validación de formularios.
- sincronización con `localStorage` cuando `json-server` no está disponible.
- inicialización de la aplicación.

## Explicación del flujo de búsqueda de usuarios y registro de tareas

1. El usuario ingresa un documento y hace clic en `Buscar usuario`.
2. `app.js` valida el documento usando `validations.js`.
3. Si es válido, llama a `api.js` para consultar `GET /users?documento=...`.
4. Si el usuario existe, `ui.js` muestra sus datos y habilita el formulario de tareas.
5. Si se encuentran tareas previas, se cargan desde `GET /tareas?userId=...`.
6. El usuario puede registrar una nueva tarea o editar una existente.
7. Al guardar, `app.js` envía `POST /tareas` o `PATCH /tareas/:id`.
8. Si la API falla, se guarda el cambio en `localStorage` como respaldo.
9. La tabla se actualiza inmediatamente sin recargar la página.

## URL de acceso local

- Frontend: `http://localhost:8080`
- Backend: `http://localhost:3000`

## URL de acceso mediante IP para pruebas en red local

Si la IP del equipo anfitrión es `192.168.1.55`:

- Frontend: `http://192.168.1.55:8080`
- Backend: `http://192.168.1.55:3000`

> Importante: el profesor debe abrir la URL del frontend (`http://<IP>:8080`) y el frontend se conectará automáticamente al backend con la misma IP.

## Pasos para que otro computador pueda conectarse

1. Iniciar `json-server` desde `servidor` con `npm start`.
2. Iniciar el frontend desde `transferencia` con `npm start`.
3. Verificar la IP local con `ipconfig` (adaptador de red local).
4. Compartir la IP encontrada y el puerto `8080`.
5. Asegurarse de que no haya firewall bloqueando los puertos `8080` y `3000`.
6. Abrir en el otro computador:
   - `http://<IP_DEL_EQUIPO>:8080`

## Posibles errores comunes y sus soluciones

- `Error de CORS`:
  - No aplica aquí porque `json-server` habilita CORS por defecto.
  - Asegúrate de iniciar el servidor con `--host 0.0.0.0`.

- `No se puede cargar el módulo`:
  - Verifica que `index.html` cargue `<script type="module" src="./src/app.js"></script>`.
  - No abras el archivo directamente con `file://`.

- `No se encuentra el backend`:
  - Comprueba que `json-server` esté activo en `servidor` y que estés usando la IP correcta.
  - Revisa que el puerto `3000` esté libre.

- `No se encuentra el usuario`:
  - Asegúrate de buscar con el campo `documento` exacto.
  - Los usuarios disponibles tienen `documento` desde `1001` hasta `1010`.

- `La tabla no se actualiza`:
  - Verifica la consola del navegador por errores de JavaScript.
  - Confirma que `http-server` está sirviendo el frontend.

## Instrucciones para la demostración al profesor

1. Ejecutar backend:
   - `cd servidor`
   - `npm install` (si no está instalado)
   - `npm start`

2. Ejecutar frontend:
   - `cd transferencia`
   - `npm install` (si no está instalado)
   - `npm start`

3. Obtener la dirección IP del equipo anfitrión con `ipconfig`.
4. Compartir al profesor la URL del frontend:
   - `http://<IP_DEL_EQUIPO>:8080`
5. Confirmar que el profesor puede abrir la página y que los botones de buscar y registrar tarea funcionan.
6. En la demo, mostrar:
   - búsqueda de usuario por documento.
   - carga de tareas existentes.
   - creación de nueva tarea.
   - edición de una tarea con botón `Editar`.
   - eliminación con botón `Eliminar`.
   - actualización de la tabla inmediata.

## Nota final

La configuración actual permite uso en red local siempre que el profesor acceda desde la IP del equipo anfitrión y ambos puertos (`8080` y `3000`) estén disponibles. El frontend y el backend quedan correctamente separados y listos para entrega.

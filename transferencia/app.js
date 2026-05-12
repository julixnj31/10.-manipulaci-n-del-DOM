// URL del servidor local donde está corriendo json-server con la base de datos
const API_URL = "http://l10.1.100.112:4000";

// Seleccionamos los elementos del formulario de búsqueda usando querySelector
const searchForm = document.querySelector("#search-form"); // Formulario de búsqueda
const searchButton = document.querySelector("#search-button"); // Botón para buscar usuario
const documentInput = document.querySelector("#documento"); // Campo de entrada para el documento
const searchFeedback = document.querySelector("#search-feedback"); // Elemento para mostrar mensajes de feedback
//  de búsqueda

// Seleccionamos los elementos del panel de usuario
const userPanel = document.querySelector("#user-panel"); // Panel que muestra la info del usuario encontrado
const userDocument = document.querySelector("#user-document"); // Span para mostrar el documento del usuario
const userName = document.querySelector("#user-name"); // Span para mostrar el nombre del usuario
const userEmail = document.querySelector("#user-email"); // Span para mostrar el email del usuario
const userId = document.querySelector("#user-id"); // Span para mostrar el ID del usuario

// Seleccionamos los elementos del formulario de tareas
const taskForm = document.querySelector("#task-form"); // Formulario para registrar tareas
const taskButton = document.querySelector("#task-button"); // Botón para guardar la tarea
const taskTitle = document.querySelector("#task-title"); // Campo para el título de la tarea
const taskDescription = document.querySelector("#task-description"); // Campo para la descripción de la tarea
const taskStatus = document.querySelector("#task-status"); // Select para el estado de la tarea
const taskFeedback = document.querySelector("#task-feedback"); // Elemento para mostrar mensajes de feedback de tareas

// Seleccionamos los elementos de la tabla de tareas
const taskCount = document.querySelector("#task-count"); // Badge que muestra el número de tareas
const emptyState = document.querySelector("#empty-state"); // Mensaje cuando no hay tareas
const tableWrapper = document.querySelector("#table-wrapper"); // Contenedor de la tabla
const tasksBody = document.querySelector("#tasks-body"); // Cuerpo de la tabla donde se insertan las filas

// Variables globales para mantener el estado de la aplicación
let currentUser = null; // Usuario actualmente seleccionado (null si no hay ninguno)
let totalTasks = 0; // Número total de tareas mostradas en la tabla

// Función para limpiar espacios en blanco al inicio y final de un valor (útil para validaciones)
function cleanValue(value) {
  return value.trim(); // Retorna el valor sin espacios al inicio y final
}

// Función para mostrar mensajes de feedback (éxito, error, info) debajo de los formularios
function showFeedback(element, message, type) {
  element.textContent = message; // Establece el texto del mensaje
  element.className = `feedback ${type}`; // Aplica clases CSS para el tipo de mensaje (success, error, info)
  element.classList.remove("hidden"); // Hace visible el elemento removiendo la clase 'hidden'
}

// Función para ocultar mensajes de feedback cuando ya no son necesarios
function hideFeedback(element) {
  element.textContent = ""; // Limpia el texto del mensaje
  element.className = "feedback hidden"; // Aplica la clase 'hidden' para ocultar el elemento
}

// Función para actualizar el contador de tareas en el badge
function updateTaskCount() {
  const label = totalTasks === 1 ? "tarea" : "tareas"; // Determina si usar singular o plural
  taskCount.textContent = `${totalTasks} ${label}`; // Actualiza el texto del badge
}

// Función para mostrar el estado vacío cuando no hay tareas
function showEmptyState(message) {
  emptyState.textContent = message; // Establece el mensaje de estado vacío
  emptyState.classList.remove("hidden"); // Hace visible el mensaje
  tableWrapper.classList.add("hidden"); // Oculta la tabla
}

// Función para ocultar el estado vacío cuando hay tareas
function hideEmptyState() {
  emptyState.classList.add("hidden"); // Oculta el mensaje de estado vacío
  tableWrapper.classList.remove("hidden"); // Hace visible la tabla
}

// Función para limpiar el panel de usuario cuando la búsqueda falla
function clearUserPanel() {
  userDocument.textContent = "-"; // Resetea el documento a guion
  userName.textContent = "-"; // Resetea el nombre a guion
  userEmail.textContent = "-"; // Resetea el email a guion
  userId.textContent = "-"; // Resetea el ID a guion
  userPanel.classList.add("hidden"); // Oculta el panel de usuario
}

// Función para renderizar (mostrar) la información del usuario encontrado
function renderUser(user) {
  userDocument.textContent = user.documento; // Muestra el documento del usuario
  userName.textContent = user.name; // Muestra el nombre del usuario
  userEmail.textContent = user.email; // Muestra el email del usuario
  userId.textContent = user.id; // Muestra el ID del usuario
  userPanel.classList.remove("hidden"); // Hace visible el panel de usuario
}

// Función para activar o desactivar el formulario de tareas según si hay usuario seleccionado
function toggleTaskForm(enabled) {
  const elements = taskForm.querySelectorAll("input, textarea, select, button"); // Selecciona todos los elementos del formulario
  elements.forEach((element) => {
    element.disabled = !enabled; // Deshabilita o habilita cada elemento
  });
  taskForm.setAttribute("aria-disabled", String(!enabled)); // Actualiza atributo de accesibilidad
  if (!enabled) {
    taskForm.reset(); // Resetea el formulario si se deshabilita
  }
}

// Función para crear una celda de tabla reutilizable
function createCell(content) {
  const cell = document.createElement("td"); // Crea un elemento <td>
  cell.textContent = content; // Establece el contenido de texto
  return cell; // Retorna la celda creada
}

// Función para crear una etiqueta visual (pill) para el estado de la tarea
function createStatusPill(status) {
  const pill = document.createElement("span"); // Crea un elemento <span>
  const statusClass = status.toLowerCase().replace(/\s+/g, "-"); // Convierte el estado a clase CSS (ej: "En progreso" -> "en-progreso")
  pill.textContent = status; // Establece el texto del estado
  pill.className = `status-pill ${statusClass}`; // Aplica clases CSS para el estilo
  return pill; // Retorna el pill creado
}

// Función para crear una fila completa de la tabla con la información de una tarea
function createTaskRow(task) {
  const row = document.createElement("tr"); // Crea un elemento <tr>
  const statusCell = document.createElement("td"); // Crea una celda para el estado
  statusCell.appendChild(createStatusPill(task.status)); // Agrega el pill del estado a la celda
  row.append( // Agrega todas las celdas a la fila
    createCell(String(task.id)), // Celda para el ID
    createCell(task.title), // Celda para el título
    createCell(task.description), // Celda para la descripción
    statusCell, // Celda para el estado
    createCell(task.userName) // Celda para el nombre del usuario
  );
  return row; // Retorna la fila creada
}

// Función para renderizar todas las tareas en la tabla
function renderTasks(tasks) {
  tasksBody.replaceChildren(); // Limpia todas las filas existentes
  const sortedTasks = [...tasks].sort((firstTask, secondTask) => { // Ordena las tareas por ID descendente
    return (secondTask.id ?? 0) - (firstTask.id ?? 0);
  });
  totalTasks = sortedTasks.length; // Actualiza el contador total
  updateTaskCount(); // Actualiza el badge del contador
  if (sortedTasks.length === 0) { // Si no hay tareas
    showEmptyState("Este usuario aun no tiene tareas registradas."); // Muestra mensaje vacío
    return; // Sale de la función
  }
  sortedTasks.forEach((task) => { // Para cada tarea ordenada
    tasksBody.appendChild(createTaskRow(task)); // Agrega la fila a la tabla
  });
  hideEmptyState(); // Oculta el mensaje vacío
}

// Función para agregar una nueva tarea al inicio de la tabla sin recargar todo
function prependTask(task) {
  tasksBody.prepend(createTaskRow(task)); // Agrega la fila al inicio
  totalTasks += 1; // Incrementa el contador
  updateTaskCount(); // Actualiza el badge
  hideEmptyState(); // Oculta el mensaje vacío
}

// Función asíncrona para buscar un usuario por su documento
async function searchUserByDocument(documentNumber) {
  const response = await fetch(`${API_URL}/users`); // Hace una petición GET a la API de usuarios
  if (!response.ok) { // Si la respuesta no es exitosa
    throw new Error("No se pudo consultar el usuario."); // Lanza un error
  }
  const users = await response.json(); // Convierte la respuesta a JSON
  const normalizedDocument = cleanValue(String(documentNumber)); // Normaliza el documento de entrada
  const user = users.find( // Busca en la lista de usuarios
    (item) => cleanValue(String(item.documento)) === normalizedDocument // Compara documentos normalizados
  );
  return user ?? null; // Retorna el usuario encontrado o null
}

// Función asíncrona para cargar las tareas de un usuario específico
async function loadTasksByUser(userIdValue) {
  const response = await fetch(`${API_URL}/tareas?userId=${userIdValue}`); // Petición GET con filtro por userId
  if (!response.ok) { // Si falla
    throw new Error("No se pudieron cargar las tareas."); // Error
  }
  return response.json(); // Retorna las tareas en JSON
}

// Función asíncrona para guardar una nueva tarea en el servidor
async function saveTask(taskData) {
  const response = await fetch(`${API_URL}/tareas`, { // Petición POST a /tareas
    method: "POST", // Método HTTP POST
    headers: { // Cabeceras de la petición
      "Content-Type": "application/json; charset=UTF-8" // Indica que enviamos JSON
    },
    body: JSON.stringify(taskData) // Convierte los datos a JSON
  });
  if (!response.ok) { // Si falla
    throw new Error("No se pudo guardar la tarea."); // Error
  }
  return response.json(); // Retorna la tarea guardada
}

// Función para validar el formulario de búsqueda
function validateSearchForm() {
  const documentNumber = cleanValue(documentInput.value); // Limpia el valor del input
  if (documentNumber === "") { // Si está vacío
    showFeedback( // Muestra mensaje de error
      searchFeedback,
      "Debes escribir un documento para realizar la busqueda.",
      "error"
    );
    showEmptyState("Ingresa un documento valido para iniciar la consulta."); // Muestra estado vacío
    return null; // Retorna null para indicar error
  }
  return documentNumber; // Retorna el documento válido
}

// Función para validar el formulario de tareas
function validateTaskForm() {
  const title = cleanValue(taskTitle.value); // Limpia título
  const description = cleanValue(taskDescription.value); // Limpia descripción
  const status = taskStatus.value; // Obtiene estado
  if (title === "" || description === "" || status === "") { // Si algún campo vacío
    showFeedback( // Muestra error
      taskFeedback,
      "Todos los campos de la tarea son obligatorios.",
      "error"
    );
    return null; // Error
  }
  return { title, description, status }; // Retorna objeto con datos válidos
}

// Función asíncrona para manejar el envío del formulario de búsqueda
async function handleSearchSubmit(event) {
  event.preventDefault(); // Previene recarga de página
  hideFeedback(searchFeedback); // Oculta feedbacks previos
  hideFeedback(taskFeedback);
  const documentNumber = validateSearchForm(); // Valida el formulario
  if (!documentNumber) { // Si no válido
    currentUser = null; // Resetea usuario
    clearUserPanel(); // Limpia panel
    toggleTaskForm(false); // Deshabilita formulario de tareas
    renderTasks([]); // Limpia tabla
    return; // Sale
  }
  searchButton.disabled = true; // Deshabilita botón mientras busca
  clearUserPanel(); // Limpia panel
  toggleTaskForm(false); // Deshabilita tareas
  tasksBody.replaceChildren(); // Limpia tabla
  showFeedback(searchFeedback, "Buscando usuario en el servidor local...", "info"); // Mensaje de búsqueda
  showEmptyState("Consultando informacion del usuario..."); // Estado vacío
  try {
    const user = await searchUserByDocument(documentNumber); // Busca usuario
    if (!user) { // Si no encontrado
      currentUser = null; // Resetea
      renderTasks([]); // Limpia tabla
      showEmptyState("No hay tareas para mostrar porque el usuario no existe."); // Mensaje vacío
      showFeedback( // Error
        searchFeedback,
        "El usuario no esta registrado en el sistema.",
        "error"
      );
      return; // Sale
    }
    currentUser = user; // Establece usuario actual
    renderUser(user); // Muestra usuario
    toggleTaskForm(true); // Habilita formulario de tareas
    showFeedback( // Éxito
      searchFeedback,
      "Usuario encontrado. Ya puedes registrar tareas.",
      "success"
    );
    const tasks = await loadTasksByUser(user.id); // Carga tareas del usuario
    renderTasks(tasks); // Muestra tareas
  } catch (error) { // Si hay error en la petición
    currentUser = null; // Resetea
    clearUserPanel(); // Limpia
    toggleTaskForm(false); // Deshabilita
    renderTasks([]); // Limpia tabla
    showEmptyState("No fue posible conectarse con el servidor local."); // Mensaje vacío
    showFeedback( // Error de conexión
      searchFeedback,
      "No se pudo consultar el servidor. Revisa que json-server este activo.",
      "error"
    );
  } finally {
    searchButton.disabled = false; // Rehabilita botón
  }
}

// Función asíncrona para manejar el envío del formulario de tareas
async function handleTaskSubmit(event) {
  event.preventDefault(); // Previene recarga
  hideFeedback(taskFeedback); // Oculta feedbacks
  if (!currentUser) { // Si no hay usuario seleccionado
    showFeedback( // Error
      taskFeedback,
      "Primero debes buscar un usuario valido.",
      "error"
    );
    return; // Sale
  }
  const taskData = validateTaskForm(); // Valida formulario
  if (!taskData) { // Si no válido
    return; // Sale
  }
  taskButton.disabled = true; // Deshabilita botón
  showFeedback(taskFeedback, "Guardando tarea en el servidor...", "info"); // Mensaje de guardado
  try {
    const newTask = await saveTask({ // Guarda tarea
      userId: currentUser.id, // ID del usuario
      documento: currentUser.documento, // Documento del usuario
      userName: currentUser.name, // Nombre del usuario
      title: taskData.title, // Título de la tarea
      description: taskData.description, // Descripción
      status: taskData.status // Estado
    });
    prependTask(newTask); // Agrega tarea a la tabla
    taskForm.reset(); // Resetea formulario
    taskTitle.focus(); // Enfoca el campo de título
    showFeedback(taskFeedback, "Tarea registrada correctamente.", "success"); // Éxito
  } catch (error) { // Si falla
    showFeedback( // Error
      taskFeedback,
      "No se pudo guardar la tarea. Verifica el servidor local.",
      "error"
    );
  } finally {
    taskButton.disabled = false; // Rehabilita botón
  }
}

// Configuración inicial de la página
toggleTaskForm(false); // Deshabilita formulario de tareas al inicio
updateTaskCount(); // Actualiza contador (0 tareas)
showEmptyState("Busca un usuario para cargar sus tareas y habilitar el formulario."); // Mensaje inicial vacío

// Agrega event listeners para los formularios
searchForm.addEventListener("submit", handleSearchSubmit); // Escucha envío de búsqueda
taskForm.addEventListener("submit", handleTaskSubmit); // Escucha envío de tarea

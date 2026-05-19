const API_URL = "http://10.1.100.223:3001";

const searchForm = document.querySelector("#search-form");
const searchButton = document.querySelector("#search-button");
const documentInput = document.querySelector("#documento");
const searchFeedback = document.querySelector("#search-feedback");

const userPanel = document.querySelector("#user-panel");
const userDocument = document.querySelector("#user-document");
const userName = document.querySelector("#user-name");
const userEmail = document.querySelector("#user-email");
const userId = document.querySelector("#user-id");

const taskForm = document.querySelector("#task-form");
const taskButton = document.querySelector("#task-button");
const taskTitle = document.querySelector("#task-title");
const taskDescription = document.querySelector("#task-description");
const taskStatus = document.querySelector("#task-status");
const taskFeedback = document.querySelector("#task-feedback");

const taskCount = document.querySelector("#task-count");
const emptyState = document.querySelector("#empty-state");
const tableWrapper = document.querySelector("#table-wrapper");
const tasksBody = document.querySelector("#tasks-body");

let currentUser = null;
let totalTasks = 0;

// Limpia espacios al inicio y al final para validar mejor los datos.
function cleanValue(value) {
  return value.trim();
}

// Muestra mensajes de ayuda, error o exito debajo del formulario.
function showFeedback(element, message, type) {
  element.textContent = message;
  element.className = `feedback ${type}`;
  element.classList.remove("hidden");
}

// Oculta un mensaje cuando ya no es necesario mostrarlo.
function hideFeedback(element) {
  element.textContent = "";
  element.className = "feedback hidden";
}

// Actualiza el contador visual con la cantidad de tareas visibles.
function updateTaskCount() {
  const label = totalTasks === 1 ? "tarea" : "tareas";
  taskCount.textContent = `${totalTasks} ${label}`;
}

// Muestra un texto cuando todavia no hay tareas para renderizar.
function showEmptyState(message) {
  emptyState.textContent = message;
  emptyState.classList.remove("hidden");
  tableWrapper.classList.add("hidden");
}

// Oculta el estado vacio cuando ya existen filas dentro de la tabla.
function hideEmptyState() {
  emptyState.classList.add("hidden");
  tableWrapper.classList.remove("hidden");
}

// Borra los datos del usuario cuando la busqueda falla o cambia.
function clearUserPanel() {
  userDocument.textContent = "-";
  userName.textContent = "-";
  userEmail.textContent = "-";
  userId.textContent = "-";
  userPanel.classList.add("hidden");
}

// Inserta en pantalla los datos del usuario encontrado en la consulta.
function renderUser(user) {
  userDocument.textContent = user.documento;
  userName.textContent = user.name;
  userEmail.textContent = user.email;
  userId.textContent = user.id;
  userPanel.classList.remove("hidden");
}

// Activa o bloquea el formulario de tareas segun el resultado de la busqueda.
function toggleTaskForm(enabled) {
  const elements = taskForm.querySelectorAll("input, textarea, select, button");

  elements.forEach((element) => {
    element.disabled = !enabled;
  });

  taskForm.setAttribute("aria-disabled", String(!enabled));

  if (!enabled) {
    taskForm.reset();
  }
}

// Crea una celda de la tabla para reutilizar la misma estructura.
function createCell(content) {
  const cell = document.createElement("td");
  cell.textContent = content;
  return cell;
}

// Crea una etiqueta visual para distinguir el estado de la tarea.
function createStatusPill(status) {
  const pill = document.createElement("span");
  const statusClass = status.toLowerCase().replace(/\s+/g, "-");

  pill.textContent = status;
  pill.className = `status-pill ${statusClass}`;

  return pill;
}

// Obtiene la clave de localStorage para guardar las tareas de un usuario.
function getTaskStorageKey(userId) {
  return `tareas-usuario-${userId}`;
}

// Carga tareas desde localStorage para un usuario. Esto permite que las tareas permanezcan al recargar.
function loadTasksFromStorage(userId) {
  const key = getTaskStorageKey(userId);
  const storedValue = localStorage.getItem(key);

  if (!storedValue) {
    return [];
  }

  try {
    return JSON.parse(storedValue);
  } catch (error) {
    return [];
  }
}

// Guarda el arreglo de tareas del usuario en localStorage.
function saveTasksToStorage(userId, tasks) {
  const key = getTaskStorageKey(userId);
  localStorage.setItem(key, JSON.stringify(tasks));
}

// Agrega o actualiza una tarea en el almacenamiento local.
function persistTaskLocally(task, userId) {
  const storedTasks = loadTasksFromStorage(userId);
  const existingTaskIndex = storedTasks.findIndex((item) => item.id === task.id);

  if (existingTaskIndex === -1) {
    storedTasks.push(task);
  } else {
    storedTasks[existingTaskIndex] = task;
  }

  saveTasksToStorage(userId, storedTasks);
}

// Mezcla tareas del servidor con las tareas guardadas localmente para evitar duplicados.
function mergeServerAndLocalTasks(serverTasks, userId) {
  const localTasks = loadTasksFromStorage(userId);
  const seenIds = new Set(serverTasks.map((task) => task.id));

  const mergedTasks = [...serverTasks];

  localTasks.forEach((localTask) => {
    if (!seenIds.has(localTask.id)) {
      mergedTasks.push(localTask);
    }
  });

  return mergedTasks;
}

// Construye dinamicamente una fila de la tabla con la informacion de la tarea.
function createTaskRow(task) {
  const row = document.createElement("tr");
  const statusCell = document.createElement("td");

  statusCell.appendChild(createStatusPill(task.status));

  row.append(
    createCell(String(task.id)),
    createCell(task.title),
    createCell(task.description),
    statusCell,
    createCell(task.userName)
  );

  return row;
}

// Reemplaza el contenido de la tabla para mostrar las tareas del usuario actual.
function renderTasks(tasks) {
  tasksBody.replaceChildren();

  const sortedTasks = [...tasks].sort((firstTask, secondTask) => {
    return (secondTask.id ?? 0) - (firstTask.id ?? 0);
  });

  totalTasks = sortedTasks.length;
  updateTaskCount();

  if (sortedTasks.length === 0) {
    showEmptyState("Este usuario aun no tiene tareas registradas.");
    return;
  }

  sortedTasks.forEach((task) => {
    tasksBody.appendChild(createTaskRow(task));
  });

  hideEmptyState();
}

// Agrega solo la nueva tarea al inicio de la tabla sin volver a pintar todo.
function prependTask(task) {
  tasksBody.prepend(createTaskRow(task));
  totalTasks += 1;
  updateTaskCount();
  hideEmptyState();
}

// Consulta el usuario en el servidor usando el numero de documento.
// Si la consulta exacta en el servidor no devuelve resultados, se filtra en el cliente.
async function searchUserByDocument(documentNumber) {
  const response = await fetch(`${API_URL}/users`);

  if (!response.ok) {
    throw new Error("No se pudo consultar el usuario.");
  }

  const users = await response.json();
  const normalizedDocument = cleanValue(String(documentNumber));
  const user = users.find(
    (item) => cleanValue(String(item.documento)) === normalizedDocument
  );

  return user ?? null;
}

// Carga las tareas que ya estaban asociadas al usuario encontrado.
async function loadTasksByUser(userIdValue) {
  try {
    const response = await fetch(`${API_URL}/tareas?userId=${userIdValue}`);

    if (!response.ok) {
      throw new Error("No se pudieron cargar las tareas.");
    }

    const serverTasks = await response.json();
    const mergedTasks = mergeServerAndLocalTasks(serverTasks, userIdValue);

    // Guardamos localmente el resultado combinado para que quede persistido en el navegador.
    saveTasksToStorage(userIdValue, mergedTasks);
    return mergedTasks;
  } catch (error) {
    // Si falla la consulta al servidor, devolvemos las tareas guardadas en localStorage.
    return loadTasksFromStorage(userIdValue);
  }
}

// Guarda una nueva tarea en el servidor local sin recargar la pagina.
async function saveTask(taskData) {
  try {
    const response = await fetch(`${API_URL}/tareas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=UTF-8"
      },
      body: JSON.stringify(taskData)
    });

    if (!response.ok) {
      throw new Error("No se pudo guardar la tarea.");
    }

    const createdTask = await response.json();
    persistTaskLocally(createdTask, taskData.userId);
    return createdTask;
  } catch (error) {
    // Si el servidor no está disponible, guardamos la tarea localmente con un id temporal.
    const fallbackTask = {
      ...taskData,
      id: Date.now()
    };

    persistTaskLocally(fallbackTask, taskData.userId);
    return fallbackTask;
  }
}

// Valida que el documento no este vacio antes de buscar al usuario.
function validateSearchForm() {
  const documentNumber = cleanValue(documentInput.value);

  if (documentNumber === "") {
    showFeedback(
      searchFeedback,
      "Debes escribir un documento para realizar la busqueda.",
      "error"
    );
    showEmptyState("Ingresa un documento valido para iniciar la consulta.");
    return null;
  }

  return documentNumber;
}

// Valida que todos los datos de la tarea existan antes de enviarlos.
function validateTaskForm() {
  const title = cleanValue(taskTitle.value);
  const description = cleanValue(taskDescription.value);
  const status = taskStatus.value;

  if (title === "" || description === "" || status === "") {
    showFeedback(
      taskFeedback,
      "Todos los campos de la tarea son obligatorios.",
      "error"
    );
    return null;
  }

  return { title, description, status };
}

// Maneja la busqueda del usuario y actualiza el DOM con los resultados.
async function handleSearchSubmit(event) {
  event.preventDefault();
  hideFeedback(searchFeedback);
  hideFeedback(taskFeedback);

  const documentNumber = validateSearchForm();

  if (!documentNumber) {
    currentUser = null;
    clearUserPanel();
    toggleTaskForm(false);
    renderTasks([]);
    return;
  }

  searchButton.disabled = true;
  clearUserPanel();
  toggleTaskForm(false);
  tasksBody.replaceChildren();
  showFeedback(searchFeedback, "Buscando usuario en el servidor local...", "info");
  showEmptyState("Consultando informacion del usuario...");

  try {
    const user = await searchUserByDocument(documentNumber);

    if (!user) {
      currentUser = null;
      renderTasks([]);
      showEmptyState("No hay tareas para mostrar porque el usuario no existe.");
      showFeedback(
        searchFeedback,
        "El usuario no esta registrado en el sistema.",
        "error"
      );
      return;
    }

    currentUser = user;
    renderUser(user);
    toggleTaskForm(true);
    showFeedback(
      searchFeedback,
      "Usuario encontrado. Ya puedes registrar tareas.",
      "success"
    );

    const tasks = await loadTasksByUser(user.id);
    renderTasks(tasks);
  } catch (error) {
    currentUser = null;
    clearUserPanel();
    toggleTaskForm(false);
    renderTasks([]);
    showEmptyState("No fue posible conectarse con el servidor local.");
    showFeedback(
      searchFeedback,
      "No se pudo consultar el servidor. Revisa que json-server este activo.",
      "error"
    );
  } finally {
    searchButton.disabled = false;
  }
}

// Maneja el registro de nuevas tareas y las agrega al DOM en tiempo real.
async function handleTaskSubmit(event) {
  event.preventDefault();
  hideFeedback(taskFeedback);

  if (!currentUser) {
    showFeedback(
      taskFeedback,
      "Primero debes buscar un usuario valido.",
      "error"
    );
    return;
  }

  const taskData = validateTaskForm();

  if (!taskData) {
    return;
  }

  taskButton.disabled = true;
  showFeedback(taskFeedback, "Guardando tarea en el servidor...", "info");

  try {
    const newTask = await saveTask({
      userId: currentUser.id,
      documento: currentUser.documento,
      userName: currentUser.name,
      title: taskData.title,
      description: taskData.description,
      status: taskData.status
    });

    prependTask(newTask);
    taskForm.reset();
    taskTitle.focus();
    showFeedback(taskFeedback, "Tarea registrada correctamente.", "success");
  } catch (error) {
    showFeedback(
      taskFeedback,
      "No se pudo guardar la tarea. Verifica el servidor local.",
      "error"
    );
  } finally {
    taskButton.disabled = false;
  }
}

// Estado inicial de la pagina antes de interactuar con el servidor.
toggleTaskForm(false);
updateTaskCount();
showEmptyState("Busca un usuario para cargar sus tareas y habilitar el formulario.");

searchForm.addEventListener("submit", handleSearchSubmit);
taskForm.addEventListener("submit", handleTaskSubmit);

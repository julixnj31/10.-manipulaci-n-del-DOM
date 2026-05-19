const API_URL = "http://localhost:3000/users";

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

function cleanValue(value) {
    return value.trim();
}

function showFeedback(element, message, type) {
    element.textContent = message;
    element.className = `feedback ${type}`;
    element.classList.remove("hidden");
}

function hideFeedback(element) {
    element.textContent = "";
    element.className = "feedback hidden";
}

function updateTaskCount() {
    const label = totalTasks === 1 ? "tarea" : "tareas";
    taskCount.textContent = `${totalTasks} ${label}`;
}

function showEmptyState(message) {
    emptyState.textContent = message;
    emptyState.classList.remove("hidden");
    tableWrapper.classList.add("hidden");
}

function hideEmptyState() {
    emptyState.classList.add("hidden");
    tableWrapper.classList.remove("hidden");
}

function clearUserPanel() {
    userDocument.textContent = "-";
    userName.textContent = "-";
    userEmail.textContent = "-";
    userId.textContent = "-";
    userPanel.classList.add("hidden");
}

function renderUser(user) {
    userDocument.textContent = user.documento;
    userName.textContent = user.name;
    userEmail.textContent = user.email;
    userId.textContent = user.id;
    userPanel.classList.remove("hidden");
}

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

function createCell(content) {
    const cell = document.createElement("td");
    cell.textContent = content;
    return cell;
}

function createStatusPill(status) {
    const pill = document.createElement("span");
    const statusClass = status.toLowerCase().replace(/\s+/g, "-");
    pill.textContent = status;
    pill.className = `status-pill ${statusClass}`;
    return pill;
}

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

function prependTask(task) {
    tasksBody.prepend(createTaskRow(task));
    totalTasks += 1;
    updateTaskCount();
    hideEmptyState();
}

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

async function loadTasksByUser(userIdValue) {
    const response = await fetch(`${API_URL}/tareas?userId=${userIdValue}`);
    if (!response.ok) {
        throw new Error("No se pudieron cargar las tareas.");
    }
    return response.json();
}

async function saveTask(taskData) {
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
    return response.json();
}

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

toggleTaskForm(false);
updateTaskCount();
showEmptyState("Busca un usuario para cargar sus tareas y habilitar el formulario.");

searchForm.addEventListener("submit", handleSearchSubmit);
taskForm.addEventListener("submit", handleTaskSubmit);

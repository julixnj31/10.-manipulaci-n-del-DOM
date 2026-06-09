import { cargarTareasPorUsuario, eliminarTareaPorId, guardarTarea } from "./js/services/tareasService.js";
import { buscarUsuarioPorDocumento } from "./js/services/usuariosService.js";
import {
  fillTaskForm,
  renderTasks,
  resetTaskForm,
  showEmptyState,
  tareasDOM,
  toggleTaskForm,
  updateTaskCount
} from "./js/ui/tareasUI.js";
import { clearUserPanel, renderUser, usuariosDOM } from "./js/ui/usuariosUI.js";
import { hideFeedback, showFeedback } from "./js/utils/notificaciones.js";
import { validateSearchForm, validateTaskForm } from "./js/utils/validaciones.js";
import { sortTasks, SORT_OPTIONS } from "./js/ui/sorting.js";
import { exportTasksToJSON } from "./js/ui/exportTasks.js";

let currentUser = null;
let currentTasks = [];
let editingTaskId = null;
let currentSortOption = SORT_OPTIONS.NEWEST;

function resetEditingState() {
  editingTaskId = null;
  resetTaskForm();
}

function updateTaskList(tasks) {
  currentTasks = tasks;
  const sortedTasks = sortTasks(currentTasks, currentSortOption);

  renderTasks(sortedTasks, {
    onEdit: handleEditTask,
    onDelete: handleDeleteTask
  });
}

// Esta funcion conserva el respaldo local de tareas cuando el servidor no responde.
async function loadTasksForUser(userId) {
  const result = await cargarTareasPorUsuario(userId);

  if (result.source === "local") {
    showFeedback(
      usuariosDOM.searchFeedback,
      "No fue posible conectar con json-server. Usando datos locales si estan disponibles.",
      "info"
    );
  }

  return result.tasks;
}

function getTaskFormData() {
  return {
    title: tareasDOM.taskTitle.value,
    description: tareasDOM.taskDescription.value,
    status: tareasDOM.taskStatus.value
  };
}

async function handleSearchSubmit(event) {
  event.preventDefault();
  hideFeedback(usuariosDOM.searchFeedback);
  hideFeedback(tareasDOM.taskFeedback);

  const validation = validateSearchForm(usuariosDOM.documentInput.value);

  if (!validation.valid) {
    showFeedback(usuariosDOM.searchFeedback, validation.message, validation.type);
    showEmptyState("Ingresa un documento valido para iniciar la consulta.");
    currentUser = null;
    clearUserPanel();
    toggleTaskForm(false);
    tareasDOM.sortSelect.disabled = true;
    tareasDOM.exportButton.disabled = true;
    updateTaskList([]);
    return;
  }

  usuariosDOM.searchButton.disabled = true;
  clearUserPanel();
  toggleTaskForm(false);
  tareasDOM.sortSelect.disabled = true;
  showFeedback(usuariosDOM.searchFeedback, "Buscando usuario...", "info");
  showEmptyState("Consultando informacion del usuario...");

  try {
    const user = await buscarUsuarioPorDocumento(validation.value);

    if (!user) {
      currentUser = null;
      showFeedback(usuariosDOM.searchFeedback, "El usuario no esta registrado.", "error");
      showEmptyState("No hay tareas para mostrar porque el usuario no existe.");
      tareasDOM.sortSelect.disabled = true;
      tareasDOM.exportButton.disabled = true;
      updateTaskList([]);
      return;
    }

    currentUser = user;
    renderUser(user);
    toggleTaskForm(true);
    tareasDOM.sortSelect.disabled = false;
    tareasDOM.exportButton.disabled = false;
    hideFeedback(usuariosDOM.searchFeedback);

    const tasks = await loadTasksForUser(currentUser.id);
    updateTaskList(tasks);

    showFeedback(
      usuariosDOM.searchFeedback,
      "Usuario encontrado. Ya puedes registrar tareas.",
      "success"
    );
  } catch (error) {
    currentUser = null;
    clearUserPanel();
    toggleTaskForm(false);
    tareasDOM.sortSelect.disabled = true;
    tareasDOM.exportButton.disabled = true;
    updateTaskList([]);

    showFeedback(
      usuariosDOM.searchFeedback,
      "No se pudo conectar con el servidor. Revisa que json-server este activo.",
      "error"
    );

    showEmptyState("No fue posible establecer conexion con json-server.");
  } finally {
    usuariosDOM.searchButton.disabled = false;
  }
}

async function handleTaskSubmit(event) {
  event.preventDefault();
  hideFeedback(tareasDOM.taskFeedback);

  if (!currentUser) {
    showFeedback(
      tareasDOM.taskFeedback,
      "Primero debes buscar un usuario valido.",
      "error"
    );
    return;
  }

  const validation = validateTaskForm(getTaskFormData());

  if (!validation.valid) {
    showFeedback(tareasDOM.taskFeedback, validation.message, validation.type);
    return;
  }

  tareasDOM.taskButton.disabled = true;

  try {
    const result = await guardarTarea({
      user: currentUser,
      taskData: validation.data,
      editingTaskId
    });

    if (result.action === "update") {
      currentTasks = currentTasks.map((task) => {
        return String(task.id) === String(editingTaskId)
          ? { ...task, ...result.task }
          : task;
      });

      showFeedback(
        tareasDOM.taskFeedback,
        result.source === "server"
          ? "Tarea actualizada correctamente."
          : "No se pudo conectar con el servidor. Cambios guardados localmente.",
        result.source === "server" ? "success" : "info"
      );
    } else {
      currentTasks.unshift(result.task);

      showFeedback(
        tareasDOM.taskFeedback,
        result.source === "server"
          ? "Tarea registrada correctamente."
          : "No se pudo conectar con el servidor. La tarea se ha guardado localmente.",
        result.source === "server" ? "success" : "info"
      );
    }

    updateTaskList(currentTasks);
    resetEditingState();
    tareasDOM.taskForm.reset();
  } finally {
    tareasDOM.taskButton.disabled = false;
  }
}

function handleEditTask(task) {
  editingTaskId = task.id;
  fillTaskForm(task);
}

async function handleDeleteTask(taskId) {
  if (!currentUser) {
    showFeedback(
      tareasDOM.taskFeedback,
      "No hay usuario seleccionado para borrar la tarea.",
      "error"
    );
    return;
  }

  const confirmed = window.confirm("Deseas eliminar esta tarea?");

  if (!confirmed) {
    return;
  }

  const result = await eliminarTareaPorId(taskId, currentUser.id);

  currentTasks = currentTasks.filter((task) => String(task.id) !== String(taskId));
  updateTaskList(currentTasks);

  showFeedback(
    tareasDOM.taskFeedback,
    result.source === "server"
      ? "Tarea eliminada correctamente."
      : "No se pudo contactar al servidor, pero la tarea se elimino localmente.",
    result.source === "server" ? "success" : "info"
  );
}

function handleCancelEdit() {
  resetEditingState();
  showFeedback(tareasDOM.taskFeedback, "Edicion cancelada.", "info");
}

function handleSortChange(event) {
  currentSortOption = event.target.value;
  updateTaskList(currentTasks);
}

function handleExportClick() {
  if (currentTasks.length === 0) {
    showFeedback(tareasDOM.taskFeedback, "No hay tareas para exportar.", "info");
    return;
  }

  const timestamp = new Date().toISOString().split("T")[0];
  const fileName = `tareas-${currentUser.documento}-${timestamp}.json`;
  
  exportTasksToJSON(currentTasks, fileName);
  showFeedback(tareasDOM.taskFeedback, "Tareas exportadas correctamente.", "success");
}

function bindAppEvents() {
  usuariosDOM.searchForm.addEventListener("submit", handleSearchSubmit);
  tareasDOM.taskForm.addEventListener("submit", handleTaskSubmit);
  tareasDOM.cancelEditButton.addEventListener("click", handleCancelEdit);
  tareasDOM.sortSelect.addEventListener("change", handleSortChange);
  tareasDOM.exportButton.addEventListener("click", handleExportClick);
}

// Main es el punto de entrada: conecta eventos, servicios y renderizado.
function initializeApp() {
  toggleTaskForm(false);
  tareasDOM.sortSelect.disabled = true;
  tareasDOM.exportButton.disabled = true;
  showEmptyState("Busca un usuario para cargar sus tareas y habilitar el formulario.");
  currentTasks = [];
  updateTaskCount(0);
  bindAppEvents();
}

initializeApp();

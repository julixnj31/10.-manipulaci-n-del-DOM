import { cargarTareasPorUsuario, eliminarTareaPorId, guardarTarea } from "./js/services/tareasService.js";
import { buscarUsuarioPorDocumento } from "./js/services/usuariosService.js";
import {
  fillTaskForm,
  renderTasks,
  resetTaskForm,
  resetTaskFilters,
  showEmptyState,
  tareasDOM,
  toggleTaskForm,
  updateTaskCount,
  updateUserFilterOptions
} from "./js/ui/tareasUI.js";
import { clearUserPanel, renderUser, usuariosDOM } from "./js/ui/usuariosUI.js";
import { hideFeedback, showFeedback } from "./js/utils/notificaciones.js";
import { filterTasks, sortTasks } from "./js/utils/taskFilters.js";
import { exportTasksAsJson } from "./js/utils/exportTasks.js";
import { validateSearchForm, validateTaskForm } from "./js/utils/validaciones.js";

let currentUser = null;
let currentTasks = [];
let visibleTasks = [];
let editingTaskId = null;
let editingTask = null;
let activeFilters = {
  status: "all",
  user: "all"
};
let activeSort = "createdAt";

function resetEditingState() {
  editingTaskId = null;
  editingTask = null;
  resetTaskForm();
}

function getVisibleTasks() {
  return sortTasks(filterTasks(currentTasks, activeFilters), activeSort);
}

function updateTaskList(tasks) {
  currentTasks = tasks;
  visibleTasks = getVisibleTasks();
  updateUserFilterOptions(currentTasks);

  renderTasks(visibleTasks, {
    onEdit: handleEditTask,
    onDelete: handleDeleteTask
  });
}

function refreshTaskView() {
  visibleTasks = getVisibleTasks();
  renderTasks(visibleTasks, {
    onEdit: handleEditTask,
    onDelete: handleDeleteTask
  });
}

function setDefaultFilters() {
  activeFilters = {
    status: "all",
    user: "all"
  };
  activeSort = "createdAt";
  resetTaskFilters();
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
    updateTaskList([]);
    return;
  }

  usuariosDOM.searchButton.disabled = true;
  clearUserPanel();
  toggleTaskForm(false);
  showFeedback(usuariosDOM.searchFeedback, "Buscando usuario...", "info");
  showEmptyState("Consultando informacion del usuario...");

  try {
    const user = await buscarUsuarioPorDocumento(validation.value);

    if (!user) {
      currentUser = null;
      showFeedback(usuariosDOM.searchFeedback, "El usuario no esta registrado.", "error");
      showEmptyState("No hay tareas para mostrar porque el usuario no existe.");
      updateTaskList([]);
      return;
    }

    currentUser = user;
    renderUser(user);
    toggleTaskForm(true);
    hideFeedback(usuariosDOM.searchFeedback);

    setDefaultFilters();
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
      editingTaskId,
      editingTask
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
  editingTask = task;
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

function handleFilterChange() {
  activeFilters.status = tareasDOM.filterStatus?.value || "all";
  activeFilters.user = tareasDOM.filterUser?.value || "all";
  refreshTaskView();
}

function handleSortChange() {
  activeSort = tareasDOM.sortBy?.value || "createdAt";
  refreshTaskView();
}

function handleExportTasks() {
  if (visibleTasks.length === 0) {
    showFeedback(tareasDOM.taskFeedback, "No hay tareas visibles para exportar.", "info");
    return;
  }

  exportTasksAsJson(visibleTasks, "tareas-visibles.json");
  showFeedback(tareasDOM.taskFeedback, "Tareas exportadas correctamente.", "success");
}

function bindAppEvents() {
  usuariosDOM.searchForm.addEventListener("submit", handleSearchSubmit);
  tareasDOM.taskForm.addEventListener("submit", handleTaskSubmit);
  tareasDOM.cancelEditButton.addEventListener("click", handleCancelEdit);
  tareasDOM.filterStatus?.addEventListener("change", handleFilterChange);
  tareasDOM.filterUser?.addEventListener("change", handleFilterChange);
  tareasDOM.sortBy?.addEventListener("change", handleSortChange);
  tareasDOM.exportButton?.addEventListener("click", handleExportTasks);
}

// Main es el punto de entrada: conecta eventos, servicios y renderizado.
function initializeApp() {
  toggleTaskForm(false);
  showEmptyState("Busca un usuario para cargar sus tareas y habilitar el formulario.");
  currentTasks = [];
  visibleTasks = [];
  setDefaultFilters();
  updateTaskCount(0);
  bindAppEvents();
}

initializeApp();

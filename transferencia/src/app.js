import * as Api from "./api/api.js";
import * as Storage from "./storage/storage.js";
import * as Validations from "./validations/validations.js";
import * as Ui from "./ui/ui.js";
import { bindAppEvents } from "./events/events.js";

let currentUser = null;
let currentTasks = [];
let editingTaskId = null;

function resetEditingState() {
  editingTaskId = null;
  Ui.resetTaskForm();
}

function updateTaskList(tasks) {
  currentTasks = tasks;
  Ui.renderTasks(currentTasks, {
    onEdit: handleEditTask,
    onDelete: handleDeleteTask
  });
}

async function loadTasksForUser(userId) {
  try {
    const serverTasks = await Api.obtenerTareasPorUsuario(userId);
    const mergedTasks = Storage.mergeServerAndLocalTasks(serverTasks, userId);
    Storage.saveTasksToStorage(userId, mergedTasks);
    return mergedTasks;
  } catch (error) {
    Ui.showFeedback(
      Ui.DOM.searchFeedback,
      "No fue posible conectar con json-server. Usando datos locales si están disponibles.",
      "info"
    );
    return Storage.loadTasksFromStorage(userId);
  }
}

async function handleSearchSubmit(event) {
  event.preventDefault();
  Ui.hideFeedback(Ui.DOM.searchFeedback);
  Ui.hideFeedback(Ui.DOM.taskFeedback);

  const validation = Validations.validateSearchForm(Ui.DOM.documentInput.value);

  if (!validation.valid) {
    Ui.showFeedback(Ui.DOM.searchFeedback, validation.message, validation.type);
    Ui.showEmptyState("Ingresa un documento valido para iniciar la consulta.");
    currentUser = null;
    Ui.clearUserPanel();
    Ui.toggleTaskForm(false);
    updateTaskList([]);
    return;
  }

  Ui.DOM.searchButton.disabled = true;
  Ui.clearUserPanel();
  Ui.toggleTaskForm(false);
  Ui.showFeedback(Ui.DOM.searchFeedback, "Buscando usuario...", "info");
  Ui.showEmptyState("Consultando información del usuario...");

  try {
    const user = await Api.buscarUsuarioPorDocumento(validation.value);

    if (!user) {
      currentUser = null;
      Ui.showFeedback(Ui.DOM.searchFeedback, "El usuario no está registrado.", "error");
      Ui.showEmptyState("No hay tareas para mostrar porque el usuario no existe.");
      updateTaskList([]);
      return;
    }

    currentUser = user;
    Ui.renderUser(user);
    Ui.toggleTaskForm(true);
    Ui.hideFeedback(Ui.DOM.searchFeedback);

    const tasks = await loadTasksForUser(currentUser.id);
    updateTaskList(tasks);

    Ui.showFeedback(Ui.DOM.searchFeedback, "Usuario encontrado. Ya puedes registrar tareas.", "success");
  } catch (error) {
    currentUser = null;
    Ui.clearUserPanel();
    Ui.toggleTaskForm(false);
    updateTaskList([]);
    Ui.showFeedback(
      Ui.DOM.searchFeedback,
      "No se pudo conectar con el servidor. Revisa que json-server esté activo.",
      "error"
    );
    Ui.showEmptyState("No fue posible establecer conexión con json-server.");
  } finally {
    Ui.DOM.searchButton.disabled = false;
  }
}

async function handleTaskSubmit(event) {
  event.preventDefault();
  Ui.hideFeedback(Ui.DOM.taskFeedback);

  if (!currentUser) {
    Ui.showFeedback(Ui.DOM.taskFeedback, "Primero debes buscar un usuario válido.", "error");
    return;
  }

  const validation = Validations.validateTaskForm({
    title: Ui.DOM.taskTitle.value,
    description: Ui.DOM.taskDescription.value,
    status: Ui.DOM.taskStatus.value
  });

  if (!validation.valid) {
    Ui.showFeedback(Ui.DOM.taskFeedback, validation.message, validation.type);
    return;
  }

  Ui.DOM.taskButton.disabled = true;

  const payload = {
    userId: currentUser.id,
    documento: currentUser.documento,
    userName: currentUser.name,
    title: validation.data.title,
    description: validation.data.description,
    status: validation.data.status
  };

  try {
    let task;

    if (editingTaskId) {
      task = await Api.actualizarTarea(editingTaskId, payload);
      currentTasks = currentTasks.map((item) =>
        String(item.id) === String(editingTaskId) ? { ...item, ...task } : item
      );
      Ui.showFeedback(Ui.DOM.taskFeedback, "Tarea actualizada correctamente.", "success");
    } else {
      task = await Api.crearTarea(payload);
      currentTasks.unshift(task);
      Ui.showFeedback(Ui.DOM.taskFeedback, "Tarea registrada correctamente.", "success");
    }

    Storage.addOrUpdateLocalTask(task, currentUser.id);
    updateTaskList(currentTasks);
    resetEditingState();
    Ui.DOM.taskForm.reset();
  } catch (error) {
    const fallbackTask = {
      ...payload,
      id: editingTaskId || `offline-${Date.now()}`
    };

    Storage.addOrUpdateLocalTask(fallbackTask, currentUser.id);

    if (editingTaskId) {
      currentTasks = currentTasks.map((item) =>
        String(item.id) === String(editingTaskId) ? fallbackTask : item
      );
      Ui.showFeedback(
        Ui.DOM.taskFeedback,
        "No se pudo conectar con el servidor. Cambios guardados localmente.",
        "info"
      );
    } else {
      currentTasks.unshift(fallbackTask);
      Ui.showFeedback(
        Ui.DOM.taskFeedback,
        "No se pudo conectar con el servidor. La tarea se ha guardado localmente.",
        "info"
      );
    }

    updateTaskList(currentTasks);
    resetEditingState();
    Ui.DOM.taskForm.reset();
  } finally {
    Ui.DOM.taskButton.disabled = false;
  }
}

function handleEditTask(task) {
  editingTaskId = task.id;
  Ui.fillTaskForm(task);
}

async function handleDeleteTask(taskId) {
  if (!currentUser) {
    Ui.showFeedback(Ui.DOM.taskFeedback, "No hay usuario seleccionado para borrar la tarea.", "error");
    return;
  }

  const confirmed = window.confirm("¿Deseas eliminar esta tarea?");
  if (!confirmed) {
    return;
  }

  try {
    await Api.eliminarTarea(taskId);
    currentTasks = currentTasks.filter((task) => String(task.id) !== String(taskId));
    Storage.removeLocalTask(taskId, currentUser.id);
    updateTaskList(currentTasks);
    Ui.showFeedback(Ui.DOM.taskFeedback, "Tarea eliminada correctamente.", "success");
  } catch (error) {
    currentTasks = currentTasks.filter((task) => String(task.id) !== String(taskId));
    Storage.removeLocalTask(taskId, currentUser.id);
    updateTaskList(currentTasks);
    Ui.showFeedback(
      Ui.DOM.taskFeedback,
      "No se pudo contactar al servidor, pero la tarea se eliminó localmente.",
      "info"
    );
  }
}

function handleCancelEdit() {
  resetEditingState();
  Ui.showFeedback(Ui.DOM.taskFeedback, "Edición cancelada.", "info");
}

function initializeApp() {
  Ui.toggleTaskForm(false);
  Ui.updateTaskCount(0);
  Ui.showEmptyState("Busca un usuario para cargar sus tareas y habilitar el formulario.");

  bindAppEvents({
    onSearchSubmit: handleSearchSubmit,
    onTaskSubmit: handleTaskSubmit,
    onCancelEdit: handleCancelEdit
  });
}

initializeApp();

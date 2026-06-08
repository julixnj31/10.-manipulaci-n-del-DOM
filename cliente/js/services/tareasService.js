import {
  createTask,
  deleteTask,
  getTasksByUser,
  updateTask
} from "../api/tareasApi.js";

const TASK_STORAGE_PREFIX = "transferencia-tareas";

function getTaskStorageKey(userId) {
  return `${TASK_STORAGE_PREFIX}-${userId}`;
}

function loadTasksFromStorage(userId) {
  const raw = localStorage.getItem(getTaskStorageKey(userId));

  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    console.warn("Error leyendo tareas desde localStorage.", error);
    return [];
  }
}

function saveTasksToStorage(userId, tasks) {
  localStorage.setItem(getTaskStorageKey(userId), JSON.stringify(tasks));
}

function addOrUpdateLocalTask(task, userId) {
  const tasks = loadTasksFromStorage(userId);
  const taskIndex = tasks.findIndex(
    (savedTask) => String(savedTask.id) === String(task.id)
  );

  if (taskIndex === -1) {
    tasks.unshift(task);
  } else {
    tasks[taskIndex] = task;
  }

  saveTasksToStorage(userId, tasks);
}

function removeLocalTask(taskId, userId) {
  const tasks = loadTasksFromStorage(userId).filter(
    (task) => String(task.id) !== String(taskId)
  );

  saveTasksToStorage(userId, tasks);
}

function mergeServerAndLocalTasks(serverTasks, userId) {
  const localTasks = loadTasksFromStorage(userId);
  const mergedTasks = [...serverTasks];
  const taskIds = new Set(serverTasks.map((task) => String(task.id)));

  localTasks.forEach((task) => {
    if (!taskIds.has(String(task.id))) {
      mergedTasks.push(task);
    }
  });

  return mergedTasks;
}

// Este servicio conserva la logica de respaldo local que ya tenia la app funcional.
export async function cargarTareasPorUsuario(userId) {
  try {
    const serverTasks = await getTasksByUser(userId);
    const tasks = mergeServerAndLocalTasks(serverTasks, userId);

    saveTasksToStorage(userId, tasks);

    return {
      tasks,
      source: "server"
    };
  } catch (error) {
    return {
      tasks: loadTasksFromStorage(userId),
      source: "local"
    };
  }
}

export async function guardarTarea({ user, taskData, editingTaskId }) {
  const payload = {
    userId: user.id,
    documento: user.documento,
    userName: user.name,
    title: taskData.title,
    description: taskData.description,
    status: taskData.status
  };

  try {
    if (editingTaskId) {
      const task = await updateTask(editingTaskId, payload);

      addOrUpdateLocalTask(task, user.id);

      return {
        action: "update",
        source: "server",
        task
      };
    }

    const task = await createTask(payload);

    addOrUpdateLocalTask(task, user.id);

    return {
      action: "create",
      source: "server",
      task
    };
  } catch (error) {
    const fallbackTask = {
      ...payload,
      id: editingTaskId || `offline-${Date.now()}`
    };

    addOrUpdateLocalTask(fallbackTask, user.id);

    return {
      action: editingTaskId ? "update" : "create",
      source: "local",
      task: fallbackTask
    };
  }
}

export async function eliminarTareaPorId(taskId, userId) {
  try {
    await deleteTask(taskId);
    removeLocalTask(taskId, userId);

    return {
      source: "server"
    };
  } catch (error) {
    removeLocalTask(taskId, userId);

    return {
      source: "local"
    };
  }
}

function getTaskStorageKey(userId) {
  return `transferencia-tareas-${userId}`;
}

export function loadTasksFromStorage(userId) {
  const raw = localStorage.getItem(getTaskStorageKey(userId));
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    console.warn("Error leyendo tareas desde localStorage", error);
    return [];
  }
}

export function saveTasksToStorage(userId, tasks) {
  localStorage.setItem(getTaskStorageKey(userId), JSON.stringify(tasks));
}

export function addOrUpdateLocalTask(task, userId) {
  const tasks = loadTasksFromStorage(userId);
  const index = tasks.findIndex((item) => String(item.id) === String(task.id));

  if (index === -1) {
    tasks.unshift(task);
  } else {
    tasks[index] = task;
  }

  saveTasksToStorage(userId, tasks);
}

export function removeLocalTask(taskId, userId) {
  const tasks = loadTasksFromStorage(userId).filter(
    (item) => String(item.id) !== String(taskId)
  );
  saveTasksToStorage(userId, tasks);
}

export function mergeServerAndLocalTasks(serverTasks, userId) {
  const localTasks = loadTasksFromStorage(userId);
  const merged = [...serverTasks];
  const seenIds = new Set(serverTasks.map((task) => String(task.id)));

  localTasks.forEach((task) => {
    if (!seenIds.has(String(task.id))) {
      merged.push(task);
    }
  });

  return merged;
}

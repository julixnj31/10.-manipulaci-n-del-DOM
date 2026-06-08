// La URL se arma con el host actual para soportar localhost y red local.
const API_HOST = window.location.hostname || "localhost";
const API_BASE_URL = `http://${API_HOST}:3000`;

// El backend actual de este repositorio publica la coleccion como "tareas".
const TASKS_RESOURCE = "tareas";
const TASKS_URL = `${API_BASE_URL}/${TASKS_RESOURCE}`;

async function requestTasks(path = "", options = {}) {
  const response = await fetch(`${TASKS_URL}${path}`, {
    headers: {
      "Content-Type": "application/json; charset=UTF-8"
    },
    ...options
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => response.statusText);
    throw new Error(errorText || "Error en la comunicacion con la API de tareas.");
  }

  if (response.status === 204) {
    return null;
  }

  return await response.json();
}

// Este modulo deja encapsulado todo el fetch relacionado con tareas.
export async function getTasksByUser(userId) {
  return await requestTasks(`?userId=${encodeURIComponent(String(userId))}`);
}

export async function createTask(task) {
  return await requestTasks("", {
    method: "POST",
    body: JSON.stringify(task)
  });
}

export async function updateTask(id, task) {
  return await requestTasks(`/${encodeURIComponent(String(id))}`, {
    method: "PATCH",
    body: JSON.stringify(task)
  });
}

export async function deleteTask(id) {
  await requestTasks(`/${encodeURIComponent(String(id))}`, {
    method: "DELETE"
  });
}

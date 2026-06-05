const API_HOST = window.location.hostname || "localhost";
const API_URL = `http://${API_HOST}:3000`;

async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json; charset=UTF-8"
    },
    ...options
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => response.statusText);
    throw new Error(errorText || "Error en la comunicación con la API");
  }

  if (response.status === 204) {
    return null;
  }

  return await response.json();
}

export async function buscarUsuarioPorDocumento(documento) {
  const users = await apiFetch("/users");

  return users.find(
    (user) =>
      String(user.documento).trim() === String(documento).trim()
  ) || null;
}

export async function obtenerTareasPorUsuario(userId) {
  return await apiFetch(`/tareas?userId=${encodeURIComponent(String(userId))}`);
}

export async function crearTarea(taskData) {
  return await apiFetch(`/tareas`, {
    method: "POST",
    body: JSON.stringify(taskData)
  });
}

export async function actualizarTarea(taskId, taskData) {
  return await apiFetch(`/tareas/${encodeURIComponent(String(taskId))}`, {
    method: "PATCH",
    body: JSON.stringify(taskData)
  });
}

export async function eliminarTarea(taskId) {
  await apiFetch(`/tareas/${encodeURIComponent(String(taskId))}`, {
    method: "DELETE"
  });
  return true;
}

export { API_URL };

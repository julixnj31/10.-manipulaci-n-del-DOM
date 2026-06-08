// Si el cliente se abre localmente usa localhost; si se sirve por IP usa esa misma IP.
const API_HOST = window.location.hostname || "localhost";
const USERS_URL = `http://${API_HOST}:3000/users`;

async function requestUsers(options = {}) {
  const response = await fetch(USERS_URL, {
    headers: {
      "Content-Type": "application/json; charset=UTF-8"
    },
    ...options
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => response.statusText);
    throw new Error(errorText || "Error en la comunicacion con la API de usuarios.");
  }

  return await response.json();
}

// Este modulo solo se encarga de hablar con el endpoint de usuarios.
export async function getUsers() {
  return await requestUsers();
}

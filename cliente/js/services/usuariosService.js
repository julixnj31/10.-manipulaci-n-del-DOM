import { getUsers } from "../api/usuariosApi.js";

// Este servicio aplica la regla de negocio de buscar usuarios por documento.
export async function buscarUsuarioPorDocumento(documento) {
  const users = await getUsers();

  return (
    users.find(
      (user) => String(user.documento).trim() === String(documento).trim()
    ) || null
  );
}

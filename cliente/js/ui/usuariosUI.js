export const usuariosDOM = {
  searchForm: document.querySelector("#search-form"),
  searchButton: document.querySelector("#search-button"),
  documentInput: document.querySelector("#documento"),
  searchFeedback: document.querySelector("#search-feedback"),
  userPanel: document.querySelector("#user-panel"),
  userDocument: document.querySelector("#user-document"),
  userName: document.querySelector("#user-name"),
  userEmail: document.querySelector("#user-email"),
  userId: document.querySelector("#user-id")
};

// Este modulo solo renderiza y limpia la informacion visual del usuario.
export function renderUser(user) {
  usuariosDOM.userDocument.textContent = user.documento;
  usuariosDOM.userName.textContent = user.name;
  usuariosDOM.userEmail.textContent = user.email;
  usuariosDOM.userId.textContent = user.id;
  usuariosDOM.userPanel.classList.remove("hidden");
}

export function clearUserPanel() {
  usuariosDOM.userDocument.textContent = "-";
  usuariosDOM.userName.textContent = "-";
  usuariosDOM.userEmail.textContent = "-";
  usuariosDOM.userId.textContent = "-";
  usuariosDOM.userPanel.classList.add("hidden");
}

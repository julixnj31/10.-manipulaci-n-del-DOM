const DOM = {
  searchForm: document.querySelector("#search-form"),
  searchButton: document.querySelector("#search-button"),
  documentInput: document.querySelector("#documento"),
  searchFeedback: document.querySelector("#search-feedback"),
  userPanel: document.querySelector("#user-panel"),
  userDocument: document.querySelector("#user-document"),
  userName: document.querySelector("#user-name"),
  userEmail: document.querySelector("#user-email"),
  userId: document.querySelector("#user-id"),
  taskForm: document.querySelector("#task-form"),
  taskButton: document.querySelector("#task-button"),
  cancelEditButton: document.querySelector("#cancel-edit-button"),
  taskTitle: document.querySelector("#task-title"),
  taskDescription: document.querySelector("#task-description"),
  taskStatus: document.querySelector("#task-status"),
  taskFeedback: document.querySelector("#task-feedback"),
  taskCount: document.querySelector("#task-count"),
  emptyState: document.querySelector("#empty-state"),
  tableWrapper: document.querySelector("#table-wrapper"),
  tasksBody: document.querySelector("#tasks-body")
};

export function showFeedback(element, message, type) {
  element.textContent = message;
  element.className = `feedback ${type}`;
  element.classList.remove("hidden");
}

export function hideFeedback(element) {
  element.textContent = "";
  element.className = "feedback hidden";
}

export function renderUser(user) {
  DOM.userDocument.textContent = user.documento;
  DOM.userName.textContent = user.name;
  DOM.userEmail.textContent = user.email;
  DOM.userId.textContent = user.id;
  DOM.userPanel.classList.remove("hidden");
}

export function clearUserPanel() {
  DOM.userDocument.textContent = "-";
  DOM.userName.textContent = "-";
  DOM.userEmail.textContent = "-";
  DOM.userId.textContent = "-";
  DOM.userPanel.classList.add("hidden");
}

export function toggleTaskForm(enabled) {
  const controls = DOM.taskForm.querySelectorAll("input, textarea, select, button");
  controls.forEach((control) => {
    control.disabled = !enabled;
  });
  DOM.taskForm.setAttribute("aria-disabled", String(!enabled));

  if (!enabled) {
    resetTaskForm();
  }
}

export function setTaskFormMode(isEditing) {
  DOM.taskButton.textContent = isEditing ? "Actualizar tarea" : "Guardar tarea";
  DOM.cancelEditButton.classList.toggle("hidden", !isEditing);
}

export function fillTaskForm(task) {
  DOM.taskTitle.value = task.title;
  DOM.taskDescription.value = task.description;
  DOM.taskStatus.value = task.status;
  setTaskFormMode(true);
}

export function resetTaskForm() {
  DOM.taskForm.reset();
  setTaskFormMode(false);
}

function createCell(content) {
  const cell = document.createElement("td");
  cell.textContent = content;
  return cell;
}

function createStatusPill(status) {
  const pill = document.createElement("span");
  const statusClass = status.toLowerCase().replace(/\s+/g, "-");

  pill.textContent = status;
  pill.className = `status-pill ${statusClass}`;
  return pill;
}

function createTaskRow(task, handlers) {
  const row = document.createElement("tr");

  const statusCell = document.createElement("td");
  statusCell.appendChild(createStatusPill(task.status));

  const actionsCell = document.createElement("td");
  const actionsWrapper = document.createElement("div");
  actionsWrapper.className = "action-buttons";

  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.textContent = "Editar";
  editButton.className = "action-button edit-button";
  editButton.addEventListener("click", () => handlers.onEdit(task));

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.textContent = "Eliminar";
  deleteButton.className = "action-button delete-button";
  deleteButton.addEventListener("click", () => handlers.onDelete(task.id));

  actionsWrapper.append(editButton, deleteButton);
  actionsCell.appendChild(actionsWrapper);

  row.append(
    createCell(String(task.id)),
    createCell(task.title),
    createCell(task.description),
    statusCell,
    createCell(task.userName),
    actionsCell
  );

  return row;
}

export function updateTaskCount(totalTasks) {
  const label = totalTasks === 1 ? "tarea" : "tareas";
  DOM.taskCount.textContent = `${totalTasks} ${label}`;
}

export function showEmptyState(message) {
  DOM.emptyState.textContent = message;
  DOM.emptyState.classList.remove("hidden");
  DOM.tableWrapper.classList.add("hidden");
}

export function hideEmptyState() {
  DOM.emptyState.classList.add("hidden");
  DOM.tableWrapper.classList.remove("hidden");
}

export function renderTasks(tasks, handlers) {
  DOM.tasksBody.replaceChildren();
  const sortedTasks = [...tasks].sort((a, b) => Number(b.id) - Number(a.id));
  updateTaskCount(sortedTasks.length);

  if (sortedTasks.length === 0) {
    showEmptyState("Este usuario aun no tiene tareas registradas.");
    return;
  }

  sortedTasks.forEach((task) => {
    DOM.tasksBody.appendChild(createTaskRow(task, handlers));
  });
  hideEmptyState();
}

export { DOM };

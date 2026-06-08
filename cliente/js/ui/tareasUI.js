export const tareasDOM = {
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

export function toggleTaskForm(enabled) {
  const controls = tareasDOM.taskForm.querySelectorAll(
    "input, textarea, select, button"
  );

  controls.forEach((control) => {
    control.disabled = !enabled;
  });

  tareasDOM.taskForm.setAttribute("aria-disabled", String(!enabled));

  if (!enabled) {
    resetTaskForm();
  }
}

function setTaskFormMode(isEditing) {
  tareasDOM.taskButton.textContent = isEditing
    ? "Actualizar tarea"
    : "Guardar tarea";

  tareasDOM.cancelEditButton.classList.toggle("hidden", !isEditing);
}

export function fillTaskForm(task) {
  tareasDOM.taskTitle.value = task.title;
  tareasDOM.taskDescription.value = task.description;
  tareasDOM.taskStatus.value = task.status;
  setTaskFormMode(true);
}

export function resetTaskForm() {
  tareasDOM.taskForm.reset();
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
  const actionsCell = document.createElement("td");
  const actionsWrapper = document.createElement("div");
  const editButton = document.createElement("button");
  const deleteButton = document.createElement("button");

  statusCell.appendChild(createStatusPill(task.status));

  actionsWrapper.className = "action-buttons";

  editButton.type = "button";
  editButton.textContent = "Editar";
  editButton.className = "action-button edit-button";
  editButton.addEventListener("click", () => handlers.onEdit(task));

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
  tareasDOM.taskCount.textContent = `${totalTasks} ${label}`;
}

export function showEmptyState(message) {
  tareasDOM.emptyState.textContent = message;
  tareasDOM.emptyState.classList.remove("hidden");
  tareasDOM.tableWrapper.classList.add("hidden");
}

function hideEmptyState() {
  tareasDOM.emptyState.classList.add("hidden");
  tareasDOM.tableWrapper.classList.remove("hidden");
}

// Este modulo concentra toda la manipulacion del DOM relacionada con tareas.
export function renderTasks(tasks, handlers) {
  tareasDOM.tasksBody.replaceChildren();

  const sortedTasks = [...tasks].sort((firstTask, secondTask) => {
    return Number(secondTask.id) - Number(firstTask.id);
  });

  updateTaskCount(sortedTasks.length);

  if (sortedTasks.length === 0) {
    showEmptyState("Este usuario aun no tiene tareas registradas.");
    return;
  }

  sortedTasks.forEach((task) => {
    tareasDOM.tasksBody.appendChild(createTaskRow(task, handlers));
  });

  hideEmptyState();
}

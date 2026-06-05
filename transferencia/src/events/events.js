import { DOM } from "../ui/ui.js";

export function bindAppEvents({ onSearchSubmit, onTaskSubmit, onCancelEdit }) {
  DOM.searchForm.addEventListener("submit", onSearchSubmit);
  DOM.taskForm.addEventListener("submit", onTaskSubmit);
  DOM.cancelEditButton.addEventListener("click", onCancelEdit);
}

// Este modulo evita repetir la misma logica de mensajes en toda la app.
export function showFeedback(element, message, type) {
  element.textContent = message;
  element.className = `feedback ${type}`;
  element.classList.remove("hidden");
}

export function hideFeedback(element) {
  element.textContent = "";
  element.className = "feedback hidden";
}

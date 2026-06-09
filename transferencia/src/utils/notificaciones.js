/**
 * Módulo de notificaciones
 * Sistema centralizado para mostrar mensajes de información, éxito y error
 * Independiente y reutilizable en toda la aplicación
 */

export function showFeedback(element, message, type) {
  element.textContent = message;
  element.className = `feedback ${type}`;
  element.classList.remove("hidden");
}

export function hideFeedback(element) {
  element.textContent = "";
  element.className = "feedback hidden";
}

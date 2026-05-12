/**
 * Implementar la función createMessageElement() para crear
 * mensajes dinámicamente dentro del contenedor de mensajes.
 * 
 * Se utiliza document.createElement() para crear el elemento,
 * innerHTML para agregar la estructura HTML del mensaje
 * y appendChild() para insertarlo en el contenedor.
 * 
 * Retorna: agregar un nuevo mensaje al contenedor.
 */

function createMessageElement(userName, message) {

    // Crear el contenedor principal del mensaje
    const messageCard = document.createElement("div");

    // Agregar clase CSS
    messageCard.classList.add("message-card");

    // Crear estructura HTML del mensaje
    messageCard.innerHTML = `
        <div class="message-card__header">
            <div class="message-card__user">
                <div class="message-card__avatar">
                    ${getInitials(userName)}
                </div>
                <span class="message-card__username">
                    ${userName}
                </span>
            </div>

            <span class="message-card__timestamp">
                ${getCurrentTimestamp()}
            </span>
        </div>

        <div class="message-card__content">
            ${message}
        </div>
    `;

    // Insertar el mensaje en el contenedor
    messagesContainer.appendChild(messageCard);

    // Incrementar contador de mensajes
    totalMessages++;

    // Actualizar contador visual
    updateMessageCount();

    // Ocultar mensaje de estado vacío
    hideEmptyState();
}
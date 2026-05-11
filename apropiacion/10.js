/**
 * Implementar la función handleFormSubmit() para manejar
 * el envío del formulario sin recargar la página.
 * 
 * Se utiliza event.preventDefault() para evitar
 * la recarga automática del formulario.
 * 
 * La función valida los datos, obtiene los valores
 * de los campos, crea un nuevo mensaje y limpia el formulario.
 * 
 * Retorna: crear un nuevo mensaje dinámicamente.
 */

function handleFormSubmit(event) {

    // Evitar recargar la página
    event.preventDefault();

    // Validar formulario
    if (!validateForm()) {
        return;
    }

    // Obtener valores de los campos
    const userName = userNameInput.value;
    const userMessage = userMessageInput.value;

    // Crear nuevo mensaje
    createMessageElement(userName, userMessage);

    // Limpiar formulario
    messageForm.reset();

    // Limpiar errores
    clearError(userNameError);
    clearError(userMessageError);

    // Enfocar nuevamente el input de nombre
    userNameInput.focus();
}
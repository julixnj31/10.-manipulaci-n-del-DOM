export function cleanValue(value) {
  return String(value ?? "").trim();
}

// Este modulo centraliza las validaciones simples del formulario.
export function validateSearchForm(documento) {
  const value = cleanValue(documento);

  if (value === "") {
    return {
      valid: false,
      message: "Debes escribir un documento para realizar la busqueda.",
      type: "error",
      value: null
    };
  }

  return {
    valid: true,
    type: "success",
    value
  };
}

export function validateTaskForm(formData) {
  const title = cleanValue(formData.title);
  const description = cleanValue(formData.description);
  const status = cleanValue(formData.status);

  if (title === "" || description === "" || status === "") {
    return {
      valid: false,
      message: "Todos los campos de la tarea son obligatorios.",
      type: "error",
      data: null
    };
  }

  return {
    valid: true,
    type: "success",
    data: {
      title,
      description,
      status
    }
  };
}

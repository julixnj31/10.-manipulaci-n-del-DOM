export function cleanValue(value) {
  return String(value ?? "").trim();
}

export function validateSearchForm(documento) {
  const value = cleanValue(documento);
  if (value === "") {
    return {
      valid: false,
      message: "Debes escribir un documento para realizar la búsqueda.",
      value: null,
      type: "error"
    };
  }

  return {
    valid: true,
    value,
    type: "success"
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
      data: null,
      type: "error"
    };
  }

  return {
    valid: true,
    data: { title, description, status },
    type: "success"
  };
}

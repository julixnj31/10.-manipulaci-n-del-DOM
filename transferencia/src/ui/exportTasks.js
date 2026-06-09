/**
 * Módulo de exportación de tareas
 * Encargado de exportar tareas a JSON de forma independiente
 * Reutilizable desde cualquier componente
 */

export function exportTasksToJSON(tasks, fileName = "tareas.json") {
  if (!tasks || tasks.length === 0) {
    console.warn("No hay tareas para exportar");
    return;
  }

  const dataStr = JSON.stringify(tasks, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

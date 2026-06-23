// Este módulo expone una función que permite descargar una lista de tareas
// en formato JSON como un archivo desde el navegador.
export function exportTasksAsJson(tasks, filename = "tareas.json") {
    // Convierte el arreglo de tareas a una cadena JSON con sangría para que sea
    // legible si alguien abre el archivo manualmente.
    const jsonString = JSON.stringify(tasks, null, 2);

    // Crea un objeto Blob que contiene los datos JSON. El Blob actúa como un
    // archivo virtual en memoria que el navegador puede descargar.
    const blob = new Blob([jsonString], { type: "application/json" });

    // Genera una URL temporal que apunta al Blob creado.
    const url = URL.createObjectURL(blob);

    // Crea un elemento <a> dinámicamente para simular la acción de descarga.
    const anchor = document.createElement("a");

    // Asigna la URL del Blob al enlace.
    anchor.href = url;

    // Establece el nombre sugerido del archivo descargado.
    anchor.download = filename;

    // Dispara el clic en el enlace para iniciar la descarga sin necesidad de
    // mostrar nada al usuario.
    anchor.click();

    // Libera la URL temporal creada para evitar fugas de memoria.
    URL.revokeObjectURL(url);
}

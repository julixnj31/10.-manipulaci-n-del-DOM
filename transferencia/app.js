// Punto 1: Búsqueda del usuario
// Aquí hago lo de buscar al usuario. Cuando mandan el form, no recargo la página y voy a la API a ver si existe.
// Si sí, muestro sus datos; si no, pongo un mensaje que no lo encontré.
// Uso las funciones buscarUsuario, mostrarUsuario y mostrarUsuarioNoEncontrado.

// Variables que uso en todo el código
let currentUserId = null;

// Agarro los elementos del HTML que voy a usar
const formUsuario = document.getElementById('form-usuario');
const userIdInput = document.getElementById('user-id');
const usuarioInfo = document.getElementById('usuario-info');
const usuarioNoEncontrado = document.getElementById('usuario-no-encontrado');
const registroTareas = document.getElementById('registro-tareas');
const formTarea = document.getElementById('form-tarea');
const taskTitle = document.getElementById('task-title');
const taskDescription = document.getElementById('task-description');
const taskStatus = document.getElementById('task-status');
const tasksTableBody = document.querySelector('#tasks-table tbody');

// Esta función busca al usuario en la API usando fetch
async function buscarUsuario(id) {
    try {
        const response = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`);
        if (response.ok) {
            const user = await response.json();
            mostrarUsuario(user);
        } else {
            mostrarUsuarioNoEncontrado();
        }
    } catch (error) {
        console.error('Error al buscar usuario:', error);
        mostrarUsuarioNoEncontrado();
    }
}

// Esta función muestra la info del usuario que encontré
function mostrarUsuario(user) {
    document.getElementById('user-id-display').textContent = user.id;
    document.getElementById('user-name').textContent = user.name;
    document.getElementById('user-email').textContent = user.email;
    document.getElementById('user-phone').textContent = user.phone;

    usuarioInfo.style.display = 'block';
    usuarioNoEncontrado.style.display = 'none';
    registroTareas.style.display = 'block';
    currentUserId = user.id;
}

// Esta función muestra el mensaje cuando no encuentro al usuario
function mostrarUsuarioNoEncontrado() {
    usuarioInfo.style.display = 'none';
    usuarioNoEncontrado.style.display = 'block';
    registroTareas.style.display = 'none';
    currentUserId = null;
}

// Punto 2: Registro de tareas
// Aquí hago lo de registrar tareas. Solo se puede si encontré al usuario antes.
// Chequeo que todos los campos estén llenos, mando la info a la API sin recargar, y la ligo al usuario.
// Uso registrarTarea, validarFormularioTarea y el listener del form.

// Esta función manda la tarea a la API
async function registrarTarea(tarea) {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: currentUserId,
                title: tarea.title,
                body: tarea.description,
                status: tarea.status
            })
        });
        
        if (response.ok) {
            const nuevaTarea = await response.json();
            nuevaTarea.status = tarea.status;
            agregarTareaATabla(nuevaTarea);
        } else {
            alert('Error al registrar la tarea');
        }
    } catch (error) {
        console.error('Error al registrar tarea:', error);
        alert('Error al registrar la tarea');
    }
}

// Esta función valida que los campos no estén vacíos
function validarFormularioTarea() {
    let valido = true;

    if (taskTitle.value.trim() === '') {
        taskTitle.classList.add('error');
        valido = false;
    } else {
        taskTitle.classList.remove('error');
    }

    if (taskDescription.value.trim() === '') {
        taskDescription.classList.add('error');
        valido = false;
    } else {
        taskDescription.classList.remove('error');
    }

    if (taskStatus.value === '') {
        taskStatus.classList.add('error');
        valido = false;
    } else {
        taskStatus.classList.remove('error');
    }

    return valido;
}

// Punto 3: Manipulación del DOM
// Aquí hago lo de cambiar la página sin recargar. Creo filas nuevas para la tabla cuando agrego tareas.
// Uso agregarTareaATabla para meter las tareas en la tabla.

// Esta función agrega una fila nueva a la tabla con la tarea
function agregarTareaATabla(tarea) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${tarea.id}</td>
        <td>${tarea.title}</td>
        <td>${tarea.body}</td>
        <td>${tarea.status}</td>
    `;
    tasksTableBody.appendChild(row);
}

// Aquí escucho cuando mandan el form de usuario
formUsuario.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = parseInt(userIdInput.value);
    if (id > 0) {
        buscarUsuario(id);
    } else {
        alert('Por favor ingrese un ID válido');
    }
});

// Aquí escucho cuando mandan el form de tarea
formTarea.addEventListener('submit', (e) => {
    e.preventDefault();
    if (currentUserId && validarFormularioTarea()) {
        const tarea = {
            title: taskTitle.value.trim(),
            description: taskDescription.value.trim(),
            status: taskStatus.value
        };
        registrarTarea(tarea);
        // Borro el form después de mandar
        formTarea.reset();
    } else {
        alert('Por favor complete todos los campos');
    }
});
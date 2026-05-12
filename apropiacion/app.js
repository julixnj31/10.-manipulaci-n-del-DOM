console.log(document)

const formulario = document.querySelector("#formulario")
const nombre = document.querySelector("#nombre")
const lista = document.querySelector("#lista")
const habilidad = document.querySelectorAll('input[type="checkbox"]')
const habilidades = document.querySelector("#habilidades")
console.log(formulario)

function Crearelemento() {
  const parrafo = document.createElement("p")
  parrafo.textContent = nombre.value
  lista.append(parrafo)
}

function guardar(nombre) {
  fetch('http://localhost:3000/users', {
    method: 'POST',
    body: JSON.stringify({
    nombre
    }),
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
    },
  })
    .then((response) => response.json())
    .then((json) => console.log(json));
}

formulario.addEventListener("submit", (e) => {
  e.preventDefault()
  let brian = true
  console.log(habilidad)
  if (nombre.value == "") {
    alert("Por Favor Ingrese El Nombre")
    nombre.classList.add ("error")
    brian = false
  }
  
  let total = 0
  for (let i = 0; i < habilidad.length; i++) {
    const element = habilidad[i];
    //console.log(element)
    if (element.checked) {
      total++;
    }
    
  }
  console.log(total)
  if (total < 2) {
  alert("Porfavor ingrese otra habilidad")
  brian = false
  }
  if (brian)
  guardar(nombre.value)
}) 

console.log(habilidad.length)
document.addEventListener("DOMContentLoaded", async() => {
  let solicitud = await fetch('http://localhost:3000/habilidades')
  let datos = await solicitud.json()
  console.log(datos)
  for (let i = 0; i < datos.length; i++) {
    const element = datos[i];
    console.log(element)
    const div = document.createElement("div");
    const label = document.createElement("label");
    const input = document.createElement("input");
    label.textContent = element.nombre
    input.type = "checkbox"
    div.append(label, input)
    habilidades.append(div)
  }
})

//  11
// LIMPIAR ERRORES AL ESCRIBIR

function handleInputChange() {

  clearError();

}


// JavaScript (Lógica)


let filas = 20
let columnas = 20
let lado = 30
let tiempo = 100
let intervalo 

let marcas = 0

let minas = filas * columnas * 0.1

let tablero = []

let enJuego = true
let juegoIniciado = false


nuevoJuego()

function nuevoJuego() {
  reiniciarVariables()
  generarTableroHTML() // Genera la estructura visual de la matriz
  generarTableroJuego() // Se encarga de generar las minas y los números para que sean descubiertos
  añadirEventos() // Se añaden los eventos de mouse para las celdas
  refrescarTablero() // Se encarga del comportamiento lógico para mostrar los elementos
}

async function ajustes() {
  const {
    value: ajustes
  } = await swal.fire({
    title: "Ajustes",
    html: `
        Dificultad &nbsp; (minas/área)
        <br>
        <br>
        <input onchange="cambiarValor()" oninput="this.onchange()" id="dificultad" type="range" min="10" max="40" step="1" value="${100 * minas / (filas * columnas)}" onchange="">
        <span id="valor-dificultad">${100 * minas / (filas * columnas)}%</span>
        <br>
        <br>
        Filas
        <br>
        <input class="swal2-input" type="number" value=${filas} placeholder="filas" id="filas" min="10" max="1000" step="1">
        <br>
        Columnas
        <br>
        <input class="swal2-input" type="number" value=${columnas} placeholder="columnas" id="columnas" min="10" max="1000" step="1">
        <br>
        <br>
        Tiempo(seg)
        <br>
        <input class="swal2-input" type="number" value=${tiempo} placeholder="tiempo" id="tiempo" min="10" max="1000" step="1">
        <br>
    `,
    confirmButtonText: "Establecer",
    cancelButtonText: "Cancelar",
    showCancelButton: true,
    preConfirm: () => {
      return {
        columnas: document.getElementById("columnas").value,
        filas: document.getElementById("filas").value,
        dificultad: document.getElementById("dificultad").value,
        tiempo: document.getElementById("tiempo").value
      }
    }
  })
  if (!ajustes) {
    return
  }
  filas = Math.floor(ajustes.filas)
  columnas = Math.floor(ajustes.columnas)
  minas = Math.floor(columnas * filas * ajustes.dificultad / 100)
  tiempo = Math.floor(ajustes.tiempo)
  nuevoJuego()
}

function reiniciarVariables() {
  marcas = 0
  enJuego = true
  juegoIniciado = false
}

function generarTableroHTML() {
  let html = ""
  for (let f = 0; f < filas; f++) {
    html += `<tr>`
    for (let c = 0; c < columnas; c++) {
      html += `<td id="celda-${c}-${f}" style="width:${lado}px;height:${lado}px">`
      html += `</td>`
    }
    html += `</tr>`
  }
  let tableroHTML = document.getElementById("tablero")
  tableroHTML.innerHTML = html
  tableroHTML.style.width = columnas * lado + "px"
  tableroHTML.style.height = filas * lado + "px"
  tableroHTML.style.background = "slategray"
}

function añadirEventos() {
  for (let f = 0; f < filas; f++) {
    for (let c = 0; c < columnas; c++) {
      let celda = document.getElementById(`celda-${c}-${f}`)
      celda.addEventListener("dblclick", function(me) {
        dobleClic(celda, c, f, me)
      })
      celda.addEventListener("mouseup", function(me) {
        clicSimple(celda, c, f, me)
      })
    }
  }
}

function dobleClic(celda, c, f, me) {
  if (!enJuego) {
    return
  }
  abrirArea(c, f)
  refrescarTablero()
}

function clicSimple(celda, c, f, me) {
  if (!enJuego) {
    return // El juego ha finalizado
  }
  if (tablero[c][f].estado == "descubierto") {
    return // Las celdas descubiertas no pueden ser redescubiertas o marcadas
  }
  switch (me.button) {
    case 0: // 0 es el código para el clic izquierdo
      if (tablero[c][f].estado == "marcado") {
        break
      }
      while (!juegoIniciado && tablero[c][f].valor == -1) {
        generarTableroJuego()
      }
      tablero[c][f].estado = "descubierto"
      juegoIniciado = true
      if (tablero[c][f].valor == 0) {
        abrirArea(c, f)
      }
      break
    case 1: // 1 es el código para el clic medio o scroll
      break
    case 2: // 2 es el código para el clic derecho
      if (tablero[c][f].estado == "marcado") {
        tablero[c][f].estado = undefined
        marcas--
      } else {
        tablero[c][f].estado = "marcado"
        marcas++
      }
      break
    default:
      break
  }
  refrescarTablero()
}

function abrirArea(c, f) {
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (i == 0 && j == 0) {
        continue
      }
      try {
        if (tablero[c + i][f + j].estado != "descubierto") {
          if (tablero[c + i][f + j].estado != "marcado") {
            tablero[c + i][f + j].estado = "descubierto"
            if (tablero[c + i][f + j].valor == 0) {
              abrirArea(c + i, f + j)
            }
          }
        }
      } catch (e) {}
    }
  }
}

function refrescarTablero() {
  for (let f = 0; f < filas; f++) {
    for (let c = 0; c < columnas; c++) {
      let celda = document.getElementById(`celda-${c}-${f}`)
      if (tablero[c][f].estado == "descubierto") {
        celda.style.boxShadow = "none"
        switch (tablero[c][f].valor) {
          case -1:
            celda.innerHTML = `<i class="fas fa-bomb"></i>`
            celda.style.color = "black"
            celda.style.background = "white"
            break
          case 0:
            break
          default:
            celda.innerHTML = tablero[c][f].valor
            break
        }
      }
      if (tablero[c][f].estado == "marcado") {
        celda.innerHTML = `<i class="fas fa-flag"></i>`
        celda.style.background = `cadetblue`
      }
      if (tablero[c][f].estado == undefined) {
        celda.innerHTML = ``
        celda.style.background = ``
      }
    }
  }
  verificarGanador()
  verificarPerdedor()
  actualizarPanelMinas()
}

function actualizarPanelMinas() {
  let panel = document.getElementById("minas")
  panel.innerHTML = minas - marcas
}

function verificarGanador() {
  for (let f = 0; f < filas; f++) {
    for (let c = 0; c < columnas; c++) {
      if (tablero[c][f].estado != `descubierto`) {
        if (tablero[c][f].valor == -1) {
          continue
        } else {
          return
        }
      }
    }
  }
  let tableroHTML = document.getElementById("tablero")
  tableroHTML.style.background = "green"
  enJuego = false
}

function verificarPerdedor() {
  for (let f = 0; f < filas; f++) {
    for (let c = 0; c < columnas; c++) {
      if (tablero[c][f].valor == -1 && tablero[c][f].estado == `descubierto`) {
        let tableroHTML = document.getElementById("tablero")
        tableroHTML.style.background = "red"
        enJuego = false
      }
    }
  }
  if (enJuego) {
    return
  }
  for (let f = 0; f < filas; f++) {
    for (let c = 0; c < columnas; c++) {
      if (tablero[c][f].valor == -1) {
        let celda = document.getElementById(`celda-${c}-${f}`)
        celda.innerHTML = `<i class="fas fa-bomb"></i>`
        celda.style.color = "black"
      }
    }
  }
}

function generarTableroJuego() {
  vaciarTablero()
  ponerMinas()
  contadoresMinas()
}

function vaciarTablero() {
  tablero = []
  for (let c = 0; c < columnas; c++) {
    tablero.push([])
  }
}

function ponerMinas() {
  for (let i = 0; i < minas; i++) {
    let c
    let f

    do {
      c = Math.floor(Math.random() * columnas)
      f = Math.floor(Math.random() * filas)
    } while (tablero[c][f])

    tablero[c][f] = {
      valor: -1
    }
  }
}

function contadoresMinas() {
  for (let f = 0; f < filas; f++) {
    for (let c = 0; c < columnas; c++) {
      if (!tablero[c][f]) {
        let contador = 0
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            if (i == 0 && j == 0) {
              continue
            }
            try {
              if (tablero[c + i][f + j].valor == -1) {
                contador++
              }
            } catch (e) {}
          }
        }
        tablero[c][f] = {
          valor: contador
        }
      }
    }
  }
}

function IniciarContador() {
    // Establece el tiempo inicial para el contador (en segundos)
    let tiempoRestante = tiempo;
    
    // Obtén el elemento de HTML donde se mostrará el contador
    const contadorElemento = document.getElementById('contador1');
    
    // Función que se llama cada segundo
     intervalo = setInterval(() => {
        // Actualiza el tiempo restante en el elemento de HTML
        contadorElemento.textContent = tiempoRestante;
        
        // Si el tiempo llega a cero, detén el intervalo, finaliza el juego y muestra un mensaje
        if (tiempoRestante <= 0) {
            clearInterval(intervalo);
            // Termina el juego y muestra el mensaje
            enJuego = false;
            document.getElementById("tablero").style.background = "red";
            alert("Se te ha acabado el tiempo");

        } else {
            // Resta un segundo al tiempo restante
            tiempoRestante--;
        }
    }, 1000); // Ejecuta la función cada segundo
}

  function Inicio() {
    clearInterval(intervalo);
    IniciarContador();
    nuevoJuego();
   
  }

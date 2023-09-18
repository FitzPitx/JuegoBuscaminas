let filas = 20;
let columnas = 20;
let lado = 30; // Tamaño de cada celda
let marcas = 0; // Cantidad de marcas que se han hecho

let minas = filas * columnas * 0.1; // 15% de minas en todo el tablero

let tablero = [];

let enJuego = true;
let juegoIniciado = false;

nuevoJuego();

function nuevoJuego(){
    reiniciarVariables();
    generarTableroHTML(); //Genera la estructura del tablero
    adicionarEventos(); //Adiciona los eventos a cada celda
    generarTablero(); //Genera el tablero con las minas y los numeros pistas
    refrescarTablero();    
}

async function ajustes() {
  const { value: ajustes } = await swal.fire({
    title: "Ajustes",
    html: `
              Dificultad &nbsp; (minas/área)
              <br>
              <br>
              <input onchange="cambiarValor()" oninput="this.onchange()" id="dificultad" type="range" min="10" max="40" step="1" value="${
                (100 * minas) / (filas * columnas)
              }" onchange="">
              <span id="valor-dificultad">${
                (100 * minas) / (filas * columnas)
              }%</span>
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
              `,
    confirmButtonText: "Establecer",
    cancelButtonText: "Cancelar",
    showCancelButton: true,
    preConfirm: () => {
      return {
        columnas: document.getElementById("columnas").value,
        filas: document.getElementById("filas").value,
        dificultad: document.getElementById("dificultad").value,
      };
    },
  });
  if (!ajustes) {
    return;
  }
  filas = Math.floor(ajustes.filas);
  columnas = Math.floor(ajustes.columnas);
  minas = Math.floor((columnas * filas * ajustes.dificultad) / 100);
  nuevoJuego();
}

function reiniciarVariables(){
    marcas = 0;
    enJuego = true;
    juegoIniciado = false;
}




function generarTableroHTML(){
    let html = '';
    for (let f = 0; f < filas; f++) {
        html += `<tr>`;
        for (let c = 0; c < columnas; c++) {
            /*
            Sistemas de coordenadas para el tablero
            Generacion de cada uno de los elementos de la matriz y se les asignara una coordenada,
            para poder tratar estos elementos de forma matematica
            id="celda-${c}-${f}"
            es la instrucción más importante, asigna una coordenada a cada elemento
            */
            html += `<td id="celda-${c}-${f}" style="width:${lado}px;height:${lado}px">`
            //html += `${c},${f}` referencia de la coordenada
            html += `</td>`
        }
        html += `</tr>`;
    }
    let tablero = document.getElementById('tablero');
    tablero.innerHTML = html;
    tablero.style.width = columnas*lado+"px";
    tablero.style.height = filas*lado+"px";
    tablero.style.backgroundColor = "slategray";
}

/*
    Una vez genrado el tablero HTML, se procede a asignarle los eventos
    a cada uno de los elementos del tablero para que se pueda interactuar con ellos
*/
function adicionarEventos(){
    for (let f = 0; f < filas; f++) {
        for (let c = 0; c < columnas; c++) {
            let celda = document.getElementById(`celda-${c}-${f}`);
            celda.addEventListener("dblclick", me=>{ //Evento de doble click
                dobleClick(celda,c,f,me);
            })
            celda.addEventListener("mouseup", me=>{
                clickSimple(celda,c,f,me);
            })
        }
    }
}

/*
    Esta funcion se encargara de mostrar las celdas que rodean a la celda que se ha seleccionado
*/
function dobleClick(celda,c,f,me){
    if(!enJuego){
        return;
    }
    descubrirArea(c,f);
    refrescarTablero();
}

/*
    Esta funcion se encargara de los comportamientos de click derecho y click izquierdo
    para descubrir las celdas, o marcarlas para protegerlas de ser descubiertas
*/
function clickSimple(celda,c,f,me){
    if(!enJuego){
        return; // el jeugo ha finalizado
    }
    if(tablero[c][f].estado == "descubierto"){
        return; // las celdas descubiertas no pueden ser redescubiertas o marcadas
    }
    switch (me.button) {
        case 0: // click izquierdo
            if(tablero[c][f].estado == "marcado"){
                break
            }

            while(!juegoIniciado && tablero[c][f].valor == -1){
                generarTablero(); // funcion para cuando el jugador oprima una mina en el primer click
            }
            tablero[c][f].estado = "descubierto";
            juegoIniciado = true;

            /*
            Si la celda seleccionada es un 0, entonces se descubriran todas las celdas que estan alrededor
            */

            if (tablero[c][f].valor == 0){
                descubrirArea(c,f);
            }
            break;
        case 1: // click central
        break;
        case 2: // click derecho
            if (tablero[c][f].estado == "marcado"){
                tablero[c][f].estado = undefined;
                marcas--;
            } else {
                tablero[c][f].estado = "marcado";
                marcas++;
            }
        break;
        default:
            break;
        }
        refrescarTablero();
}

function descubrirArea(c,f){
    /*
    // Hay que abrir los demas numeros que estan alrededor
    // Se debe verificar que no se salga de los limites del tablero
    */

    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++){
            if (i == 0 && j == 0){
                // esta condicion es obligatoria para que no se encierre en un bucle infinito
                continue;
            }
            try {
                if (tablero[c+i][f+j].estado != "descubierto"){
                    if (tablero [c+i][f+j].estado != "marcado"){
                        tablero [c+i][f+j].estado = "descubierto"; // Aqui se abren todas las celdas que estan alrededor
                        if (tablero[c+i][f+j].valor == 0){
                            descubrirArea(c+i,f+j);
                        }
                    }
                }
            }catch (error){

            }
        }
    }
}

/*
    Aqui nos encargamos del comportamiento visual segun el estado logico del tablero de juego
    */
function refrescarTablero(){
    for (let f = 0; f < filas; f++) {
        for (let c = 0; c < columnas; c++) {
            let celda = document.getElementById(`celda-${c}-${f}`);
            //celda.innerHTML = tablero[c][f].valor;
            if (tablero[c][f].estado == "descubierto"){
                celda.style.boxShadow = "inset 0px 0px 0px 1px #000000";
                switch (tablero[c][f].valor) {
                    case -1:
                        celda.innerHTML = "💣";
                        celda.style.color = "black";
                        celda.style.backgroundColor = "#ff0000";

                        break;
                    case 0:
                        break;
                        default:
                            celda.innerHTML = tablero[c][f].valor;
                            break;
                }
            }
            if (tablero[c][f].estado == "marcado"){
                celda.innerHTML = "🚩";
                celda.style.color = "black";
                celda.style.backgroundColor = "#ffff00";
            }
            if (tablero[c][f].estado == undefined){
                celda.innerHTML = "";
                celda.style.backgroundColor = "";
            }
        }
    }
    verificarVictoria();
    verificarDerrota();
    actualizarNumeroMinas();
}

function actualizarNumeroMinas(){
    let panel = document.getElementById("minas");
    panel.innerHTML = minas - marcas;
}

function verificarVictoria(){
    /*
    hay que verificar que todas las celdas que no son minas esten descubiertas
    */
    for (let f = 0; f < filas; f++) {
        for (let c = 0; c < columnas; c++){
             // Mina cubierta                           Mina descubierta
            if (tablero[c][f].estado != "descubierto" && tablero[c][f].valor != -1){
              continue;
            } else {
              // si hay una mina cubierta o descubierta, entonces el juego no ha terminado
              return;
            }
        }
    }

    let tableroHTML = document.getElementById("tablero");
    tableroHTML.style.backgroundColor = "green";
    enJuego = false;
}

function verificarDerrota(){
    for (let f = 0; f < filas; f++) {
        for (let c = 0; c < columnas; c++){
            //si hay una mina descubierta, entonces el juego ha terminado
            if (tablero[c][f].estado == "descubierto" && tablero[c][f].valor == -1){
                let tableroHTML = document.getElementById("tablero");
                tableroHTML.style.backgroundColor = "red";
                enJuego = false;
            }
        }
    }
    if (enJuego){
        return;
    }
    for (let f = 0; f < filas; f++) {
        for (let c = 0; c < columnas; c++){
            if (tablero[c][f].valor == -1){
                let celda = document.getElementById(`celda-${c}-${f}`);
                celda.innerHTML = "💣";
                
            }
        }
    }
}   

/*
 Este servira para dar un seguimiento logico de los elementos
 que el jugador no puede ver
*/



function generarTablero(){
    vaciarTablero();//Vaciar el tablero para que no se acumulen los datos
    ponerMinas();//Poner las minas numericamente con el numero -1
    contadoresMinas();//son los numeros que dan pistas de las minas
}

// Se encarga el tablero en un estado inicial para insertar elementos
function vaciarTablero(){
    tablero = [];
    for (let c = 0; c < columnas; c++) {
        tablero.push([]);
    }
}



function ponerMinas(){
    for (let i = 0; i < minas; i++) {
        let c;
        let f;
        do {
            c = Math.floor(Math.random()*columnas); // Genera una columna aleatoria
            f = Math.floor(Math.random()*filas); // Genera una fila aleatoria
        } while (tablero[c][f]); // se encarga de que no se repitan las minas
        tablero[c][f] = {valor : -1}; // Se encarga de poner las minas en la celda disponible 
    }
}

function contadoresMinas(){
    for (let f = 0; f < filas; f++) {
        for (let c = 0; c < columnas; c++) {
            if(!tablero[c][f]){
                let contador = 0;
                //Se van a recorrer todas las celdas que estan alrededor de la celda actual
                for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <=1; j++) {
                        if (i == 0 && j == 0){
                            continue;
                        }
                        try {
                            if (tablero[c+i][f+j].valor == -1){
                                contador++;
                            }
                        } catch (error) {

                        }
                    }
                }
                tablero[c][f] = {valor : contador};
            }
        }
    }
}

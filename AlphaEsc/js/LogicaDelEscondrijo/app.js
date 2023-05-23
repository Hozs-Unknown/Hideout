
let DB;
let editando = false;

//todo  Todo los selectores
const botonGuardar = document.querySelector("#botonG")
const botonEliminar = document.querySelector("#botonB")
const tituloSecreto = document.querySelector("#titulo-actual")
const contenidoActual = document.getElementById('contenido-actual')
const tituloActual = document.getElementById('titulo-actual')
const selectorContenido = document.querySelector('#contenido')
const header = document.querySelector('.textoGorra')

const secretosContenedores = document.querySelector('contenedarDeSecretos') //! Contenedor de los div de los secretos

window.onload = () => {
    eventListeners();

    baseDatos();

    ui.imprimirSecretos();
}


function eventListeners(){
    tituloActual.addEventListener('change', datosSecreto);
    contenidoActual.addEventListener('change', datosSecreto);
    botonGuardar.addEventListener('click', nuevoSecreto);
    // botonEliminar.addEventListener('click', eliminarSecreto({id}));
    header.addEventListener('click', () => {
        Swal.fire({
            title: 'Gracias por utilizar Hideout.',
            text: "Este es un proyecto que he creador para mejorar en mis habilidades de programación. Agradezco a mi familia: Mamá, Papá y Hermano, y mis amigos: Andrés Díaz y Luis Rodriguez, por apoyarme para seguir mejorando el proyecto Hideout. Y a Ronal Medina, le doy las gracias por adentrarme en el mundo de la programación. Espero seguir mejorando en este mundo de la programación. Creditos tambien a: https://www.flaticon.es/iconos-gratis/animales Animales iconos creados por Freepik y https://www.pexels.com/es-es/foto/cerrar-foto-de-bayas-1379636/ por las fotos proporcionadas para el proyecto.",
            width: 600,
            padding: '2em',
            color: '#000000',
            position: 'center-end',
            confirmButtonText: '¡Muchas Gracias!',
            backdrop: `
            rgba(19, 19, 19, 0.863)
            url("img/pwned-monster.gif")
            left top
            no-repeat
            `,
          })
    })
    
};

//clases


class Secretos {
    constructor(){
        this.secretos = [];
    }

    agregarSecreto(secreto) {
        this.secretos = [...this.secretos, secreto]
    }

    editarSecreto(secretoActualizado) {
        this.secretos = this.secretos.map( secreto => secreto.id === secretoActualizado.id ? secretoActualizado : secreto);
    }

    eliminarSecreto(id){
        this.secretos = this.secretos.filter( secreto => secreto.id !== id);
    }


    
}

class UI {
    imprimirSecretos() {

        this.limpiarHTML();
        
        //Leer el contenido de la base de datos
        const objectStore = DB.transaction('secretos').objectStore('secretos')
        
        objectStore.openCursor().onsuccess = function(e) {

            const cursor = e.target.result;

            if(cursor) {
                const { titulo, contenido, id } = cursor.value;
        
                const divSecreto = document.createElement('div');
                divSecreto.classList.add('secreto')
                divSecreto.dataset.id = id;
    
                // Scripting
                divSecreto.innerHTML += `
                <div class='secreto'>
                    <h2 class='secreto-titulo'>${titulo.substring(0, 25)}...</h2>
                    <span class='secreto-contenido'>${contenido.substring(0, 25)}...</span>
                    <span class="secreto-dato">Hideout</span>
                </div> 
                `
    
                divSecreto.oncontextmenu = () => eliminarSecreto(id)
                const secreto = cursor.value;
                divSecreto.onclick = () => cargarEdicion(secreto);
    
                contenedorDeSecretos.appendChild(divSecreto);

                // Ve al siguiente elemaneto

                cursor.continue();
            }
        }
    }

    limpiarHTML() {
        while(contenedorDeSecretos.firstChild) {
            contenedorDeSecretos.removeChild(contenedorDeSecretos.firstChild);
        }
    }
}

const ui = new UI();
const contenedorSecretos = new Secretos();

// objeto global

const secretoObj = {
    titulo: '',
    contenido: '',
}

function datosSecreto(e){
    secretoObj[e.target.name] = e.target.value;
}

function nuevoSecreto(e) {
    e.preventDefault();

    const { titulo, contenido } = secretoObj;

    if(titulo === "" || contenido === '') {
        console.log('He, No vas ha escribir algo?')

        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 4000,
            timerProgressBar: true,
            didOpen: (toast) => {
              toast.addEventListener('mouseenter', Swal.stopTimer)
              toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
            
          })
          
          Toast.fire({
            icon: 'error',
            title: '¡No cambia nada!',
            text: "El zorro no puede guardar tu secreto, si no tienes secretos que guardar.",
          })

        return;
    }

    if (editando){ // Esta editando

        contenedorSecretos.editarSecreto({...secretoObj});

        //Edita en IndexDB
        const transaction = DB.transaction(['secretos'], 'readwrite');
        const objectStore = transaction.objectStore('secretos');

        objectStore.put(secretoObj);

        transaction.oncomplete = () => {
             reiniciarObjeto() 
        tituloActual.value = ('')
        contenidoActual.value = ('')
        ui.imprimirSecretos(contenedorSecretos)
        editando = false;

        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
              toast.addEventListener('mouseenter', Swal.stopTimer)
              toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
          })
          
          Toast.fire({
            icon: 'success',
            title: 'Directo de nuevo al escondrijo',
            text: "El zorro guardado editado corectamente tu secreto.",
          })

        }

        transaction.onerror = () =>{
            console.log('algo salio mal')
        }

       
    }else {

    console.log("Modo secreto creado")
    // gernerar ID unico
    secretoObj.id = Date.now();

    contenedorSecretos.agregarSecreto
    ({...secretoObj});


    const transaction = DB.transaction(['secretos'], 'readwrite');
    
    const objectStore = transaction.objectStore('secretos');
    const peticion = objectStore.add(secretoObj);

    transaction.oncomplete = function (){

        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
              toast.addEventListener('mouseenter', Swal.stopTimer)
              toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
          })
          
          Toast.fire({
            icon: 'success',
            title: 'Directo al escondrijo',
            text: "El zorro guardó corectamente tu secreto.",
          })
        

        reiniciarObjeto()

        // Mostrar los secretos en el html

        ui.imprimirSecretos();


        tituloActual.value = ('')
        contenidoActual.value = ('')
        console.log('Agregado exitosamente')
    }

    transaction.onerror = () => {
        console.log('Hubo un error!');
    }

}
    }


function reiniciarObjeto(){
    secretoObj.titulo = ''
    secretoObj.contenido = ''
}

function eliminarSecreto(id){

    Swal.fire({
        title: '¿Deseas eliminar tu secreto?',
        text: "Se eliminara tu secreto junto con su contenido",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: '¡Si, eliminalo!'
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire(
            '¡Eliminado!',
            'Tu secreto ha sido eliminado.',
            'success'
          )

        
        const transaction = DB.transaction(['secretos'], 'readwrite')
        const objectStore = transaction.objectStore('secretos');

        objectStore.delete(id);
        
        // recarga los secretos
        ui.imprimirSecretos();
            

        transaction.oncomplete = () =>{
            ui.imprimirSecretos();
        }

        transaction.onerror = () => {
            console.log('hubo un error');
        }
        }
      })
    
}

function cargarEdicion(secreto) {
    const {titulo, contenido, id } = secreto;
    console.log('modo edicion')

    // Reiniciar el objeto
    secretoObj.titulo = titulo;
    secretoObj.contenido = contenido;
    secretoObj.id = id;

    // Llenar los Inputs
    tituloActual.value = titulo;
    contenidoActual.value = contenido;

    editando = true;
}



function baseDatos() {
    const crearBase = window.indexedDB.open('secretos', 1);

    crearBase.onerror = function() {
        console.log('hubo un error');

        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 4000,
            timerProgressBar: true,
            didOpen: (toast) => {
              toast.addEventListener('mouseenter', Swal.stopTimer)
              toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
          })
          
          Toast.fire({
            icon: 'error',
            title: '¡No cambia nada!',
            text: "error en la base de datos",
          })
    }

    crearBase.onsuccess = function() {
        console.log('Base de datos creada')

        // const Toast = Swal.mixin({
        //     toast: true,
        //     position: 'top-end',
        //     showConfirmButton: false,
        //     timer: 3000,
        //     timerProgressBar: true,
        //     didOpen: (toast) => {
        //       toast.addEventListener('mouseenter', Swal.stopTimer)
        //       toast.addEventListener('mouseleave', Swal.resumeTimer)
        //     }
        //   })
          
        //   Toast.fire({
        //     icon: 'success',
        //     title: '¡DB Creada!',
        //     text: "El zorro esta listo para guardar los secretos.",
        //   })

        DB = crearBase.result;

        ui.imprimirSecretos()
    }

    crearBase.onupgradeneeded = function(e) {

        const db = e.target.result;

        const objectStore = db.createObjectStore('secretos', {
            keyPath: 'id',
            autoIncrement: true
        }) 

        // Definiendo las columnas

        objectStore.createIndex('titulo', 'titulo', { unique: false});
        objectStore.createIndex('contenido', 'contenido', { unique: false});

        console.log('Base de datos creada y lista para almacenar')
    }
}
let DB;

//Selectores de la interfaz 

const form =  document.querySelector('#form'),
        nombreMascota = document.querySelector('#mascota'),
        nombreCliente = document.querySelector('#cliente'),
        telefono = document.querySelector('#telefono'),
        fecha = document.querySelector('#fecha'),
        hora = document.querySelector('#hora'),
        sintomas = document.querySelector('#sintomas'),
        citas = document.querySelector('#citas'),
        headingAdministra = document.querySelector('#administra');


// esperar por el dom ready

document.addEventListener('DOMContentLoaded', () =>{
    //crear la base de datos 

    let crearDB = window.indexedDB.open('citas', 1); 

    // si hay un error mostrar en consola 
    crearDB.onerror = function(){
        console.log('Hubo un error');
    }

    // todo bien muestra en consola y asigna db 
    crearDB.onsuccess = function(){
        console.log('todo listo');

          // asingna base de datos 
            DB = crearDB.result; 

            mostrarCitas();

            //console.log(DB);
    }

    // este metodo solo corre una vez y es el ideal para el schema 

    crearDB.onupgradeneeded = function(e){
     // el evento (e) es la misma base de datos 
        let db = e.target.result;
        
        // definir el object store, toma dos parametros el object store y las opciones 
        //keyPath es ele indice de la base de datos 
        let objectStore = db.createObjectStore('citas', {keyPath:'key', autoIncrement: true } );

        // crear indices y campos de la bases de datos, createIndex 3 parametros, nombre keypath opciones  

        objectStore.createIndex('mascota', 'mascota',{unique : false} );
        objectStore.createIndex('cliente', 'cliente',{unique : false} ) ;
        objectStore.createIndex('telefono', 'telefono',{unique : false} ) ;
        objectStore.createIndex('fecha', 'fecha',{unique : false} ) ;
        objectStore.createIndex('hora', 'hora',{unique : false} ) ;
        objectStore.createIndex('sintomas', 'sintomas',{unique : false} ) ;
        
    

    }
    // cuando el form se envia 
    form.addEventListener('submit', agregarDatos);

    function agregarDatos(e){
        e.preventDefault();
        

        const nuevaCita ={
            mascota : nombreMascota.value,
            cliente: nombreCliente.value,
            telefono: telefono.value,
            fecha : fecha.value,
            hora : hora.value,
            sintomas : sintomas.value, 


        }

       // console.log(nuevaCita);


       // en indexeddb se usan transacciones 

       let transaction = DB.transaction(['citas'], 'readwrite');
       let objectStore = transaction.objectStore('citas');
      // console.log(objectStore);

      let peticion = objectStore.add(nuevaCita);
      console.log(peticion);

      peticion.onsuccess = ()=>{
          form.reset(); 
      }

      transaction.oncomplete = ()=>{
          console.log('Cita agregada');
          mostrarCitas();
      }

      transaction.onerror = ()=>{
        console.log('hubo un error');
    }
      

    }

    function mostrarCitas(){
        // Limpiar las citas anteriores

        while(citas.firstChild){
            citas.removeChild(citas.firstChild);
        }

        // crear objectstore 

        let objectStore = DB.transaction('citas').objectStore('citas');

        //esto retorna una peticion 

        objectStore.openCursor().onsuccess = function(e){
            // cursor se va ubicar en el registro para acceder a los datos 
            let cursor = e.target.result;
            //console.log(cursor);

            if(cursor){
                let citaHTML = document.createElement('li');
                citaHTML.setAttribute('data-cita-id', cursor.value.key);
                citaHTML.classList.add('List-group-item');

                citaHTML.innerHTML = ` 
                    <p class = "font-weight-bold">Mascota: <span class="font-weight-normal">${cursor.value.mascota}</span></p>
                    <p class = "font-weight-bold">Cliente: <span class="font-weight-normal">${cursor.value.cliente}</span></p>
                    <p class = "font-weight-bold">Telefono: <span class="font-weight-normal">${cursor.value.telefono}</span></p>
                    <p class = "font-weight-bold">Fecha: <span class="font-weight-normal">${cursor.value.fecha}</span></p>
                    <p class = "font-weight-bold">Hora: <span class="font-weight-normal">${cursor.value.hora}</span></p>
                    <p class = "font-weight-bold">Sintomas: <span class="font-weight-normal">${cursor.value.sintomas}</span></p>
                `;

                // boton de borrar 
                const borrar = document.createElement('button');
                borrar.classList.add('borrar', 'btn', 'btn-danger');
                borrar.innerHTML = '<span aria-hidden="true">x</span>Borrar';
                borrar.onclick = borrarCita;
                citaHTML.appendChild(borrar);

                citas.appendChild(citaHTML);
                // tomar los proximos registros 
                cursor.continue();
            }else{
                // cuando no hay registros 
               if(!citas.firstChild){
                headingAdministra.textContent = 'Agrega citas para comenzar';
                let listado = document.createElement('p');
                listado.textContent = 'No hay citas';
                citas.appendChild(listado);
               }else{
                headingAdministra.textContent = 'Administra tus citas';
               }
            }
        }
    
    }

    function borrarCita(e){
        let citaID = Number(e.target.parentElement.getAttribute('data-cita-id'));
        

         // en indexeddb se usan transacciones 

       let transaction = DB.transaction(['citas'], 'readwrite');
       let objectStore = transaction.objectStore('citas');
       let peticion = objectStore.delete(citaID);

       transaction.oncomplete= ()=>{
           e.target.parentElement.parentElement.removeChild(e.target.parentElement);

             // cuando no hay registros 
             if(!citas.firstChild){
                headingAdministra.textContent = 'Agrega citas para comenzar';
                let listado = document.createElement('p');
                listado.textContent = 'No hay citas';
                citas.appendChild(listado);
               }else{
                headingAdministra.textContent = 'Administra tus citas';
               }
       }
    }

  
})


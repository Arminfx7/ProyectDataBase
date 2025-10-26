const BASE_URL = import.meta?.env?.API_BASE || "http://localhost:8080";
const grid = document.getElementById('employeesGrid');

const response = await fetch(`${BASE_URL}/api/empleados`);
let empleados = [];
empleados = await response.json();


async function cargarEmpleados() {
    try {
        const response = await fetch(`${BASE_URL}/api/empleados`);
        const empleados = await response.json();
        mostrarEmpleados(empleados);
        
    } catch (e){
        console.error(e)
    }
}

/*
                    <div class="employee-header">
                        <div class="employee-name">Alejandra López</div>
                        <div class="employee-position">Secreataria</div>
                    </div>
                    <div class="employee-avatar">
                        <div class="avatar-circle">
                            <svg class="avatar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                            </svg>
                        </div>
                    </div>
                    <button class="view-more-btn">Ver más</button>
*/

function mostrarEmpleados(empleados){
    grid.innerHTML = '';
    empleados.forEach(emp => {
        const card = document.createElement('div');
        card.classList.add('employee-card');
        card.innerHTML = `
                    <div class="employee-header">
                        <div class="employee-name">${emp.nombres} ${emp.apellidos} </div>
                        <div class="employee-position">${emp.rol ? emp.rol.nombreRol : 'Sin rol'}</div>
                    </div>
                    <div class="employee-avatar">
                        <div class="avatar-circle">
                            <svg class="avatar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                            </svg>
                        </div>
                    </div>
                    <button class="view-more-btn">Opciones</button>`;

        const btn = card.querySelector('.view-more-btn');
        btn.addEventListener('click', () => mostrarOpciones(emp));
        grid.appendChild(card);
    });
}

async function mostrarOpciones(emp){
    const opciones = await Swal.fire({
        title: 'Opciones de Empleado',
        html: `¿Qué operación desea realizar?`,
        icon: 'question',
        
        showCancelButton: true, 
        showDenyButton: true,  
        
        confirmButtonText: 'Actualizar<br>Empleado', 
        denyButtonText: 'Eliminar<br>Empleado',   
        cancelButtonText: 'Cerrar',                
        
        confirmButtonColor: '#385563', 
        denyButtonColor: '#d33',     
    });

    if (opciones.isConfirmed) {
        localStorage.setItem('empleadoSeleccionadoId', emp.idEmpleado);
        window.location.href = `actualizarEmpleados.html`;
        
    } else if (opciones.isDenied) {
        eliminarEmpleado(emp);
    }
}

async function eliminarEmpleado(emp){
    const id = emp.idEmpleado;
    //console.log(id);

    const confirmacion = await Swal.fire({
        title: '¿Estás seguro?',
        text: `Vas a eliminar al empleado: ${emp.nombres} ${emp.apellidos}.`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Sí, Eliminar',
        cancelButtonText: 'Cancelar'
    });

    if (confirmacion.isConfirmed) {
        try {
        const response = await fetch(`${BASE_URL}/api/empleados/${id}`, {
        method: "DELETE",
        });

        if (response.ok) {
            Swal.fire({
                icon: 'success',
                title: '¡Eliminado!',
                text: 'Empleado eliminado con éxito.'
            });
            cargarEmpleados();
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error al eliminar',
                //text: `El servidor respondió con un error: ${res.status} - ${errorText.substring(0, 100)}...`
            });
        }
        } catch (e) {
            console.error(e);
        }
        
    } else if (!confirmacion.isConfirmed) {
        return;
    }
}
 
/*function mostrarInfo(emp){
    alert(`
        Empleado: ${emp.nombres} ${emp.apellidos}
        Rol: ${emp.rol || "Sin rol"}
        Teléfono: ${emp.telefono}
        Sueldo: Q${emp.sueldo}
        Fecha de contratación: ${emp.fechaContratacion}
        Correo: ${emp.email || "N/A"}`
    );
}*/

document.querySelector(".apply-filters-btn").addEventListener("click", async function() {
    let filtrados = [...empleados];
    //console.log(filtrados);
    let contador = 0;

    /*if (document.getElementById("mecanico").checked) {
        filtrados = filtrados.filter(e => e.rol?.nombreRol?.toLowerCase() === 'mecanico');
        contador++;
    }
    if (document.getElementById("secretaria").checked) {
        filtrados = filtrados.filter(e => e.rol?.nombreRol?.toLowerCase() === 'secretaria');
        contador++;
    }
    if (document.getElementById("caja").checked) {
        filtrados = filtrados.filter(e => e.rol?.nombreRol?.toLowerCase() === 'caja');
        contador++;
    }*/
    if (document.getElementById("nombre").checked) {
        filtrados.sort((a, b) => a.nombres.localeCompare(b.nombres));
        contador++;
    }

    if (document.getElementById("apellido").checked) {
        filtrados.sort((a, b) => a.apellidos.localeCompare(b.apellidos));
        contador++;
    }

    mostrarEmpleados(filtrados);
    document.getElementById("filtersApplied").textContent = `${contador} ${contador === 1 ? 'Filtro aplicado' : 'Filtros aplicados'}`;
});

const searchInput = document.getElementById("searchInput");

searchInput.addEventListener("input", e => {
    const term = e.target.value.toLowerCase().trim(); 

    const coincidencias = empleados.filter(emp => 
        emp.nombres.toLowerCase().includes(term) || 
        emp.apellidos.toLowerCase().includes(term)
    );

    mostrarEmpleados(coincidencias);
});



cargarEmpleados();
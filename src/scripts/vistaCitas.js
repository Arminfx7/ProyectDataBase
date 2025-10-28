const BASE_URL = import.meta?.env?.API_BASE || "http://localhost:8080";

const tbody = document.querySelector('tbody');
const searchInput = document.getElementById('searchInput');
const filtersApplied = document.getElementById('filtersApplied');

let citas = [];

async function cargarCitas() {
    try {
        const response = await auth.fetchWithAuth(`${BASE_URL}/api/citas`);
        citas = await response.json();
        mostrarCitas(citas);
    } catch (e) {
        console.error('Error al cargar citas:', e);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudieron cargar las citas'
        });
    }
}

function mostrarCitas(citasAMostrar) {
    tbody.innerHTML = '';
    
    if (citasAMostrar.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center;">No se encontraron citas</td></tr>';
        return;
    }

    citasAMostrar.forEach(cita => {
        const row = document.createElement('tr');
        row.dataset.citaId = cita.idCita;
        row.dataset.estadoOriginal = cita.estado;
        
        row.innerHTML = `
            <td data-label="ID">${cita.idCita}</td>
            <td data-label="Estado">
                <select class="estado-select">
                    <option value="Nuevo" ${cita.estado === 'Nuevo' ? 'selected' : ''}>Nuevo</option>
                    <option value="En Proceso" ${cita.estado === 'En Proceso' ? 'selected' : ''}>En Proceso</option>
                    <option value="Completada" ${cita.estado === 'Completada' ? 'selected' : ''}>Completada</option>
                    <option value="Cancelada" ${cita.estado === 'Cancelada' ? 'selected' : ''}>Cancelada</option>
                </select>
            </td>
            <td data-label="Fecha">${cita.fechaCita}</td>
            <td data-label="Hora">${formatearHora(cita.horaCita)}</td>
            <td data-label="Motivo">${cita.motivo || 'N/A'}</td>
            <td data-label="Observaciones">${cita.observaciones || 'Ninguna'}</td>
            <td data-label="Cliente">${obtenerNombreCliente(cita)}</td>
            <td data-label="Empleado">${obtenerNombreEmpleado(cita)}</td>
            <td data-label="Vehículo">${obtenerPlacaVehiculo(cita)}</td>
            <td data-label="Guardar">
                <button class="editar-btn guardar-btn">Guardar</button>
            </td>
        `;

        const btnGuardar = row.querySelector('.guardar-btn');
        btnGuardar.addEventListener('click', () => guardarCambioEstado(row, cita));

        tbody.appendChild(row);
    });
}


function formatearHora(hora) {
    if (!hora) return 'N/A';
    const partes = hora.split(':');
    return `${partes[0]}:${partes[1]}`;
    /*
    const date = new Date(hora);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;*/
}

function obtenerNombreCliente(cita) {
    if (cita.clienteNombre) {
        return cita.clienteNombre;
    }
    if (cita.cliente) {
        return `${cita.cliente.nombres || ''} ${cita.cliente.apellidos || ''}`.trim();
    }
    return 'N/A';
}

function obtenerNombreEmpleado(cita) {
    // método del backend
    if (cita.empleadoNombre) {
        return cita.empleadoNombre;
    }
    // Fallback al objeto completo si está disponible
    if (cita.empleado) {
        return `${cita.empleado.nombres || ''} ${cita.empleado.apellidos || ''}`.trim();
    }
    return 'N/A';
}

function obtenerPlacaVehiculo(cita) {
    if (cita.vehiculoPlaca) {
        return cita.vehiculoPlaca;
    }
    if (cita.vehiculo) {
        return cita.vehiculo.placa || 'N/A';
    }
    return 'N/A';
}

async function guardarCambioEstado(row, cita) {
    const select = row.querySelector('.estado-select');
    const nuevoEstado = select.value;
    const estadoOriginal = row.dataset.estadoOriginal;

    if (nuevoEstado === estadoOriginal) {
        Swal.fire({
            icon: 'info',
            title: 'Sin cambios',
            text: 'El estado no ha sido modificado'
        });
        return;
    }

    const confirmacion = await Swal.fire({
        title: '¿Confirmar cambio?',
        html: `¿Desea cambiar el estado de <strong>${estadoOriginal}</strong> a <strong>${nuevoEstado}</strong>?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#385563',
        confirmButtonText: 'Sí, guardar',
        cancelButtonText: 'Cancelar'
    });

    if (confirmacion.isConfirmed) {
        try {
            const citaActualizada = {
                ...cita,
                estado: nuevoEstado
            };

            const response = await fetch(`${BASE_URL}/api/citas/${cita.idCita}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(citaActualizada)
            });

            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Actualizado!',
                    text: 'Estado de la cita actualizado con éxito',
                    timer: 2000
                });
                row.dataset.estadoOriginal = nuevoEstado;
                cargarCitas();
            } else {
                throw new Error('Error al actualizar');
            }
        } catch (e) {
            console.error('Error al actualizar estado:', e);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo actualizar el estado de la cita'
            });
            select.value = estadoOriginal;
        }
    } else {
        select.value = estadoOriginal;
    }
}

document.querySelector('.apply-filters-btn').addEventListener('click', () => {
    let filtrados = [...citas];
    let contador = 0;

    if (document.getElementById('nombreAZ').checked) {
        filtrados.sort((a, b) => {
            const nombreA = obtenerNombreCliente(a).toLowerCase();
            const nombreB = obtenerNombreCliente(b).toLowerCase();
            return nombreA.localeCompare(nombreB);
        });
        contador++;
    }

    if (document.getElementById('nombreZA').checked) {
        filtrados.sort((a, b) => {
            const nombreA = obtenerNombreCliente(a).toLowerCase();
            const nombreB = obtenerNombreCliente(b).toLowerCase();
            return nombreB.localeCompare(nombreA);
        });
        contador++;
    }

    if (document.getElementById('pendientes').checked) {
        filtrados = filtrados.filter(c => 
            c.estado === 'Nuevo' || c.estado === 'En Proceso'
        );
        contador++;
    }

    if (document.getElementById('completadas').checked) {
        filtrados = filtrados.filter(c => 
            c.estado === 'Completada'
        );
        contador++;
    }

    if (document.getElementById('canceladas').checked) {
        filtrados = filtrados.filter(c => 
            c.estado === 'Cancelada'
        );
        contador++;
    }
    mostrarCitas(filtrados);
    filtersApplied.textContent = `${contador} ${contador === 1 ? 'Filtro aplicado' : 'Filtros aplicados'}`;
});

searchInput.addEventListener('input', e => {
    const term = e.target.value.toLowerCase().trim();

    const coincidencias = citas.filter(cita => {
        const nombreCliente = obtenerNombreCliente(cita).toLowerCase();
        const motivo = (cita.motivoCita || '').toLowerCase();
        const placa = obtenerPlacaVehiculo(cita).toLowerCase();
        
        return nombreCliente.includes(term) || 
               motivo.includes(term) || 
               placa.includes(term);
    });

    mostrarCitas(coincidencias);
});

cargarCitas();
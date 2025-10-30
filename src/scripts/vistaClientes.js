const BASE_URL = import.meta?.env?.API_BASE || "http://localhost:8080";
const grid = document.getElementById('clientesGrid');

let clientes = [];

async function cargarClientes() {
    try {
        const response = await auth.fetchWithAuth(`${BASE_URL}/api/clientes`);
        clientes = await response.json();
        mostrarClientes(clientes);
    } catch (e) {
        console.error(e);
        Swal.fire({
            icon: 'error',
            title: 'Error al cargar',
            text: 'No se pudieron cargar los clientes.'
        });
    }
}

function mostrarClientes(clientes) {
    grid.innerHTML = '';
    clientes.forEach(cliente => {
        const card = document.createElement('div');
        card.classList.add('employee-card');
        
        const numVehiculos = cliente.vehiculos ? cliente.vehiculos.length : 0;
        
        card.innerHTML = `
            <div class="employee-header">
                <div class="employee-name">${cliente.nombres} ${cliente.apellidos}</div>
                <div class="employee-position">${numVehiculos} ${numVehiculos === 1 ? 'Vehículo' : 'Vehículos'}</div>
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
        btn.addEventListener('click', () => mostrarOpciones(cliente));
        grid.appendChild(card);
    });
}

async function mostrarOpciones(cliente) {
    const resultado = await Swal.fire({
        title: 'Opciones de Cliente',
        html: `<strong>${cliente.nombres} ${cliente.apellidos}</strong><br>¿Qué operación desea realizar?`,
        icon: 'question',
        showCancelButton: true,
        showDenyButton: true,
        showCloseButton: true,
        confirmButtonText: '<i class="fas fa-eye"></i> Ver Vehículos',
        denyButtonText: '<i class="fas fa-edit"></i> Actualizar Datos',
        cancelButtonText: 'Más opciones',
        confirmButtonColor: '#385563',
        denyButtonColor: '#6c757d',
        cancelButtonColor: '#17a2b8'
    });

    if (resultado.isConfirmed) {
        verVehiculos(cliente);
    } else if (resultado.isDenied) {
        actualizarCliente(cliente);
    } else if (resultado.dismiss === Swal.DismissReason.cancel) {
        mostrarOpcionesAdicionales(cliente);
    }
}

async function mostrarOpcionesAdicionales(cliente) {
    const resultado = await Swal.fire({
        title: 'Más Opciones',
        html: `<strong>${cliente.nombres} ${cliente.apellidos}</strong>`,
        icon: 'question',
        showCancelButton: true,
        showDenyButton: true,
        confirmButtonText: '<i class="fas fa-plus"></i> Agregar Vehículo',
        denyButtonText: '<i class="fas fa-trash"></i> Eliminar Cliente',
        cancelButtonText: 'Volver',
        confirmButtonColor: '#28a745',
        denyButtonColor: '#d33',
        cancelButtonColor: '#6c757d'
    });

    if (resultado.isConfirmed) {
        agregarVehiculo(cliente);
    } else if (resultado.isDenied) {
        eliminarCliente(cliente);
    } else if (resultado.dismiss === Swal.DismissReason.cancel) {
        mostrarOpciones(cliente);
    }
}

async function verVehiculos(cliente) {
    try {
        const response = await auth.fetchWithAuth(`${BASE_URL}/api/clientes/${cliente.idCliente}/vehiculos`);
        const vehiculos = await response.json();

        if (!vehiculos || vehiculos.length === 0) {
            Swal.fire({
                icon: 'info',
                title: 'Sin Vehículos',
                text: `${cliente.nombres} ${cliente.apellidos} no tiene vehículos registrados.`,
                confirmButtonText: 'Agregar Vehículo',
                showCancelButton: true,
                cancelButtonText: 'Cerrar'
            }).then((result) => {
                if (result.isConfirmed) {
                    agregarVehiculo(cliente);
                }
            });
            return;
        }

        const vehiculosHTML = vehiculos.map(v => `
            <div style="text-align: left; padding: 15px; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 12px; background-color: #f9f9f9; position: relative;">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div>
                        <strong style="font-size: 16px;">${v.marca} ${v.modelo}</strong> <span style="color: #666;">(${v.año})</span><br>
                        <small style="color: #555;">Placa: ${v.placa} | Color: ${v.color}</small>
                    </div>
                    <button 
                        class="btn-eliminar-vehiculo" 
                        data-vehiculo-id="${v.idVehiculo}"
                        data-vehiculo-info="${v.marca} ${v.modelo} - ${v.placa}"
                        style="background-color: #dc3545; color: white; border: none; padding: 6px 12px; border-radius: 5px; cursor: pointer; font-size: 12px; transition: background-color 0.3s;"
                        onmouseover="this.style.backgroundColor='#c82333'"
                        onmouseout="this.style.backgroundColor='#dc3545'"
                    >
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            </div>
        `).join('');

        Swal.fire({
            title: `Vehículos de ${cliente.nombres} ${cliente.apellidos}`,
            html: `
                <div style="max-height: 450px; overflow-y: auto; padding: 10px;">
                    ${vehiculosHTML}
                </div>
            `,
            width: '700px',
            showCloseButton: true,
            showConfirmButton: false,
            didOpen: () => {
                const botonesEliminar = document.querySelectorAll('.btn-eliminar-vehiculo');
                botonesEliminar.forEach(btn => {
                    btn.addEventListener('click', async (e) => {
                        e.preventDefault();
                        const vehiculoId = btn.getAttribute('data-vehiculo-id');
                        const vehiculoInfo = btn.getAttribute('data-vehiculo-info');
                        
                        await eliminarVehiculo(vehiculoId, vehiculoInfo, cliente);
                    });
                });
            }
        });
    } catch (e) {
        console.error(e);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudieron cargar los vehículos del cliente.'
        });
    }
}

async function eliminarVehiculo(vehiculoId, vehiculoInfo, cliente) {
    const confirmacion = await Swal.fire({
        title: '¿Eliminar Vehículo?',
        html: `¿Estás seguro de que deseas eliminar el vehículo:<br><strong>${vehiculoInfo}</strong>?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, Eliminar',
        cancelButtonText: 'Cancelar'
    });

    if (confirmacion.isConfirmed) {
        try {
            const response = await auth.fetchWithAuth(`${BASE_URL}/api/vehiculos/${vehiculoId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Eliminado!',
                    text: 'El vehículo ha sido eliminado exitosamente.',
                    timer: 2000,
                    showConfirmButton: false
                });
                
                await cargarClientes();
                
                setTimeout(() => {
                    verVehiculos(cliente);
                }, 2100);
            } else {
                const errorText = await response.text();
                Swal.fire({
                    icon: 'error',
                    title: 'Error al eliminar',
                    text: `No se pudo eliminar el vehículo. ${errorText}`
                });
            }
        } catch (e) {
            console.error(e);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ocurrió un error al intentar eliminar el vehículo.'
            });
        }
    }
}

function actualizarCliente(cliente) {
    localStorage.setItem('clienteSeleccionadoId', cliente.idCliente);
    window.location.href = 'actualizarClientes.html';
}

async function agregarVehiculo(cliente) {
    const { value: formValues } = await Swal.fire({
        title: `Agregar Vehículo para ${cliente.nombres} ${cliente.apellidos}`,
        html: `
            <div style="text-align: left;">
                <label style="display: block; margin-top: 10px; font-weight: bold;">Marca:</label>
                <input id="marca" class="swal2-input" style="width: 90%; margin: 5px 0;" placeholder="Ej: Toyota" required>
                
                <label style="display: block; margin-top: 10px; font-weight: bold;">Modelo:</label>
                <input id="modelo" class="swal2-input" style="width: 90%; margin: 5px 0;" placeholder="Ej: Corolla" required>
                
                <label style="display: block; margin-top: 10px; font-weight: bold;">Año:</label>
                <input id="año" type="number" class="swal2-input" style="width: 90%; margin: 5px 0;" placeholder="Ej: 2020" min="1900" max="2025" required>
                
                <label style="display: block; margin-top: 10px; font-weight: bold;">Placa:</label>
                <input id="placa" class="swal2-input" style="width: 90%; margin: 5px 0;" placeholder="Ej: P123ABC" required>
                
                <label style="display: block; margin-top: 10px; font-weight: bold;">Color:</label>
                <input id="color" class="swal2-input" style="width: 90%; margin: 5px 0;" placeholder="Ej: Rojo" required>
            </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Agregar Vehículo',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#28a745',
        width: '600px',
        preConfirm: () => {
            const marca = document.getElementById('marca').value;
            const modelo = document.getElementById('modelo').value;
            const año = document.getElementById('año').value;
            const placa = document.getElementById('placa').value;
            const color = document.getElementById('color').value;

            if (!marca || !modelo || !año || !placa || !color) {
                Swal.showValidationMessage('Por favor completa todos los campos obligatorios');
                return false;
            }

            return {
                marca: marca.trim(),
                modelo: modelo.trim(),
                año: parseInt(año),
                placa: placa.trim(),
                color: color.trim(),
                cliente: { 
                    idCliente: cliente.idCliente
                }
            };
        }
    });

    if (formValues) {
        try {
            const response = await auth.fetchWithAuth(`${BASE_URL}/api/vehiculos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formValues)
            });

            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Vehículo Agregado!',
                    text: `El vehículo ${formValues.marca} ${formValues.modelo} ha sido registrado exitosamente.`,
                    confirmButtonColor: '#28a745'
                });
                cargarClientes();
            } else {
                const errorText = await response.text();
                Swal.fire({
                    icon: 'error',
                    title: 'Error al agregar',
                    text: `No se pudo agregar el vehículo. ${errorText}`
                });
            }
        } catch (e) {
            console.error(e);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ocurrió un error al intentar agregar el vehículo.'
            });
        }
    }
}

async function eliminarCliente(cliente) {
    const confirmacion = await Swal.fire({
        title: '¿Estás seguro?',
        html: `Vas a eliminar al cliente: <strong>${cliente.nombres} ${cliente.apellidos}</strong>.<br><br>
               <span style="color: red;">⚠️ Esta acción también eliminará todos sus vehículos asociados.</span>`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Sí, Eliminar',
        cancelButtonText: 'Cancelar'
    });

    if (confirmacion.isConfirmed) {
        try {
            const response = await auth.fetchWithAuth(`${BASE_URL}/api/clientes/${cliente.idCliente}`, {
                method: "DELETE"
            });

            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Eliminado!',
                    text: 'Cliente eliminado con éxito.'
                });
                cargarClientes();
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al eliminar',
                    text: 'No se pudo eliminar el cliente.'
                });
            }
        } catch (e) {
            console.error(e);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ocurrió un error al intentar eliminar el cliente.'
            });
        }
    }
}

document.querySelector(".apply-filters-btn").addEventListener("click", async function() {
    let filtrados = [...clientes];
    let contador = 0;

    if (document.getElementById("conVehiculos").checked) {
        filtrados = filtrados.filter(c => c.vehiculos && c.vehiculos.length > 0);
        contador++;
    }

    if (document.getElementById("sinVehiculos").checked) {
        filtrados = filtrados.filter(c => !c.vehiculos || c.vehiculos.length === 0);
        contador++;
    }

    if (document.getElementById("nombre").checked) {
        filtrados.sort((a, b) => a.nombres.localeCompare(b.nombres));
        contador++;
    }

    if (document.getElementById("apellido").checked) {
        filtrados.sort((a, b) => a.apellidos.localeCompare(b.apellidos));
        contador++;
    }

    mostrarClientes(filtrados);
    document.getElementById("filtersApplied").textContent = `${contador} ${contador === 1 ? 'Filtro aplicado' : 'Filtros aplicados'}`;
});

const searchInput = document.getElementById("searchInput");
searchInput.addEventListener("input", e => {
    const term = e.target.value.toLowerCase().trim();

    const coincidencias = clientes.filter(cliente => 
        cliente.nombres.toLowerCase().includes(term) || 
        cliente.apellidos.toLowerCase().includes(term) ||
        (cliente.telefono && cliente.telefono.includes(term)) ||
        (cliente.email && cliente.email.toLowerCase().includes(term))
    );

    mostrarClientes(coincidencias);
});

cargarClientes();
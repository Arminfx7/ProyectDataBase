const BASE_URL = import.meta?.env?.API_BASE || "http://localhost:8080";

const clienteSelect = document.getElementById('clienteSelect');
const nuevoClienteFields = document.getElementById('nuevoClienteFields');
const vehiculoSelect = document.getElementById('vehiculoSelect');
const nuevoVehiculoFields = document.getElementById('nuevoVehiculoFields');
const form = document.getElementById('citaForm');

let clientes = [];
let vehiculos = [];

async function cargarClientes() {
    try {
        const response = await fetch(`${BASE_URL}/api/clientes`);
        if (response.ok) {
            clientes = await response.json();
            clienteSelect.innerHTML = '<option value="">Selecciona una opción...</option>';
            clienteSelect.innerHTML += '<option value="nuevo">Agregar Nuevo Cliente</option>';

            clientes.forEach(cliente => {
                const option = document.createElement("option");
                option.value = cliente.idCliente;
                option.textContent = `${cliente.nombres} ${cliente.apellidos} - ${cliente.telefono}`;
                clienteSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error al cargar clientes:', error);
    }
}

async function cargarVehiculosDelCliente(idCliente) {
    try {
        const response = await fetch(`${BASE_URL}/api/clientes/${idCliente}/vehiculos`);
        if (response.ok) {
            const vehiculosCliente = await response.json();
            
            vehiculoSelect.innerHTML = '<option value="">Selecciona una opción...</option>';
            vehiculoSelect.innerHTML += '<option value="nuevo">Agregar Nuevo Vehículo</option>';
            
            if (vehiculosCliente.length === 0) {
                const option = document.createElement("option");
                option.value = "";
                option.textContent = "Este cliente no tiene vehículos registrados";
                option.disabled = true;
                vehiculoSelect.appendChild(option);
            } else {
                vehiculosCliente.forEach(vehiculo => {
                    const option = document.createElement("option");
                    option.value = vehiculo.idVehiculo;
                    option.textContent = `${vehiculo.marca} ${vehiculo.modelo} - ${vehiculo.placa}`;
                    vehiculoSelect.appendChild(option);
                });
            }
            
            vehiculoSelect.disabled = false;
        }
    } catch (error) {
        console.error('Error al cargar vehículos del cliente:', error);
    }
}

async function cargarEmpleados() {
    try {
        const res = await fetch(`${BASE_URL}/api/empleados`);
        const empleados = await res.json();

        let mecanicos = [...empleados];

        mecanicos = mecanicos.filter(e => e.nombreRol === 'MECANICO');

        empleadoSelect.innerHTML = '<option value="">Selecciona un mecánico</option>';
        mecanicos.forEach(emp => {
            const option = document.createElement('option');
            option.value = emp.idEmpleado;
            option.textContent = `${emp.nombres} ${emp.apellidos}`;
            empleadoSelect.appendChild(option);
        });

    } catch (error) {
        console.error("Error al cargar mecánicos:", error);
    }
}

clienteSelect.addEventListener('change', function() {
    if (this.value === 'nuevo') {
        nuevoClienteFields.classList.remove('hidden');
        document.getElementById('clienteNombre').required = true;
        document.getElementById('clienteApellido').required = true;
        document.getElementById('clienteEmail').required = true;
        document.getElementById('clienteTelefono').required = true;
        
        vehiculoSelect.innerHTML = '<option value="">Primero crea el cliente</option>';
        vehiculoSelect.innerHTML += '<option value="nuevo">Agregar Nuevo Vehículo</option>';
        vehiculoSelect.disabled = false;
        
    } else if (this.value === '') {
        nuevoClienteFields.classList.add('hidden');
        document.getElementById('clienteNombre').required = false;
        document.getElementById('clienteApellido').required = false;
        document.getElementById('clienteEmail').required = false;
        document.getElementById('clienteTelefono').required = false;
        
        vehiculoSelect.innerHTML = '<option value="">Selecciona un cliente primero</option>';
        vehiculoSelect.disabled = true;
        
    } else {
        nuevoClienteFields.classList.add('hidden');
        document.getElementById('clienteNombre').required = false;
        document.getElementById('clienteApellido').required = false;
        document.getElementById('clienteEmail').required = false;
        document.getElementById('clienteTelefono').required = false;
        
        cargarVehiculosDelCliente(this.value);
    }
});

vehiculoSelect.addEventListener('change', function() {
    if (this.value === 'nuevo') {
        nuevoVehiculoFields.classList.remove('hidden');
        document.getElementById('vehiculoMarca').required = true;
        document.getElementById('vehiculoModelo').required = true;
        document.getElementById('vehiculoPlaca').required = true;
    } else {
        nuevoVehiculoFields.classList.add('hidden');
        document.getElementById('vehiculoMarca').required = false;
        document.getElementById('vehiculoModelo').required = false;
        document.getElementById('vehiculoPlaca').required = false;
    }
});

async function crearCliente() {
    const clienteData = {
        activo: true,
        estado: "Nuevo",
        nombres: document.getElementById('clienteNombre').value,
        apellidos: document.getElementById('clienteApellido').value,
        correo: document.getElementById('clienteEmail').value,
        telefono: document.getElementById('clienteTelefono').value,
        direccion: document.getElementById('clienteDireccion').value
    };

    try {
        const response = await fetch(`${BASE_URL}/api/clientes`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(clienteData)
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Cliente creado:', data);
            return data.idCliente;
        } else {
            const errorText = await response.text();
            console.error('Error del servidor:', errorText);
            throw new Error('Error al crear cliente');
        }
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

async function crearVehiculo(idCliente) {
    const vehiculoData = {
        marca: document.getElementById('vehiculoMarca').value,
        modelo: document.getElementById('vehiculoModelo').value,
        año: parseInt(document.getElementById('vehiculoAnio').value),
        placa: document.getElementById('vehiculoPlaca').value,
        color: document.getElementById('vehiculoColor').value,
        cliente: { 
            idCliente: idCliente
        }
    };

    try {
        const response = await fetch(`${BASE_URL}/api/vehiculos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(vehiculoData)
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Vehículo creado:', data);
            return data.idVehiculo;
        } else {
            const errorText = await response.text();
            console.error('Error del servidor:', errorText);
            throw new Error('Error al crear vehículo');
        }
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

async function crearCita(idCliente, idVehiculo) {
    const citaData = {
        fecha_cita: document.getElementById('citaFecha').value,
        hora_cita: document.getElementById('citaHora').value,
        motivo: document.getElementById('citaDescripcion').value,
        observaciones: document.getElementById('citaObservacion').value,
        id_cliente: idCliente,
        id_vehiculo: idVehiculo,
        id_empleado: parseInt(document.getElementById('empleadoSelect').value),
        estado: 'Nuevo'
    };

    try {
        const response = await fetch(`${BASE_URL}/api/citas`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(citaData)
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Cita creada:', data);
            return data;
        } else {
            const errorText = await response.text();
            console.error('Error del servidor:', errorText);
            throw new Error('Error al crear cita');
        }
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

form.addEventListener('submit', async function(e) {
    e.preventDefault();

    try {
        Swal.fire({
            title: 'Procesando...',
            text: 'Creando la cita',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        let idCliente;
        let idVehiculo;

        if (clienteSelect.value === 'nuevo') {
            idCliente = await crearCliente();
        } else {
            idCliente = parseInt(clienteSelect.value);
        }

        if (vehiculoSelect.value === 'nuevo') {
            idVehiculo = await crearVehiculo(idCliente);
        } else {
            idVehiculo = parseInt(vehiculoSelect.value);
        }

        await crearCita(idCliente, idVehiculo);

        Swal.fire({
            title: '¡Cita Creada!',
            text: 'La cita se ha registrado exitosamente',
            icon: 'success',
            confirmButtonColor: '#375A7F',
            confirmButtonText: 'Aceptar'
        }).then(() => {
            window.location.href = 'citas.html';
        });

    } catch (error) {
        console.error('Error completo:', error);
        Swal.fire({
            title: 'Error',
            text: 'Hubo un problema al crear la cita. Por favor intenta nuevamente.',
            icon: 'error',
            confirmButtonColor: '#375A7F',
            confirmButtonText: 'Aceptar'
        });
    }
});

document.getElementById('citaFecha').min = new Date().toISOString().split('T')[0];

const citaHora = document.getElementById('citaHora');
citaHora.addEventListener('change', function() {
    const hora = this.value;
    if (hora) {
        const [hours, minutes] = hora.split(':');
        const totalMinutes = parseInt(hours) * 60 + parseInt(minutes);
        const minTime = 8 * 60;
        const maxTime = 17 * 60;

        if (totalMinutes < minTime || totalMinutes > maxTime) {
            Swal.fire({
                title: 'Horario No Disponible',
                text: 'Por favor selecciona una hora entre 8:00 AM y 5:00 PM',
                icon: 'warning',
                confirmButtonColor: '#375A7F',
                confirmButtonText: 'Entendido'
            });
            this.value = '';
        }
    }
});

cargarClientes();
cargarEmpleados();
vehiculoSelect.disabled = true;
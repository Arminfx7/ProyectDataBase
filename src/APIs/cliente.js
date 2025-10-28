const BASE_URL = import.meta?.env?.API_BASE || "http://localhost:8080";

const nuevoVehiculoFields = document.getElementById('nuevoVehiculoFields');
const form = document.getElementById('citaForm');

// Mostrar/ocultar campos de vehículo cuando se hace clic en el checkbox o select
const vehiculoCheckbox = document.getElementById('agregarVehiculo');
if (vehiculoCheckbox) {
    vehiculoCheckbox.addEventListener('change', function() {
        if (this.checked) {
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
}

// Crear nuevo cliente
async function crearCliente() {
    const clienteData = {
        activo: true,
        estado: "Nuevo",
        nombres: document.getElementById('clienteNombre').value,
        apellidos: document.getElementById('clienteApellido').value,
        correo: document.getElementById('clienteEmail').value,
        telefono: document.getElementById('clienteTelefono').value,
        direccion: document.getElementById('clienteDireccion').value || ''
    };

    try {
        const response = await auth.fetchWithAuth(`${BASE_URL}/api/clientes`, {
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

// Crear nuevo vehículo
async function crearVehiculo(idCliente) {
    const vehiculoData = {
        marca: document.getElementById('vehiculoMarca').value,
        modelo: document.getElementById('vehiculoModelo').value,
        año: parseInt(document.getElementById('vehiculoAnio').value) || new Date().getFullYear(),
        placa: document.getElementById('vehiculoPlaca').value,
        color: document.getElementById('vehiculoColor').value || '',
        cliente: { 
            idCliente: idCliente
        }
    };

    try {
        const response = await auth.fetchWithAuth(`${BASE_URL}/api/vehiculos`, {
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

// Manejar envío del formulario
form.addEventListener('submit', async function(e) {
    e.preventDefault();

    try {
        Swal.fire({
            title: 'Procesando...',
            text: 'Guardando información del cliente',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        // Crear el cliente
        const idCliente = await crearCliente();
        
        // Verificar si se debe agregar un vehículo
        const agregarVehiculo = document.getElementById('agregarVehiculo');
        const debeAgregarVehiculo = agregarVehiculo ? agregarVehiculo.checked : false;
        
        if (debeAgregarVehiculo) {
            await crearVehiculo(idCliente);
            
            Swal.fire({
                title: '¡Cliente Registrado!',
                text: 'El cliente y su vehículo se han registrado exitosamente',
                icon: 'success',
                confirmButtonColor: '#375A7F',
                confirmButtonText: 'Aceptar'
            }).then(() => {
                form.reset();
                nuevoVehiculoFields.classList.add('hidden');
            });
        } else {
            Swal.fire({
                title: '¡Cliente Registrado!',
                text: 'El cliente se ha registrado exitosamente',
                icon: 'success',
                confirmButtonColor: '#375A7F',
                confirmButtonText: 'Aceptar'
            }).then(() => {
                form.reset();
            });
        }

    } catch (error) {
        console.error('Error completo:', error);
        Swal.fire({
            title: 'Error',
            text: 'Hubo un problema al registrar. Por favor intenta nuevamente.',
            icon: 'error',
            confirmButtonColor: '#375A7F',
            confirmButtonText: 'Aceptar'
        });
    }
});
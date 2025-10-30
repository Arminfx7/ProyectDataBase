const BASE_URL = import.meta?.env?.API_BASE || "http://localhost:8080";

let clientes = [];
let clienteSeleccionado = null;

const clienteSelect = document.getElementById('clienteSelect');
const form = document.getElementById('updateForm');

async function cargarClientes() {
    try {
        const res = await auth.fetchWithAuth(`${BASE_URL}/api/clientes`);
        if (!res.ok) {
            throw new Error(`Error HTTP: ${res.status}`);
        }
        
        clientes = await res.json();

        clienteSelect.innerHTML = '<option value="">Selecciona un cliente</option>';
        clientes.forEach(cliente => {
            const option = document.createElement('option');
            option.value = cliente.idCliente;
            option.textContent = `${cliente.nombres} ${cliente.apellidos} - ${cliente.correo || 'Sin email'}`;
            clienteSelect.appendChild(option);
        });

        const idCliente = localStorage.getItem('clienteSeleccionadoId');
        
        if (idCliente) {
            setTimeout(() => {
                clienteSelect.value = idCliente;
                clienteSelect.dispatchEvent(new Event('change'));
                localStorage.removeItem('clienteSeleccionadoId');
            }, 100);
        }

    } catch (error) {
        console.error("Error al cargar clientes:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error de Conexión',
            text: 'No se pudo cargar la lista de clientes.'
        });
        clienteSelect.innerHTML = '<option value="">Error al cargar clientes</option>';
    }
}

clienteSelect.addEventListener('change', () => {
    const id = parseInt(clienteSelect.value);
    clienteSeleccionado = clientes.find(c => c.idCliente === id);

    if (clienteSeleccionado) {
        document.getElementById('clienteNombre').value = clienteSeleccionado.nombres;
        document.getElementById('clienteApellido').value = clienteSeleccionado.apellidos;
        document.getElementById('clienteEmail').value = clienteSeleccionado.correo || '';
        document.getElementById('clienteTelefono').value = clienteSeleccionado.telefono || '';
        document.getElementById('clienteDireccion').value = clienteSeleccionado.direccion || '';
    } else {
        form.reset();
    }
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!clienteSeleccionado) {
        Swal.fire({
            icon: 'warning',
            title: 'Atención',
            text: 'Selecciona un cliente primero para actualizar.'
        });
        return;
    }
    
    const confirmacion = await Swal.fire({
        title: '¿Estás seguro?',
        text: `Vas a actualizar los datos de ${clienteSeleccionado.nombres} ${clienteSeleccionado.apellidos}.`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#385563',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, actualizar',
        cancelButtonText: 'Cancelar'
    });

    if (!confirmacion.isConfirmed) {
        return;
    }

    const updatedCliente = {
        nombres: document.getElementById('clienteNombre').value,
        apellidos: document.getElementById('clienteApellido').value,
        correo: document.getElementById('clienteEmail').value,
        telefono: document.getElementById('clienteTelefono').value,
        direccion: document.getElementById('clienteDireccion').value
    };

    try {
        const res = await auth.fetchWithAuth(`${BASE_URL}/api/clientes/${clienteSeleccionado.idCliente}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedCliente)
        });

        if (res.ok) {
            Swal.fire({
                icon: 'success',
                title: '¡Actualizado!',
                text: 'Cliente actualizado con éxito.',
                confirmButtonColor: '#385563'
            }).then(() => {
                // Opcional: redirigir de vuelta a vistaClientes
                // window.location.href = 'vistaClientes.html';
            });
            await cargarClientes(); 
        } else {
            const errorText = await res.text();
            Swal.fire({
                icon: 'error',
                title: 'Error al actualizar',
                text: 'No se pudo actualizar el cliente.'
            });
            console.error(errorText);
        }
    } catch (error) {
        console.error("Error en la conexión:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error de Conexión',
            text: 'No se pudo conectar con el servidor para realizar la actualización.'
        });
    }
});

cargarClientes();
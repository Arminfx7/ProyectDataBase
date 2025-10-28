const BASE_URL = import.meta?.env?.API_BASE || "http://localhost:8080";
let proveedores = [];
let proveedorSeleccionado = null;

const proveedorSelect = document.getElementById('proveedorSelect');
const form = document.getElementById('updateForm');

async function cargarProveedores() {
    try {
        const res = await auth.fetchWithAuth(`${BASE_URL}/api/proveedores`);
        if (!res.ok) {
            throw new Error(`Error HTTP: ${res.status}`);
        }
        
        proveedores = await res.json();
        proveedorSelect.innerHTML = '<option value="">Selecciona un proveedor</option>';
        
        proveedores.forEach(prov => {
            const option = document.createElement('option');
            option.value = prov.idProveedor;
            option.textContent = `${prov.nombre} - ${prov.email}`;
            proveedorSelect.appendChild(option);
        });

        const idProveedor = localStorage.getItem('proveedorSeleccionadoId');
        if (idProveedor) {
            proveedorSelect.value = idProveedor;
            await cargarDatosProveedor(idProveedor);
            localStorage.removeItem('proveedorSeleccionadoId');
        }
    } catch (error) {
        console.error("Error al cargar proveedores:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error de Conexión',
            text: 'No se pudo cargar la lista de proveedores.'
        });
        proveedorSelect.innerHTML = '<option value="">Error al cargar proveedores</option>';
    }
}

async function cargarDatosProveedor(id) {
    try {
        const res = await auth.fetchWithAuth(`${BASE_URL}/api/proveedores/${id}`);
        if (!res.ok) {
            throw new Error(`Error HTTP: ${res.status}`);
        }
        
        proveedorSeleccionado = await res.json();
        
        if (proveedorSeleccionado) {
            form.nombre.value = proveedorSeleccionado.nombre || '';
            form.direccion.value = proveedorSeleccionado.direccion || '';
            form.email.value = proveedorSeleccionado.email || '';
            form.telefono.value = proveedorSeleccionado.telefono || '';
        }
    } catch (error) {
        console.error("Error al cargar datos del proveedor:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudieron cargar los datos del proveedor.'
        });
    }
}

proveedorSelect.addEventListener('change', async () => {
    const id = parseInt(proveedorSelect.value);
    if (id) {
        await cargarDatosProveedor(id);
    } else {
        proveedorSeleccionado = null;
        form.reset();
    }
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!proveedorSeleccionado) {
        Swal.fire({
            icon: 'warning',
            title: 'Atención',
            text: 'Selecciona un proveedor primero para actualizar.'
        });
        return;
    }

    const confirmacion = await Swal.fire({
        title: '¿Estás seguro?',
        text: `Vas a actualizar los datos de ${proveedorSeleccionado.nombre}.`,
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

    const updatedProveedor = {
        nombre: form.nombre.value,
        direccion: form.direccion.value,
        email: form.email.value,
        telefono: form.telefono.value,
        activo: proveedorSeleccionado.activo // Mantiene el estado actual sin cambiarlo
    };

    try {
        const res = await auth.fetchWithAuth(`${BASE_URL}/api/proveedores/${proveedorSeleccionado.idProveedor}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedProveedor)
        });

        if (res.ok) {
            Swal.fire({
                icon: 'success',
                title: '¡Actualizado!',
                text: 'Proveedor actualizado con éxito.'
            });
            await cargarProveedores();
        } else {
            const errorData = await res.json();
            Swal.fire({
                icon: 'error',
                title: 'Error al actualizar',
                text: errorData.message || `Error: ${res.status}`
            });
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

cargarProveedores();
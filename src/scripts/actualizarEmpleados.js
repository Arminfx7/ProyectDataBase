const BASE_URL = import.meta?.env?.API_BASE || "http://localhost:8080";

let empleados = [];
let empleadoSeleccionado = null;

const empleadoSelect = document.getElementById('empleadoSelect');
const form = document.getElementById('updateForm');

async function cargarEmpleados() {
    try {
        const res = await auth.fetchWithAuth(`${BASE_URL}/api/empleados`);
        if (!res.ok) {
            throw new Error(`Error HTTP: ${res.status}`);
        }
        
        empleados = await res.json();

        empleadoSelect.innerHTML = '<option value="">Selecciona un empleado</option>';
        empleados.forEach(emp => {
            const option = document.createElement('option');
            option.value = emp.idEmpleado;
            option.textContent = `${emp.nombres} ${emp.apellidos} - ${emp.rol ? emp.rol.nombreRol : 'Sin rol'}`;
            empleadoSelect.appendChild(option);
        });

        const idEmpleado = localStorage.getItem('empleadoSeleccionadoId');
        if (idEmpleado) {
            empleadoSelect.value = idEmpleado;
            empleadoSelect.dispatchEvent(new Event('change'));
            localStorage.removeItem('empleadoSeleccionadoId');
        }

    } catch (error) {
        console.error("Error al cargar empleados:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error de Conexión',
            text: 'No se pudo cargar la lista de empleados.'
        });
        empleadoSelect.innerHTML = '<option value="">Error al cargar empleados</option>';
    }
}

empleadoSelect.addEventListener('change', () => {
    const id = parseInt(empleadoSelect.value);
    empleadoSeleccionado = empleados.find(emp => emp.idEmpleado === id);

    if (empleadoSeleccionado) {
        form.nombre.value = empleadoSeleccionado.nombres;
        form.apellido.value = empleadoSeleccionado.apellidos;
        form.email.value = empleadoSeleccionado.email || '';
        form.telefono.value = empleadoSeleccionado.telefono || '';
        form.sueldo.value = empleadoSeleccionado.sueldo || '';
        form.cargo.value = empleadoSeleccionado.rol ? empleadoSeleccionado.rol.nombreRol : '';
    } else {
        form.reset();
    }
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!empleadoSeleccionado) {
        Swal.fire({
            icon: 'warning',
            title: 'Atención',
            text: 'Selecciona un empleado primero para actualizar.'
        });
        return;
    }
    
    const confirmacion = await Swal.fire({
        title: '¿Estás seguro?',
        text: `Vas a actualizar los datos de ${empleadoSeleccionado.nombres} ${empleadoSeleccionado.apellidos}.`,
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

    const updatedEmpleado = {
        nombres: form.nombre.value,
        apellidos: form.apellido.value,
        email: form.email.value,
        telefono: form.telefono.value,
        sueldo: parseFloat(form.sueldo.value),
        rol: {nombreRol: form.cargo.value },
        fechaContratacion: empleadoSeleccionado.fechaContratacion
    };

    try {
        const res = await auth.fetchWithAuth(`${BASE_URL}/api/empleados/${empleadoSeleccionado.idEmpleado}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedEmpleado)
        });

        if (res.ok) {
            Swal.fire({
                icon: 'success',
                title: '¡Actualizado!',
                text: 'Empleado actualizado con éxito.'
            });
            await cargarEmpleados(); 
        } else {
            const errorText = await res.text();
            Swal.fire({
                icon: 'error',
                title: 'Error al actualizar',
                //text: `El servidor respondió con un error: ${res.status} - ${errorText.substring(0, 100)}...`
            });
            //console.log(errorText);
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

cargarEmpleados();
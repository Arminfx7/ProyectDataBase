const BASE_URL = "http://localhost:8080/api/empleados"; 
        let empleados = [];
        let empleadoSeleccionado = null;

        const empleadoSelect = document.getElementById('empleadoSelect');
        const form = document.getElementById('updateForm');

        async function cargarEmpleados() {
            try {
                const res = await fetch(BASE_URL);
                empleados = await res.json();

                empleadoSelect.innerHTML = '<option value="">Selecciona un empleado</option>';
                empleados.forEach(emp => {
                    const option = document.createElement('option');
                    option.value = emp.idEmpleado;
                    option.textContent = `${emp.nombres} ${emp.apellidos} - ${emp.rol ? emp.rol.nombreRol : 'Sin rol'}`;
                    empleadoSelect.appendChild(option);
                });
            } catch (error) {
                console.error("Error al cargar empleados:", error);
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
            if (!empleadoSeleccionado) return alert("Selecciona un empleado primero");

            const updatedEmpleado = {
                nombres: form.nombre.value,
                apellidos: form.apellido.value,
                email: form.email.value,
                telefono: form.telefono.value,
                sueldo: parseFloat(form.sueldo.value),
                rol: { nombreRol: form.cargo.value }
            };

            try {
                const res = await fetch(`${BASE_URL}/${empleadoSeleccionado.idEmpleado}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(updatedEmpleado)
                });

                if (res.ok) {
                    alert("Empleado actualizado con éxito");
                    await cargarEmpleados(); 
                } else {
                    alert("Error al actualizar empleado");
                }
            } catch (error) {
                console.error("Error en la conexión:", error);
                alert("No se pudo conectar con el servidor");
            }
        });

        cargarEmpleados();
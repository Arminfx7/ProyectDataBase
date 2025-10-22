const BASE_URL = import.meta?.env?.API_BASE || "http://localhost:8080";

document.querySelector("form").addEventListener("submit", async (e) => {
  e.preventDefault(); 

  const empleado = {
    nombres: e.target.nombre.value,
    apellidos: e.target.apellido.value,
    email: e.target.email.value,
    telefono: e.target.telefono.value,
    sueldo: parseFloat(e.target.sueldo.value),
    fechaContratacion: new Date().toLocaleDateString('en-CA')
  };

  try {
    const response = await fetch(`${BASE_URL}/api/empleados`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(empleado)
    });

    if (response.ok) {
      const data = await response.json();
      alert("Empleado registrado con éxito");
      console.log(data);
      e.target.reset();
    } else {
      alert("Error al registrar el empleado");
    }
  } catch (e) {
    console.error(e);
  }
});

let empleados = [];

async function cargarEmpleados() {
  try {
    const response = await fetch(`${BASE_URL}/api/empleados`);
    const select = document.getElementById("empleadoSelect");

    if (response.ok) {
      empleados = await response.json();

      if (empleados.length === 0) {
        select.innerHTML = '<option value="">No hay empleados registrados</option>';
      } else {
        select.innerHTML = '<option value="">Selecciona un empleado</option>';
        empleados.forEach(emp => {
          const option = document.createElement("option");
          option.value = emp.idEmpleado;
          option.textContent = `${emp.nombres} ${emp.apellidos} (${emp.rol || 'Sin cargo'})`;
          select.appendChild(option);
        });
      }
    } else {
      select.innerHTML = '<option value="">Error al cargar empleados</option>';
    }
  } catch (e) {
    console.error(e);
    document.getElementById("empleadoSelect").innerHTML =
      '<option value="">Error de conexión</option>';
  }
}

document.getElementById("btnEliminar").addEventListener("click", async () => {

  const id = document.getElementById("empleadoSelect").value;

  if (!id) {
    alert("Por favor selecciona un empleado para eliminar");
    return;
  }

  if (!confirm("¿Seguro que desea eliminar este empleado?")) return;

  try {
    const response = await fetch(`${BASE_URL}/api/empleados/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      alert("Empleado eliminado con éxito");
      await cargarEmpleados();
    } else {
      alert("Error al eliminar el empleado");
    }
  } catch (e) {
    console.error(e);
  }
});

cargarEmpleados();
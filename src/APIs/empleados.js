const BASE_URL = import.meta?.env?.API_BASE || "http://localhost:8080";

document.querySelector("form").addEventListener("submit", async (e) => {
  e.preventDefault(); 

  const empleado = {
    nombres: e.target.nombre.value,
    apellidos: e.target.apellido.value,
    email: e.target.email.value,
    telefono: e.target.telefono.value,
    sueldo: parseFloat(e.target.sueldo.value),
    fechaContratacion: new Date().toLocaleDateString('en-CA'),
    password: e.target.password.value || null,
    rol: { idRol: parseInt(e.target.cargo.value) }
  };

  try {
    const response = await auth.fetchWithAuth(`${BASE_URL}/api/empleados`, {
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
    const response = await auth.fetchWithAuth(`${BASE_URL}/api/empleados`);
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

// generar contraseña para los empleados ER xd
function generarPassword() {
  const longitud = 5
  const caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < longitud; i++) {
    password += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  return password;
}

document.getElementById("btnGenerar").addEventListener("click", () => {
  const nuevaPassword = generarPassword();
  document.getElementById("passwordGenerada").value = nuevaPassword;
  alert(`Contraseña generada: ${nuevaPassword}`);
});

cargarEmpleados();
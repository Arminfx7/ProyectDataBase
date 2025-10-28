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
      await Swal.fire({
        icon: 'success',
        title: '¡Empleado Registrado!',
        text: `${empleado.nombres} ${empleado.apellidos} ha sido agregado exitosamente`,
        confirmButtonColor: '#385563',
        timer: 3000,
        showConfirmButton: true
      });
      console.log(data);
      e.target.reset();
      cargarEmpleados(); // Recargar la lista
    } else {
      const errorData = await response.json().catch(() => ({}));
      Swal.fire({
        icon: 'error',
        title: 'Error al Registrar',
        text: errorData.message || 'No se pudo registrar el empleado. Verifica los datos ingresados.',
        confirmButtonColor: '#385563'
      });
    }
  } catch (e) {
    console.error(e);
    Swal.fire({
      icon: 'error',
      title: 'Error de Conexión',
      text: 'No se pudo conectar con el servidor. Intenta nuevamente.',
      confirmButtonColor: '#385563'
    });
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
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'No se pudieron cargar los empleados',
        confirmButtonColor: '#385563',
        toast: true,
        position: 'top-end',
        timer: 3000,
        showConfirmButton: false
      });
    }
  } catch (e) {
    console.error(e);
    document.getElementById("empleadoSelect").innerHTML =
      '<option value="">Error de conexión</option>';
    Swal.fire({
      icon: 'error',
      title: 'Error de Conexión',
      text: 'No se pudo cargar la lista de empleados',
      confirmButtonColor: '#385563',
      toast: true,
      position: 'top-end',
      timer: 3000,
      showConfirmButton: false
    });
  }
}

// generar contraseña para los empleados ER xd
function generarPassword() {
  const longitud = 5;
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
  
  Swal.fire({
    icon: 'success',
    title: 'Contraseña Generada',
    html: `
      <p>Nueva contraseña generada:</p>
      <div style="background: #f0f0f0; padding: 15px; border-radius: 8px; font-family: monospace; font-size: 18px; font-weight: bold; margin: 10px 0;">
        ${nuevaPassword}
      </div>
      <p style="color: #666; font-size: 14px; margin-top: 10px;">
        <strong>Importante:</strong> Guarda esta contraseña en un lugar seguro.
      </p>
    `,
    confirmButtonColor: '#385563',
    confirmButtonText: 'Entendido'
  });
});

cargarEmpleados();
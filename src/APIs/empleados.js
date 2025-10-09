document.querySelector("form").addEventListener("submit", async (e) => {
  e.preventDefault(); 

  const empleado = {
    nombres: e.target.nombre.value,
    apellidos: e.target.apellido.value,
    email: e.target.email.value,
    telefono: e.target.telefono.value,
    sueldo: parseFloat(e.target.sueldo.value),
    fechaContratacion: new Date().toISOString().split('T')[0]
  };

  try {
    const response = await fetch("http://localhost:8080/api/empleados", {
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
  } catch (error) {
    console.error("Error en la conexión:", error);
    alert("No se pudo conectar con el servidor");
  }
});


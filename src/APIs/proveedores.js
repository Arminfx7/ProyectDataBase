const BASE_URL = import.meta?.env?.API_BASE || "http://localhost:8080";

document.querySelector("form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const proveedor = {
    nombre: e.target.nombre.value,
    direccion: e.target.direccion.value,
    email: e.target.email.value,
    telefono: e.target.telefono.value,
    fecha_creacion: new Date().toLocaleDateString('en-CA')
  };

  try {
    const response = await auth.fetchWithAuth(`${BASE_URL}/api/proveedores`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(proveedor)
    });

    if (response.ok) {
      const data = await response.json();
      alert("Proveedor registrado con éxito");
      console.log(data);
      e.target.reset();
    } else {
      alert("Error al registrar el proveedor");
    }
  } catch (error) {
    console.error("Error en la conexión:", error);
    alert("No se pudo conectar con el servidor");
  }
});

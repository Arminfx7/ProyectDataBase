const API_BASE_URL = 'http://localhost:8080/api/repuestos';

let repuestos = [];
let citas = [];
let repuestoSeleccionado = null;

// ------------------- Cargar Repuestos -------------------
async function cargarRepuestos() {
    try {
        console.log('Cargando repuestos desde:', API_BASE_URL);
        const response = await fetch(API_BASE_URL);

        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

        const data = await response.json();
        console.log('Datos recibidos:', data);
        repuestos = data;

        renderRepuestos(repuestos);
    } catch (error) {
        console.error('Error:', error);
        mostrarError('No se pudieron cargar los repuestos: ' + error.message);
    }
}

// ------------------- Renderizado -------------------
function renderRepuestos(repuestosToShow) {
    const grid = document.getElementById('repuestosGrid');
    if (!grid) return;
    grid.innerHTML = '';

    if (!Array.isArray(repuestosToShow)) {
        mostrarError('Error: Los datos recibidos no tienen el formato correcto');
        return;
    }

    if (repuestosToShow.length === 0) {
        grid.innerHTML = `<div class="no-products"><p>No se encontraron repuestos</p></div>`;
        actualizarMetricas(0, 0);
        return;
    }

    repuestosToShow.forEach(rep => {
        const stockClass = rep.stock <= 10 ? "low" : "ok";
        const stockLabel = rep.stock <= 10 ? "Bajo Stock" : "Disponible";
        const imagen = 'http://localhost:8080' + rep.fotoPath;
        const descripcion = rep.descripcion || 'Sin descripción';
        const precio = rep.precio || 0;
        const stock = rep.stock || 0;

        grid.innerHTML += `
            <div class="product-card">
                <div class="product-img">
                    <img src="${imagen}" alt="${rep.nombre}" onerror="this.src='https://cdn-icons-png.flaticon.com/512/29/29302.png'">
                </div>
                <div class="product-title">${rep.nombre}</div>
                <div class="product-desc">${descripcion}</div>
                <div class="product-info-row">
                    <span class="product-stock ${stockClass}">${stockLabel}: ${stock}</span>
                    <span class="price-tag">Q${precio}</span>
                </div>
                <button class="btn-add" onclick="abrirModalAsignar(${rep.idRepuesto}, '${rep.nombre}', ${rep.stock})">Asignar a Cita</button>
            </div>
        `;
    });

    const lowStockCount = repuestosToShow.filter(p => (p.stock || 0) <= 10).length;
    actualizarMetricas(repuestosToShow.length, lowStockCount);
}

// ------------------- Actualizar métricas -------------------
function actualizarMetricas(totalCount, lowStockCount) {
    const repuestoCountElement = document.getElementById('repuestoCount');
    const lowStockCountElement = document.getElementById('lowStockCount');
    if (repuestoCountElement) repuestoCountElement.innerText = totalCount;
    if (lowStockCountElement) lowStockCountElement.innerText = lowStockCount;
}

// ------------------- Filtro -------------------
function filterRepuestos() {
    const query = document.getElementById('searchInput').value.trim().toLowerCase();
    if (query === '') {
        renderRepuestos(repuestos);
    } else {
        const filtered = repuestos.filter(r =>
            (r.nombre && r.nombre.toLowerCase().includes(query)) ||
            (r.descripcion && r.descripcion.toLowerCase().includes(query))
        );
        renderRepuestos(filtered);
    }
}

// ------------------- Cargar Citas -------------------
async function cargarCitas() {
    try {
        const res = await fetch('http://localhost:8080/api/citas');
        if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
        citas = await res.json();
        console.log('Citas cargadas:', citas);
    } catch (err) {
        console.error('Error al cargar citas:', err);
        alert('No se pudieron cargar las citas');
    }
}

// ------------------- Modal para asignar -------------------
function abrirModalAsignar(idRepuesto, nombre, stock) {
    repuestoSeleccionado = { idRepuesto, nombre, stock };
    document.getElementById('repuestoNombre').innerText = `Repuesto: ${nombre} (Stock: ${stock})`;
    document.getElementById('cantidadInput').max = stock;
    document.getElementById('cantidadInput').value = 1;

    const select = document.getElementById('citaSelect');
    select.innerHTML = '<option value="">--Seleccione--</option>';
    
    // Filtrar solo citas activas o pendientes si es necesario
    citas.forEach(c => {
        // Formatear la fecha para mejor visualización
        const fecha = new Date(c.fechaCita).toLocaleDateString();
        select.innerHTML += `<option value="${c.idCita}">${c.motivo} - ${fecha}</option>`;
    });

    document.getElementById('modalAsignar').style.display = 'block';
}

function cerrarModal() {
    document.getElementById('modalAsignar').style.display = 'none';
    repuestoSeleccionado = null;
}

// ------------------- Confirmar Asignación -------------------
async function confirmarAsignacion() {
    const idCita = document.getElementById('citaSelect').value;
    const cantidad = parseInt(document.getElementById('cantidadInput').value);
    
    if (!repuestoSeleccionado) {
        alert('No hay repuesto seleccionado.');
        return;
    }

    if (!idCita) {
        alert('Por favor selecciona una cita.');
        return;
    }

    if (!cantidad || cantidad < 1) {
        alert('Por favor ingresa una cantidad válida.');
        return;
    }

    if (cantidad > repuestoSeleccionado.stock) {
        alert(`No hay suficiente stock. Stock disponible: ${repuestoSeleccionado.stock}`);
        return;
    }

    console.log('Enviando asignación:', {
        idCita: idCita,
        idRepuesto: repuestoSeleccionado.idRepuesto,
        cantidad: cantidad
    });

    try {
        // Construir URL con parámetros
        const url = `http://localhost:8080/api/citaRepuestos/asignar?idCita=${idCita}&idRepuesto=${repuestoSeleccionado.idRepuesto}&cantidad=${cantidad}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log("Asignación creada exitosamente:", data);
        
        alert('Repuesto asignado correctamente a la cita.');
        
        // Actualizar el stock localmente
        const repuestoIndex = repuestos.findIndex(r => r.idRepuesto === repuestoSeleccionado.idRepuesto);
        if (repuestoIndex !== -1) {
            repuestos[repuestoIndex].stock -= cantidad;
        }
        
        cerrarModal();
        
        // Recargar la lista para reflejar cambios
        cargarRepuestos();

    } catch (error) {
        console.error("Error al asignar repuesto:", error);
        alert('Error al asignar el repuesto: ' + error.message);
    }
}

// ------------------- Mostrar error -------------------
function mostrarError(mensaje) {
    const grid = document.getElementById('repuestosGrid');
    if (grid) {
        grid.innerHTML = `
            <div class="error-message">
                <p>${mensaje}</p>
                <button onclick="cargarRepuestos()">Reintentar</button>
            </div>
        `;
        actualizarMetricas(0, 0);
    }
}

// ------------------- Inicialización -------------------
document.addEventListener('DOMContentLoaded', () => {
    cargarRepuestos();
    cargarCitas();

    // Cerrar modal si se hace click fuera de él
    window.onclick = function(event) {
        const modal = document.getElementById('modalAsignar');
        if (event.target == modal) cerrarModal();
    };
});
const API_BASE = 'http://localhost:8080/api';

const totalClientesElement = document.getElementById('totalClientes');
const totalCitasElement = document.getElementById('totalCitas');
const totalVehiculosElement = document.getElementById('totalVehiculos');
const totalRepuestosElement = document.getElementById('totalRepuestos');
const clientesActivosElement = document.getElementById('clientesActivos');
const citasPendientesElement = document.getElementById('citasPendientes');
const marcaPopularElement = document.getElementById('marcaPopular');
const stockBajoElement = document.getElementById('stockBajo');
const citasCompletadasElement = document.getElementById('citasCompletadas');
const vehiculosUnicosElement = document.getElementById('vehiculosUnicos');
const stockTotalElement = document.getElementById('stockTotal');
const citasCountElement = document.getElementById('citasCount');
const stockBajoCountElement = document.getElementById('stockBajoCount');
const citasBodyElement = document.getElementById('citasBody');
const repuestosBodyElement = document.getElementById('repuestosBody');
const searchInput = document.getElementById('searchInput');
const refreshBtn = document.getElementById('refreshBtn');

let citasChart = null;
let marcasChart = null;

async function obtenerClientes() {
    try {
        const response = await auth.fetchWithAuth(`${API_BASE}/clientes`);
        if (!response.ok) throw new Error('Error al obtener clientes');
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

async function obtenerCitas() {
    try {
        const response = await auth.fetchWithAuth(`${API_BASE}/dashboard/resumen`);
        if (!response.ok) throw new Error('Error al obtener resumen de citas');
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

async function obtenerVehiculos() {
    try {
        const response = await auth.fetchWithAuth(`${API_BASE}/vehiculos`);
        if (!response.ok) throw new Error('Error al obtener vehículos');
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

async function obtenerRepuestos() {
    try {
        const response = await auth.fetchWithAuth(`${API_BASE}/repuestos`);
        if (!response.ok) throw new Error('Error al obtener repuestos');
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

function contarClientesActivos(clientes) {
    return clientes.filter(cliente => cliente.activo === true).length;
}

function contarCitasPorEstado(citas) {
    const estados = {};
    citas.forEach(cita => {
        const estado = cita.estado || 'PENDIENTE';
        estados[estado] = (estados[estado] || 0) + 1;
    });
    return estados;
}

function contarVehiculosPorMarca(vehiculos) {
    const marcas = {};
    vehiculos.forEach(v => {
        const marca = v.marca || 'Sin marca';
        marcas[marca] = (marcas[marca] || 0) + 1;
    });
    return marcas;
}

function calcularEstadisticasRepuestos(repuestos) {
    const activos = repuestos.filter(r => r.activo === true);
    const stockBajo = activos.filter(r => r.stock < 10).length;
    const stockTotal = activos.reduce((sum, r) => sum + (r.stock || 0), 0);
    return { activos: activos.length, stockBajo, stockTotal };
}

function formatearFecha(fechaString) {
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-ES');
}

function formatearHora(horaString) {
    if (!horaString) return '';
    const hora = new Date(`1970-01-01T${horaString}`);
    return hora.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

function formatearMoneda(valor) {
    return 'Q.' + Number(valor).toLocaleString('es-GT', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function mostrarCitasRecientes(citas) {
    if (!Array.isArray(citas) || citas.length === 0) {
        citasBodyElement.innerHTML = '<tr><td colspan="7" class="loading">No hay citas registradas</td></tr>';
        citasCountElement.textContent = 'Mostrando 0 citas';
        return;
    }
    const citasOrdenadas = [...citas].sort((a, b) => {
        const fechaA = new Date(a.fechaCita + 'T' + a.horaCita);
        const fechaB = new Date(b.fechaCita + 'T' + b.horaCita);
        return fechaB - fechaA;
    });

    const citasRecientes = citasOrdenadas.slice(0, 10);

    citasBodyElement.innerHTML = citasRecientes.map(cita => {
        const estadoClass = (cita.estado || 'PENDIENTE').toLowerCase().replace(/\s/g, '');
        return `
            <tr>
                <td>${cita.vehiculo}</td>
                <td>${cita.cliente}</td>
                <td>${formatearFecha(cita.fechaCita)} ${formatearHora(cita.horaCita)}</td>
                <td>${cita.vehiculo.match(/\((.*?)\)/)?.[1] || 'N/A'}</td>
                <td>${cita.motivo}</td>
                <td><span class="estado ${estadoClass}">${cita.estado}</span></td>
            </tr>
        `;
    }).join('');

    citasCountElement.textContent = `Mostrando ${citasRecientes.length} de ${citas.length} citas`;
}

function mostrarRepuestosStockBajo(repuestos) {
    console.log('Repuestos recibidos:', repuestos);
    const repuestosActivos = repuestos.filter(r => r.activo === true);
    const stockBajo = repuestosActivos.filter(r => r.stock < 10);
    console.log('Stock bajo:', stockBajo);

    if (stockBajo.length === 0) {
        repuestosBodyElement.innerHTML = '<tr><td colspan="5" class="loading">No hay repuestos con stock bajo</td></tr>';
        stockBajoCountElement.textContent = '0 repuestos con stock bajo';
        return;
    }

    repuestosBodyElement.innerHTML = stockBajo.map(repuesto => {
        const estadoStock = repuesto.stock === 0 ? 'Agotado' : 'Bajo';
        const estadoClass = repuesto.stock === 0 ? 'cancelada' : 'pendiente';

        return `
            <tr>
                <td>${repuesto.nombre || 'N/A'}</td>
                <td>${repuesto.descripcion || 'Sin descripción'}</td>
                <td>${formatearMoneda(repuesto.precio || 0)}</td>
                <td>${repuesto.stock || 0}</td>
                <td>
                    <span class="estado ${estadoClass}">
                        ${estadoStock}
                    </span>
                </td>
            </tr>
        `;
    }).join('');

    stockBajoCountElement.textContent = `${stockBajo.length} repuestos con stock bajo`;
}

function crearGraficoCitas(citas) {
    const ctx = document.getElementById('citasChart').getContext('2d');
    const estados = contarCitasPorEstado(citas);

    if (citasChart) citasChart.destroy();

    citasChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(estados),
            datasets: [{
                data: Object.values(estados),
                backgroundColor: [
                    '#fbbf24', // Pendiente
                    '#10b981', // Confirmada
                    '#3b82f6', // Completada
                    '#ef4444', // Cancelada
                    '#6b7280'  // Otros
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { boxWidth: 12, font: { size: 10 } }
                }
            }
        }
    });
}

function crearGraficoMarcas(vehiculos) {
    const ctx = document.getElementById('marcasChart').getContext('2d');
    const marcas = contarVehiculosPorMarca(vehiculos);

    const marcasOrdenadas = Object.entries(marcas)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    if (marcasChart) marcasChart.destroy();

    marcasChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: marcasOrdenadas.map(m => m[0]),
            datasets: [{
                label: 'Vehículos',
                data: marcasOrdenadas.map(m => m[1]),
                backgroundColor: '#3498db',
                borderColor: '#2980b9',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, ticks: { stepSize: 1, font: { size: 10 } } },
                x: { ticks: { font: { size: 10 } } }
            },
            plugins: { legend: { display: false } }
        }
    });
}

function buscarCitas(termino) {
    const filas = citasBodyElement.getElementsByTagName('tr');
    const terminoLower = termino.toLowerCase();
    let resultados = 0;

    for (let fila of filas) {
        const textoFila = fila.textContent.toLowerCase();
        if (textoFila.includes(terminoLower)) {
            fila.style.display = '';
            resultados++;
        } else {
            fila.style.display = 'none';
        }
    }

    citasCountElement.textContent = `Mostrando ${resultados} resultados de búsqueda`;
}

async function actualizarDashboard() {
    try {
        citasBodyElement.innerHTML = '<tr><td colspan="7" class="loading">Cargando datos...</td></tr>';
        repuestosBodyElement.innerHTML = '<tr><td colspan="5" class="loading">Cargando datos...</td></tr>';

        const [clientes, citas, vehiculos, repuestos] = await Promise.all([
            obtenerClientes(),
            obtenerCitas(),
            obtenerVehiculos(),
            obtenerRepuestos()
        ]);

        const clientesActivos = contarClientesActivos(clientes);
        const estadisticasCitas = contarCitasPorEstado(citas);
        const estadisticasRepuestos = calcularEstadisticasRepuestos(repuestos);
        const marcas = contarVehiculosPorMarca(vehiculos);
        const marcaPopular = Object.entries(marcas).sort((a, b) => b[1] - a[1])[0];

        totalClientesElement.textContent = clientesActivos;
        totalCitasElement.textContent = citas.length;
        totalVehiculosElement.textContent = vehiculos.length;
        totalRepuestosElement.textContent = estadisticasRepuestos.activos;

        clientesActivosElement.textContent = `${clientesActivos} activos`;
        citasPendientesElement.textContent = `${estadisticasCitas['PENDIENTE'] || 0} pendientes`;
        marcaPopularElement.textContent = marcaPopular ? `${marcaPopular[0]} (${marcaPopular[1]})` : 'Sin datos';
        stockBajoElement.textContent = `${estadisticasRepuestos.stockBajo} con stock bajo`;
        citasCompletadasElement.textContent = estadisticasCitas['Completada'] || 0;
        vehiculosUnicosElement.textContent = new Set(vehiculos.map(v => v.placa)).size;
        stockTotalElement.textContent = estadisticasRepuestos.stockTotal;

        mostrarCitasRecientes(citas);
        mostrarRepuestosStockBajo(repuestos);

        crearGraficoCitas(citas);
        crearGraficoMarcas(vehiculos);

    } catch (error) {
        console.error('Error al actualizar dashboard:', error);
        citasBodyElement.innerHTML = '<tr><td colspan="7" class="error">Error al cargar las citas</td></tr>';
        repuestosBodyElement.innerHTML = '<tr><td colspan="5" class="error">Error al cargar los repuestos</td></tr>';
    }
}

function verDetalleCita(id) {
    alert(`Ver detalle de cita ${id} - Esta funcionalidad se implementará posteriormente`);
}

searchInput.addEventListener('input', (e) => {
    buscarCitas(e.target.value);
});

refreshBtn.addEventListener('click', () => {
    refreshBtn.textContent = 'Actualizando...';
    refreshBtn.disabled = true;

    actualizarDashboard().finally(() => {
        setTimeout(() => {
            refreshBtn.textContent = 'Actualizar Datos';
            refreshBtn.disabled = false;
        }, 1000);
    });
});

document.addEventListener('DOMContentLoaded', () => {
    actualizarDashboard();
    setInterval(actualizarDashboard, 60000);
});

// Base de datos simulada (en memoria)
const db = {
    clientes: [],
    empleados: [],
    vehiculos: [],
    citas: [],
    servicios: [],
    repuestos: [],
    productos: [],
    proveedores: [],
    facturas: [],
    detalleFactura: [],
    citaServicios: [],
    citaRepuestos: [],
    pagos: []
};

// IDs autoincrementales
let ids = {
    cliente: 1,
    empleado: 1,
    vehiculo: 1,
    cita: 1,
    servicio: 1,
    repuesto: 1,
    producto: 1,
    proveedor: 1,
    factura: 1,
    pago: 1
};

// Inicializar datos de ejemplo
function initializeData() {
    // Proveedores
    db.proveedores = [
        { idProveedor: ids.proveedor++, nombre: 'AutoPartes SA', telefono: '555-0100', email: 'ventas@autopartes.com', direccion: 'Av. Principal 123' },
        { idProveedor: ids.proveedor++, nombre: 'Repuestos Express', telefono: '555-0200', email: 'info@repuestosexpress.com', direccion: 'Calle 45 #67' }
    ];

    // Empleados
    db.empleados = [
        { idEmpleado: ids.empleado++, nombre: 'Carlos Méndez', puesto: 'Mecánico Senior', telefono: '555-1001', email: 'carlos@autotech.com' },
        { idEmpleado: ids.empleado++, nombre: 'Ana García', puesto: 'Mecánica', telefono: '555-1002', email: 'ana@autotech.com' },
        { idEmpleado: ids.empleado++, nombre: 'Roberto López', puesto: 'Técnico Eléctrico', telefono: '555-1003', email: 'roberto@autotech.com' }
    ];

    // Servicios
    db.servicios = [
        { idServicio: ids.servicio++, nombre: 'Cambio de Aceite', descripcion: 'Cambio de aceite y filtro', precio: 45.00 },
        { idServicio: ids.servicio++, nombre: 'Alineación y Balanceo', descripcion: 'Servicio completo de alineación', precio: 60.00 },
        { idServicio: ids.servicio++, nombre: 'Revisión de Frenos', descripcion: 'Inspección completa del sistema', precio: 35.00 },
        { idServicio: ids.servicio++, nombre: 'Diagnóstico General', descripcion: 'Escaneo computarizado', precio: 50.00 }
    ];

    // Repuestos
    db.repuestos = [
        { idRepuesto: ids.repuesto++, nombre: 'Filtro de Aceite', descripcion: 'Universal', precio: 12.00, stock: 25, idProveedor: 1 },
        { idRepuesto: ids.repuesto++, nombre: 'Pastillas de Freno', descripcion: 'Juego completo', precio: 65.00, stock: 8, idProveedor: 1 },
        { idRepuesto: ids.repuesto++, nombre: 'Batería 12V', descripcion: '75Ah', precio: 120.00, stock: 5, idProveedor: 2 },
        { idRepuesto: ids.repuesto++, nombre: 'Bujías', descripcion: 'Set de 4', precio: 28.00, stock: 15, idProveedor: 2 }
    ];

    // Productos
    db.productos = [
        { idProducto: ids.producto++, nombre: 'Aceite 10W-40', precio: 35.00, stock: 30, idProveedor: 1 },
        { idProducto: ids.producto++, nombre: 'Limpia Parabrisas', precio: 8.00, stock: 50, idProveedor: 2 },
        { idProducto: ids.producto++, nombre: 'Refrigerante', precio: 18.00, stock: 20, idProveedor: 1 }
    ];

    // Clientes
    db.clientes = [
        { idCliente: ids.cliente++, nombre: 'Juan Pérez', telefono: '555-2001', email: 'juan@email.com', direccion: 'Zona 1, Ciudad' },
        { idCliente: ids.cliente++, nombre: 'María López', telefono: '555-2002', email: 'maria@email.com', direccion: 'Zona 2, Ciudad' },
        { idCliente: ids.cliente++, nombre: 'Pedro Ramírez', telefono: '555-2003', email: 'pedro@email.com', direccion: 'Zona 3, Ciudad' }
    ];

    // Vehículos
    db.vehiculos = [
        { idVehiculo: ids.vehiculo++, idCliente: 1, marca: 'Toyota', modelo: 'Corolla', año: 2020, placa: 'ABC-123' },
        { idVehiculo: ids.vehiculo++, idCliente: 1, marca: 'Honda', modelo: 'Civic', año: 2019, placa: 'DEF-456' },
        { idVehiculo: ids.vehiculo++, idCliente: 2, marca: 'Nissan', modelo: 'Sentra', año: 2021, placa: 'GHI-789' },
        { idVehiculo: ids.vehiculo++, idCliente: 3, marca: 'Mazda', modelo: 'CX-5', año: 2022, placa: 'JKL-012' }
    ];

    // Citas
    const today = new Date();
    db.citas = [
        { 
            idCita: ids.cita++, 
            idCliente: 1, 
            idVehiculo: 1, 
            idEmpleado: 1, 
            fecha: today.toISOString().split('T')[0], 
            estado: 'Pendiente', 
            observaciones: 'Cliente reporta ruido en motor',
            razon: 'Mantenimiento preventivo'
        },
        { 
            idCita: ids.cita++, 
            idCliente: 2, 
            idVehiculo: 3, 
            idEmpleado: 2, 
            fecha: today.toISOString().split('T')[0], 
            estado: 'En Proceso', 
            observaciones: 'Cambio de aceite programado',
            razon: 'Servicio regular'
        }
    ];

    updateDashboard();
}

// Navegación
document.addEventListener('DOMContentLoaded', () => {
    initializeData();
    
    // Menu toggle para móvil
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });

    // Navegación entre secciones
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Actualizar active en nav
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Mostrar sección correspondiente
            const sectionName = item.dataset.section;
            showSection(sectionName);
            
            // Cerrar sidebar en móvil
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('active');
            }
        });
    });

    // Modal
    const modal = document.getElementById('modal');
    const modalClose = document.getElementById('modalClose');
    
    modalClose.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
});

function showSection(sectionName) {
    // Ocultar todas las secciones
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.classList.remove('active'));
    
    const dynamicSection = document.getElementById('dynamicSection');
    
    if (sectionName === 'dashboard') {
        document.getElementById('dashboard').classList.add('active');
        dynamicSection.innerHTML = '';
        updateDashboard();
    } else {
        document.getElementById('dashboard').classList.remove('active');
        loadSection(sectionName, dynamicSection);
    }
}

function loadSection(sectionName, container) {
    const sections = {
        clientes: renderClientes,
        empleados: renderEmpleados,
        vehiculos: renderVehiculos,
        citas: renderCitas,
        servicios: renderServicios,
        repuestos: renderRepuestos,
        productos: renderProductos,
        proveedores: renderProveedores,
        facturas: renderFacturas
    };
    
    if (sections[sectionName]) {
        container.innerHTML = sections[sectionName]();
        attachEventListeners(sectionName);
    }
}

// Dashboard
function updateDashboard() {
    document.getElementById('totalCitas').textContent = db.citas.filter(c => c.fecha === new Date().toISOString().split('T')[0]).length;
    document.getElementById('totalClientes').textContent = db.clientes.length;
    document.getElementById('totalVehiculos').textContent = db.vehiculos.length;
    
    // Calcular ingresos del mes
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const ingresos = db.facturas
        .filter(f => {
            const facturaDate = new Date(f.fecha);
            return facturaDate.getMonth() === currentMonth && facturaDate.getFullYear() === currentYear;
        })
        .reduce((sum, f) => sum + f.total, 0);
    
    document.getElementById('ingresosMes').textContent = `$${ingresos.toFixed(2)}`;
    
    // Citas recientes
    const recentCitasTable = document.getElementById('recentCitasTable').getElementsByTagName('tbody')[0];
    recentCitasTable.innerHTML = '';
    
    db.citas.slice(0, 5).forEach(cita => {
        const cliente = db.clientes.find(c => c.idCliente === cita.idCliente);
        const vehiculo = db.vehiculos.find(v => v.idVehiculo === cita.idVehiculo);
        const row = recentCitasTable.insertRow();
        row.innerHTML = `
            <td>${cliente?.nombre || 'N/A'}</td>
            <td>${vehiculo ? `${vehiculo.marca} ${vehiculo.modelo}` : 'N/A'}</td>
            <td>${formatDate(cita.fecha)}</td>
            <td><span class="badge-status badge-${getStatusClass(cita.estado)}">${cita.estado}</span></td>
        `;
    });
    
    // Repuestos con stock bajo
    const lowStockTable = document.getElementById('lowStockTable').getElementsByTagName('tbody')[0];
    lowStockTable.innerHTML = '';
    
    const lowStock = db.repuestos.filter(r => r.stock < 10).slice(0, 5);
    lowStock.forEach(repuesto => {
        const row = lowStockTable.insertRow();
        row.innerHTML = `
            <td>${repuesto.nombre}</td>
            <td><span class="badge-status badge-${repuesto.stock < 5 ? 'danger' : 'warning'}">${repuesto.stock}</span></td>
            <td><button class="btn btn-sm btn-primary">Ordenar</button></td>
        `;
    });
}


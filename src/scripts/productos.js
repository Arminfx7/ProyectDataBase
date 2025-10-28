const API_BASE_URL = import.meta?.env?.API_BASE || "http://localhost:8080/api/productos";
let productos = [];

// ------------------- Cargar Productos -------------------
async function cargarProductos() {
    try {
        console.log('Cargando productos desde:', API_BASE_URL);
        const response = await auth.fetchWithAuth(API_BASE_URL);
        
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        
        const data = await response.json();
        console.log('Datos recibidos:', data);
        
        productos = data;
        renderProducts(productos);
        
    } catch (error) {
        console.error('Error:', error);
        mostrarError('No se pudieron cargar los productos: ' + error.message);
    }
}

// ------------------- Renderizado -------------------
function renderProducts(productsToShow) {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = '';

    if (!Array.isArray(productsToShow)) {
        mostrarError('Error: Los datos recibidos no tienen el formato correcto');
        return;
    }

    if (productsToShow.length === 0) {
        grid.innerHTML = `<div class="no-products"><p>No se encontraron productos</p></div>`;
        document.getElementById('productCount').innerText = '0';
        document.getElementById('lowStockCount').innerText = '0';
        return;
    }

    productsToShow.forEach(prod => {
        const stockClass = prod.stock <= 10 ? "low" : "ok";
        const stockLabel = prod.stock <= 10 ? "Bajo Stock" : "Disponible";
        const imagen = 'http://localhost:8080' + prod.fotoPath;
        const descripcion = prod.descripcion || 'Sin descripción';
        const precio = prod.precio || 0;
        const stock = prod.stock || 0;
        
        grid.innerHTML += `
            <div class="product-card">
                <div class="product-img">
                    <img src="${imagen}" alt="${prod.nombre}" onerror="this.src='https://cdn-icons-png.flaticon.com/512/29/29302.png'">
                </div>
                <div class="product-title">${prod.nombre}</div>
                <div class="product-desc">${descripcion}</div>
                <div class="product-info-row">
                    <span class="product-stock ${stockClass}">${stockLabel}: ${stock}</span>
                    <span class="price-tag">Q${precio}</span>
                </div>
                <button class="btn-add">Agregar</button>
            </div>
        `;
    });

    document.getElementById('productCount').innerText = productsToShow.length;
    document.getElementById('lowStockCount').innerText = productsToShow.filter(p => (p.stock || 0) <= 10).length;
}

// ------------------- Búsqueda -------------------
function filterProducts() {
    aplicarFiltros();
}

// ------------------- Filtros -------------------
function aplicarFiltros() {
    let filtrados = [...productos];

    // Checkbox: solo bajo stock
    if (document.getElementById("filtrarStockBajo").checked) {
        filtrados = filtrados.filter(r => (r.stock || 0) <= 10);
    }

    // Checkbox: ordenar por nombre
    if (document.getElementById("filtrarNombre").checked) {
        filtrados.sort((a, b) => a.nombre.localeCompare(b.nombre));
    }

    // Aplicar búsqueda también
    const term = document.getElementById("searchInput").value.trim().toLowerCase();
    if (term) {
        filtrados = filtrados.filter(r =>
            (r.nombre && r.nombre.toLowerCase().includes(term)) ||
            (r.descripcion && r.descripcion.toLowerCase().includes(term))
        );
    }

    renderProducts(filtrados);
}

// ------------------- Mostrar error -------------------
function mostrarError(mensaje) {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = `
        <div class="error-message">
            <p>${mensaje}</p>
            <button onclick="cargarProductos()">Reintentar</button>
        </div>
    `;
}

// ------------------- Inicialización -------------------
document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();

    // Escuchar cambios en los filtros
    document.getElementById("filtrarNombre").addEventListener("change", aplicarFiltros);
    document.getElementById("filtrarStockBajo").addEventListener("change", aplicarFiltros);
    document.getElementById("searchInput").addEventListener("input", aplicarFiltros);
});

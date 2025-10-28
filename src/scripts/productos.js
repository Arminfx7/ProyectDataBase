const API_BASE_URL = 'http://localhost:8080/api/productos';

let productos = [];

async function cargarProductos() {
    try {
        console.log('Cargando productos desde:', API_BASE_URL);
        const response = await auth.fetchWithAuth(API_BASE_URL);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Datos recibidos:', data);
        console.log('Tipo de datos:', typeof data);
        console.log('Cantidad de productos:', data.length);
        
        productos = data;
        renderProducts(productos);
        
    } catch (error) {
        console.error('Error:', error);
        mostrarError('No se pudieron cargar los productos: ' + error.message);
    }
}

function renderProducts(productsToShow) {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = '';
    
    console.log('Renderizando productos:', productsToShow);
    
    // Verifica si es un array
    if (!Array.isArray(productsToShow)) {
        console.error('Los datos no son un array:', productsToShow);
        mostrarError('Error: Los datos recibidos no tienen el formato correcto');
        return;
    }
    
    if (productsToShow.length === 0) {
        grid.innerHTML = `
            <div class="no-products">
                <p>No se encontraron productos</p>
            </div>
        `;
        document.getElementById('productCount').innerText = '0';
        document.getElementById('lowStockCount').innerText = '0';
        return;
    }
    
    productsToShow.forEach(prod => {
    let stockClass = prod.stock <= 10 ? "low" : "ok";
    let stockLabel = prod.stock <= 10 ? "Bajo Stock" : "Disponible";

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
    document.getElementById('lowStockCount').innerText = productsToShow.filter(p => (p.stock || 0) <= 5).length;
}

function filterProducts() {
    const query = document.getElementById('searchInput').value.trim().toLowerCase();
    
    if (query === '') {
        renderProducts(productos);
    } else {
        const filtered = productos.filter(p =>
            p.nombre.toLowerCase().includes(query) ||
            (p.descripcion && p.descripcion.toLowerCase().includes(query))
        );
        renderProducts(filtered);
    }
}

function mostrarError(mensaje) {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = `
        <div class="error-message">
            <p>${mensaje}</p>
            <button onclick="cargarProductos()">Reintentar</button>
        </div>
    `;
}

// Cargar productos cuando la página se carga
document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();
});
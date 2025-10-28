const BASE_URL = import.meta?.env?.API_BASE || "http://localhost:8080";
const grid = document.getElementById('proveedoresGrid');
let proveedores = [];

async function cargarProveedores() {
    try {
        const response = await fetch(`${BASE_URL}/api/proveedores`);
        let data = await response.json();

        proveedores = data.filter(p => p.activo === true);

        mostrarProveedores(proveedores);
    } catch (e) {
        console.error("Error al cargar proveedores:", e);
    }
}

function mostrarProveedores(lista) {
    grid.innerHTML = '';
    lista.forEach(p => {
        const card = document.createElement('div');
        card.classList.add('employee-card');
        card.innerHTML = `
            <div class="employee-header">
                <div class="employee-name">${p.nombre}</div>
                <div class="employee-position">${p.direccion}</div>
                <div class="employee-position">${p.email}</div>
                <div class="employee-position">${p.telefono}</div>
            </div>
            <div class="employee-avatar">
                <div class="avatar-circle">
                    <svg class="avatar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                </div>
            </div>
            <button class="view-more-btn">Opciones</button>`;

        const btn = card.querySelector('.view-more-btn');
        btn.addEventListener('click', () => mostrarOpciones(p));
        grid.appendChild(card);
    });
}

async function mostrarOpciones(p) {
    const opciones = await Swal.fire({
        title: 'Opciones del Proveedor',
        html: `¿Qué operación desea realizar con <b>${p.nombre}</b>?`,
        icon: 'question',
        showCancelButton: true,
        showDenyButton: true,
        confirmButtonText: 'Actualizar<br>Proveedor',
        denyButtonText: 'Eliminar<br>Proveedor',
        cancelButtonText: 'Cerrar',
        confirmButtonColor: '#385563',
        denyButtonColor: '#d33'
    });

    if (opciones.isConfirmed) {
        localStorage.setItem('proveedorSeleccionadoId', p.idProveedor);
        window.location.href = `actualizarProveedores.html`;
    } else if (opciones.isDenied) {
        eliminarProveedor(p);
    }
}

async function eliminarProveedor(p) {
    const confirmacion = await Swal.fire({
        title: '¿Estás seguro?',
        text: `Eliminarás al proveedor: ${p.nombre}`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    });

    if (confirmacion.isConfirmed) {
        try {
            const response = await fetch(`${BASE_URL}/api/proveedores/${p.idProveedor}`, { method: "DELETE" });
            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Eliminado',
                    text: 'Proveedor eliminado con éxito'
                });
                cargarProveedores();
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo eliminar el proveedor'
                });
            }
        } catch (err) {
            console.error(err);
        }
    }
}

document.querySelector(".apply-filters-btn").addEventListener("click", () => {
    let filtrados = [...proveedores];
    let contador = 0;

    if (document.getElementById("nombre").checked) {
        filtrados.sort((a, b) => a.nombre.localeCompare(b.nombre));
        contador++;
    }
    if (document.getElementById("email").checked) {
        filtrados.sort((a, b) => a.email.localeCompare(b.email));
        contador++;
    }
    if (document.getElementById("activos").checked) {
        filtrados = filtrados.filter(p => p.activo === true);
        contador++;
    }

    mostrarProveedores(filtrados);
    document.getElementById("filtersApplied").textContent = `${contador} ${contador === 1 ? 'Filtro aplicado' : 'Filtros aplicados'}`;
});

const searchInput = document.getElementById("searchInput");
searchInput.addEventListener("input", e => {
    const term = e.target.value.toLowerCase().trim();
    const coincidencias = proveedores.filter(p =>
        p.nombre.toLowerCase().includes(term) ||
        p.email.toLowerCase().includes(term) ||
        p.telefono?.toLowerCase().includes(term)
    );
    mostrarProveedores(coincidencias);
});

cargarProveedores();

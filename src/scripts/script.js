// Mobile menu toggle
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');

menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

// Navigation system
const pages = document.querySelectorAll('.page');
const navLinksItems = document.querySelectorAll('.nav-links a');
const logo = document.querySelector('.logo');

function showPage(pageName) {
    // Hide all pages
    pages.forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    const selectedPage = document.getElementById(pageName);
    if (selectedPage) {
        selectedPage.classList.add('active');
    }
    
    // Update active nav link
    navLinksItems.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-page') === pageName) {
            link.classList.add('active');
        }
    });
    
    // Close mobile menu
    navLinks.classList.remove('active');
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Nav links click events
navLinksItems.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const pageName = link.getAttribute('data-page');
        showPage(pageName);
    });
});

// Logo click to home
logo.addEventListener('click', () => {
    showPage('home');
});

// CTA buttons
document.querySelectorAll('[data-page]').forEach(button => {
    button.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A') {
            const pageName = e.target.getAttribute('data-page');
            showPage(pageName);
        }
    });
});

// Navbar scroll effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Fade in animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(el => {
    observer.observe(el);
});

// Form submission
const appointmentForm = document.getElementById('appointmentForm');
appointmentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = {
        nombre: document.getElementById('nombre').value,
        telefono: document.getElementById('telefono').value,
        vehiculo: document.getElementById('vehiculo').value,
        fecha: document.getElementById('fecha').value,
        servicio: document.getElementById('servicio').value,
        comentarios: document.getElementById('comentarios').value
    };

    // Show success message
    alert(`¡Cita agendada exitosamente!\n\nNombre: ${formData.nombre}\nFecha: ${formData.fecha}\nServicio: ${formData.servicio}\n\nNos pondremos en contacto contigo pronto.`);
    
    // Reset form
    appointmentForm.reset();
});

// Set minimum date for appointment to today
const fechaInput = document.getElementById('fecha');
const today = new Date().toISOString().split('T')[0];
fechaInput.setAttribute('min', today);
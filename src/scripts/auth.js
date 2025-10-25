const API_BASE_URL = 'http://localhost:8080/api/auth';

const auth = {
    // LOGIN
    async login(email, password) {
        try {
            const res = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                this.setSession(data.token);
                return { success: true, data };
            } else {
                return { success: false, error: data.message || 'Error en login' };
            }
        } catch (err) {
            console.error('Error login:', err);
            return { success: false, error: 'Error en login' };
        }
    },

    // GUARDAR TOKEN Y ROL EN LOCALSTORAGE
    setSession(token) {
        localStorage.setItem('token', token);
        // Guardar roles decodificando el JWT
        const payload = JSON.parse(atob(token.split('.')[1]));
        const roles = payload.roles || [];
        localStorage.setItem('userRoles', JSON.stringify(roles));
    },

    // LOGOUT
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('userRoles');
        window.location.href = 'login.html';
    },

    // OBTENER TOKEN
    getToken() {
        return localStorage.getItem('token');
    },

    // OBTENER ROLES
    getRoles() {
        const roles = localStorage.getItem('userRoles');
        return roles ? JSON.parse(roles) : [];
    },

    // VERIFICAR SI ESTÁ AUTENTICADO
    isAuthenticated() {
        const token = this.getToken();
        if (!token) return false;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp * 1000 > Date.now();
        } catch (err) {
            return false;
        }
    },

    // VERIFICAR ROL
    hasRole(requiredRole) {
        const roles = this.getRoles();
        return roles.includes(requiredRole);
    },

    // REDIRECCIONAR SI NO HAY PERMISO
    requireRole(...allowedRoles) {
        if (!this.isAuthenticated()) {
            this.logout();
            return;
        }

        const roles = this.getRoles();
        const hasPermission = allowedRoles.some(role => roles.includes(role));

        if (!hasPermission) {
            window.location.href = 'access-denied.html';
        }
    },

    requireAdmin() {
        this.requireRole('ADMINISTRADOR');
    },

    requireSecretario() {
        this.requireRole('SECRETARIO');
    },

    // FETCH CON AUTENTICACIÓN
    async fetchWithAuth(url, options = {}) {
        const token = this.getToken();
        options.headers = {
            ...(options.headers || {}),
            'Authorization': `Bearer ${token}`
        };
        return fetch(url, options);
    }
};

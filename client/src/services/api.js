import axios from 'axios';

/**
 * Axios instance configured with base URL and JWT interceptors
 */
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor — attach JWT token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('gotrip-token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor — handle 401 (token expired)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('gotrip-token');
            // Only redirect if on a protected route
            const isAuthRoute = window.location.pathname.includes('/login') || window.location.pathname.includes('/register');
            const isPublicRoute = window.location.pathname.startsWith('/share/') || window.location.pathname === '/';
            if (!isAuthRoute && !isPublicRoute) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;

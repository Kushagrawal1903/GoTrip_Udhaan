import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext();

/**
 * AuthProvider manages user authentication state, login, register, and logout
 * Persists JWT token in localStorage and auto-loads user on mount
 */
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem('gotrip-token'));
    const [loading, setLoading] = useState(true);

    // Auto-load user if token exists
    useEffect(() => {
        const loadUser = async () => {
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                const res = await api.get('/auth/me');
                setUser(res.data.data.user);
            } catch {
                // Token invalid or expired — clear it
                localStorage.removeItem('gotrip-token');
                setToken(null);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        loadUser();
    }, [token]);

    /**
     * Register a new user
     * @param {Object} credentials - { name, email, password }
     */
    const register = useCallback(async ({ name, email, password }) => {
        const res = await api.post('/auth/register', { name, email, password });
        const { user: userData, token: newToken } = res.data.data;
        localStorage.setItem('gotrip-token', newToken);
        setToken(newToken);
        setUser(userData);
        return res.data;
    }, []);

    /**
     * Login with email and password
     * @param {Object} credentials - { email, password }
     */
    const login = useCallback(async ({ email, password }) => {
        const res = await api.post('/auth/login', { email, password });
        const { user: userData, token: newToken } = res.data.data;
        localStorage.setItem('gotrip-token', newToken);
        setToken(newToken);
        setUser(userData);
        return res.data;
    }, []);

    /**
     * Logout — clear token and user state
     */
    const logout = useCallback(() => {
        localStorage.removeItem('gotrip-token');
        setToken(null);
        setUser(null);
    }, []);

    const isAuthenticated = !!user && !!token;

    return (
        <AuthContext.Provider
            value={{ user, token, loading, isAuthenticated, login, register, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};

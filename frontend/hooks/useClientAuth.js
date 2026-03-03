/**
 * useClientAuth.js
 * Client-specific authentication hook.
 * Mirrors useStaffAuth.js pattern but uses 'clientToken' in localStorage
 * and redirects to /client/* routes.
 */
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';

const CLIENT_TOKEN_KEY = 'clientToken';

export function useClientAuth() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);
    const router = useRouter();

    // Parse JWT token to get user info
    const parseToken = useCallback((token) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            return JSON.parse(jsonPayload);
        } catch (error) {
            return null;
        }
    }, []);

    // Check if token is expired
    const isTokenExpired = useCallback((token) => {
        const decoded = parseToken(token);
        if (!decoded || !decoded.exp) return true;
        return decoded.exp * 1000 < Date.now();
    }, [parseToken]);

    // Get token from localStorage
    const getToken = useCallback(() => {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem(CLIENT_TOKEN_KEY);
    }, []);

    // Set token in localStorage
    const setToken = useCallback((token) => {
        if (typeof window === 'undefined') return;
        localStorage.setItem(CLIENT_TOKEN_KEY, token);
    }, []);

    // Remove token from localStorage
    const removeToken = useCallback(() => {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(CLIENT_TOKEN_KEY);
        // Also remove client info if stored (based on the previous login.jsx logic)
        localStorage.removeItem('clientInfo');
    }, []);

    // Check authentication status
    const checkAuth = useCallback(() => {
        const token = getToken();

        if (!token) {
            setIsAuthenticated(false);
            setUser(null);
            setIsLoading(false);
            return false;
        }

        if (isTokenExpired(token)) {
            removeToken();
            setIsAuthenticated(false);
            setUser(null);
            setIsLoading(false);
            return false;
        }

        const decoded = parseToken(token);

        // Verify this is a client token
        if (decoded?.role !== 'client') {
            removeToken();
            setIsAuthenticated(false);
            setUser(null);
            setIsLoading(false);
            return false;
        }

        setUser(decoded);
        setIsAuthenticated(true);
        setIsLoading(false);
        return true;
    }, [getToken, isTokenExpired, parseToken, removeToken]);

    // Login function - stores token and redirects to client dashboard
    const login = useCallback((token) => {
        setToken(token);
        const decoded = parseToken(token);
        setUser(decoded);
        setIsAuthenticated(true);
        router.push('/client/dashboard');
    }, [setToken, parseToken, router]);

    // Logout function - clears token and redirects to client login
    const logout = useCallback(() => {
        removeToken();
        setUser(null);
        setIsAuthenticated(false);
        router.push('/client/login');
    }, [removeToken, router]);

    // Check auth on mount
    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    return {
        isAuthenticated,
        isLoading,
        user,
        token: getToken(),
        login,
        logout,
        checkAuth,
        getToken,
    };
}

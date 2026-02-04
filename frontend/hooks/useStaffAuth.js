/**
 * useStaffAuth.js
 * Staff-specific authentication hook.
 * Mirrors useAuth.js pattern but uses 'staffToken' in localStorage
 * and redirects to /staff/* routes.
 */
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';

const STAFF_TOKEN_KEY = 'staffToken';

export function useStaffAuth() {
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
    return localStorage.getItem(STAFF_TOKEN_KEY);
  }, []);

  // Set token in localStorage
  const setToken = useCallback((token) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STAFF_TOKEN_KEY, token);
  }, []);

  // Remove token from localStorage
  const removeToken = useCallback(() => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STAFF_TOKEN_KEY);
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
    
    // Verify this is a staff token
    if (decoded?.role !== 'staff') {
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

  // Login function - stores token and redirects to staff dashboard
  const login = useCallback((token) => {
    setToken(token);
    const decoded = parseToken(token);
    setUser(decoded);
    setIsAuthenticated(true);
    router.push('/staff/dashboard');
  }, [setToken, parseToken, router]);

  // Logout function - clears token and redirects to staff login
  const logout = useCallback(() => {
    removeToken();
    setUser(null);
    setIsAuthenticated(false);
    router.push('/staff/login');
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

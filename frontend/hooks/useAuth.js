import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';

const TOKEN_KEY = 'adminToken';

export function useAuth() {
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
    return localStorage.getItem(TOKEN_KEY);
  }, []);

  // Set token in localStorage
  const setToken = useCallback((token) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, token);
  }, []);

  // Remove token from localStorage
  const removeToken = useCallback(() => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
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
    setUser(decoded);
    setIsAuthenticated(true);
    setIsLoading(false);
    return true;
  }, [getToken, isTokenExpired, parseToken, removeToken]);

  // Login function
  const login = useCallback((token) => {
    setToken(token);
    const decoded = parseToken(token);
    setUser(decoded);
    setIsAuthenticated(true);
    router.push('/admin/dashboard');
  }, [setToken, parseToken, router]);

  // Logout function
  const logout = useCallback(() => {
    removeToken();
    setUser(null);
    setIsAuthenticated(false);
    router.push('/admin/login');
  }, [removeToken, router]);

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Redirect to login if not authenticated (for protected pages)
  const requireAuth = useCallback(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isLoading, isAuthenticated, router]);

  return {
    isAuthenticated,
    isLoading,
    user,
    token: getToken(),
    login,
    logout,
    checkAuth,
    requireAuth,
    getToken,
  };
}

// Higher-order function to protect pages
export function withAuth(Component) {
  return function AuthenticatedComponent(props) {
    const { isAuthenticated, isLoading, requireAuth } = useAuth();

    useEffect(() => {
      requireAuth();
    }, [requireAuth]);

    if (isLoading) {
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh'
        }}>
          <div className="loading-spinner loading-spinner-lg"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return null;
    }

    return <Component {...props} />;
  };
}

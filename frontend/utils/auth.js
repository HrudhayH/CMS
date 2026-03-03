/**
 * Parse JWT token to get payload
 * @param {string} token 
 * @returns {object|null}
 */
export function parseToken(token) {
    if (!token) return null;
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
}

/**
 * Check if token is expired
 * @param {string} token 
 * @returns {boolean}
 */
export function isTokenExpired(token) {
    const decoded = parseToken(token);
    if (!decoded || !decoded.exp) return true;
    return decoded.exp * 1000 < Date.now();
}

/**
 * Get internal user role from token
 * @param {string} token 
 * @returns {string|null}
 */
export function getUserRole(token) {
    const decoded = parseToken(token);
    return decoded?.role || null;
}

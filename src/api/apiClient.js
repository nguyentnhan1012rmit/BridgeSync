/**
 * Shared API client utility for authenticated requests.
 * All protected API calls should use `authFetch` to automatically
 * include the JWT token from localStorage.
 */

const API_BASE = '/api';

/**
 * Returns the authorization headers with the JWT token.
 * @returns {Object} Headers object with Authorization and Content-Type.
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

/**
 * Wrapper around fetch that automatically injects auth headers
 * and handles common error responses.
 *
 * @param {string} endpoint - API endpoint path (e.g. '/projects')
 * @param {Object} options  - Fetch options (method, body, etc.)
 * @returns {Promise<any>} Parsed JSON response.
 * @throws {Error} With the server error message on non-ok responses.
 */
export const authFetch = async (endpoint, options = {}) => {
  const url = `${API_BASE}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      window.dispatchEvent(new Event('auth-error'));
    }
    const errorData = await response.json().catch(() => ({
      message: `Request failed with status ${response.status}`,
    }));
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }

  return response.json();
};

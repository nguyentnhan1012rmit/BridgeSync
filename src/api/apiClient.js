/**
 * Shared API client utility for authenticated requests.
 * All protected API calls should use `authFetch` to automatically
 * include the JWT token from localStorage.
 */

export const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
let refreshPromise = null;

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

const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');

  if (!refreshToken) return null;

  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
      .then(async (response) => {
        if (!response.ok) return null;

        const data = await response.json();
        const newToken = data.accessToken || data.token;
        const newRefreshToken = data.refreshToken;

        if (!newToken) return null;

        localStorage.setItem('token', newToken);
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }
        window.dispatchEvent(new CustomEvent('token-refresh', {
          detail: { token: newToken, refreshToken: newRefreshToken },
        }));
        return newToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
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

  let response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  if (response.status === 401) {
    const newToken = await refreshAccessToken();

    if (newToken) {
      response = await fetch(url, {
        ...options,
        headers: {
          ...getAuthHeaders(),
          ...options.headers,
          Authorization: `Bearer ${newToken}`,
        },
      });
    } else {
      window.dispatchEvent(new Event('auth-error'));
    }
  }

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

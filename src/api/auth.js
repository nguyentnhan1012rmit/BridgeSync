import { API_BASE, authFetch } from './apiClient';

export const loginUser = async (credentials) => {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Login failed' }));
    throw new Error(errorData.message || 'Login failed');
  }

  return response.json();
};

export const registerUser = async (userData) => {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Registration failed' }));
    throw new Error(errorData.message || 'Registration failed');
  }

  return response.json();
};

export const getUsers = () => {
  return authFetch('/auth/users');
};

export const logoutUser = () => {
  return authFetch('/auth/logout', {
    method: 'POST',
  });
};

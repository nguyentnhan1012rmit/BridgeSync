import { createContext, useState, useEffect, useCallback } from 'react';

export const AuthContext = createContext({
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

const getStoredUser = () => {
  const storedUser = localStorage.getItem('user');

  if (!storedUser) return null;

  try {
    return JSON.parse(storedUser);
  } catch (e) {
    console.error('Failed to parse user from localStorage', e);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('refreshToken'));

  const login = (userData) => {
    const { token, refreshToken: newRefreshToken, user: newUser } = userData;
    setToken(token);
    setRefreshToken(newRefreshToken || null);
    setUser(newUser);
    localStorage.setItem('token', token);
    if (newRefreshToken) {
      localStorage.setItem('refreshToken', newRefreshToken);
    }
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const logout = useCallback(() => {
    setToken(null);
    setRefreshToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }, []);

  useEffect(() => {
    const handleAuthError = () => {
      logout();
    };
    const handleTokenRefresh = (event) => {
      setToken(event.detail?.token || localStorage.getItem('token'));
      setRefreshToken(event.detail?.refreshToken || localStorage.getItem('refreshToken'));
    };

    window.addEventListener('auth-error', handleAuthError);
    window.addEventListener('token-refresh', handleTokenRefresh);

    return () => {
      window.removeEventListener('auth-error', handleAuthError);
      window.removeEventListener('token-refresh', handleTokenRefresh);
    };
  }, [logout]);

  const value = {
    user,
    token,
    refreshToken,
    isAuthenticated: !!token,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

import { useContext } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/context/AuthContext';
import { loginUser, logoutUser, registerUser } from '@/api/auth';

export const useAuth = () => {
  const context = useContext(AuthContext);
  const navigate = useNavigate();

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const { login, logout, ...authState } = context;

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      setTimeout(() => {
        login(data);
        navigate('/');
      }, 600);
    },
  });

  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      setTimeout(() => {
        login(data);
        navigate('/');
      }, 600);
    },
  });

  const performLogout = async () => {
    try {
      await logoutUser();
    } catch {
      // Local logout should still succeed if the token is already expired/revoked.
    }

    logout();
    navigate('/login');
  };

  return {
    ...authState,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    isLoginSuccess: loginMutation.isSuccess,
    loginError: loginMutation.error,
    
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    isRegisterSuccess: registerMutation.isSuccess,
    registerError: registerMutation.error,
    
    logout: performLogout,
  };
};

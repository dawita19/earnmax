import React, { useState, useEffect, useCallback } from 'react';
import { AuthContext } from './AuthContext';
import { User, LoginCredentials, RegisterData } from './types';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { getClientIP } from '../../utils/ipUtils';
import { setAuthToken, clearAuthToken } from '../../utils/authUtils';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<{
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
  }>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true, // Start with loading to check auth status
    error: null,
  });

  const navigate = useNavigate();

  // Initialize auth state from storage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          setAuthToken(token);
          const { data } = await api.get('/auth/me');
          setState({
            user: data.user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        clearAuthToken();
        setState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Session expired. Please login again.',
        });
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Get client IP if not provided
      const ip = credentials.ip_address || (await getClientIP());
      
      const { data } = await api.post('/auth/login', { 
        ...credentials, 
        ip_address: ip 
      });

      localStorage.setItem('token', data.token);
      setAuthToken(data.token);

      setState({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      // Redirect based on VIP level
      if (data.user.vip_level > 0) {
        navigate('/dashboard');
      } else {
        navigate('/vip-upgrade');
      }
    } catch (error: any) {
      setState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: error.response?.data?.message || 'Login failed. Please try again.',
      });
    }
  }, [navigate]);

  const register = useCallback(async (formData: RegisterData) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Get client IP if not provided
      const ip = formData.ip_address || (await getClientIP());
      
      const { data } = await api.post('/auth/register', { 
        ...formData, 
        ip_address: ip 
      });

      localStorage.setItem('token', data.token);
      setAuthToken(data.token);

      setState({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      navigate('/verify-phone'); // Or welcome page
    } catch (error: any) {
      setState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: error.response?.data?.message || 'Registration failed. Please try again.',
      });
    }
  }, [navigate]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    clearAuthToken();
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
    navigate('/login');
  }, [navigate]);

  const refreshUser = useCallback(async () => {
    if (!state.token) return;
    
    try {
      const { data } = await api.get('/auth/me');
      setState(prev => ({
        ...prev,
        user: data.user,
        error: null,
      }));
    } catch (error) {
      logout();
    }
  }, [state.token, logout]);

  const updateUser = useCallback((userData: Partial<User>) => {
    setState(prev => ({
      ...prev,
      user: prev.user ? { ...prev.user, ...userData } : null,
    }));
  }, []);

  const verifyTwoFactor = useCallback(async (code: string) => {
    if (!state.token) return;
    
    try {
      const { data } = await api.post('/auth/verify-2fa', { code });
      setState(prev => ({
        ...prev,
        user: data.user,
        error: null,
      }));
      navigate('/dashboard');
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.response?.data?.message || 'Verification failed',
      }));
    }
  }, [state.token, navigate]);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        refreshUser,
        updateUser,
        verifyTwoFactor,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
import { useState, useEffect, useContext, createContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser, logoutUser, checkAuthStatus } from '../services/authService';
import { User, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const authData = await checkAuthStatus();
        setUser(authData.user);
        if (authData.user?.vip_level === 0 && authData.user.ip_address) {
          // VIP0 users with IP should be restricted
          navigate('/upgrade-required');
        }
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    verifyAuth();
  }, [navigate]);

  const login = async (credentials: { phoneOrEmail: string; password: string }) => {
    const data = await loginUser(credentials);
    setUser(data.user);
    return data;
  };

  const register = async (userData: {
    full_name: string;
    phone_number: string;
    email?: string;
    password: string;
    invite_code: string;
  }) => {
    const data = await registerUser(userData);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
    navigate('/login');
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.admin_level === 'high' || user?.admin_level === 'low',
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
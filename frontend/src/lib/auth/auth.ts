import { jwtDecode } from 'jwt-decode';
import { UserRole } from '../../types';

export interface AuthToken {
  userId: string;
  role: UserRole;
  vipLevel: number;
  exp: number;
}

export const storeAuthToken = (token: string): void => {
  localStorage.setItem('authToken', token);
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

export const clearAuthToken = (): void => {
  localStorage.removeItem('authToken');
};

export const decodeAuthToken = (token: string): AuthToken => {
  return jwtDecode<AuthToken>(token);
};

export const isAuthenticated = (): boolean => {
  const token = getAuthToken();
  if (!token) return false;
  
  try {
    const { exp } = decodeAuthToken(token);
    return Date.now() < exp * 1000;
  } catch {
    return false;
  }
};

export const getCurrentUserRole = (): UserRole | null => {
  const token = getAuthToken();
  if (!token) return null;
  
  try {
    const { role } = decodeAuthToken(token);
    return role;
  } catch {
    return null;
  }
};

export const getCurrentVipLevel = (): number | null => {
  const token = getAuthToken();
  if (!token) return null;
  
  try {
    const { vipLevel } = decodeAuthToken(token);
    return vipLevel;
  } catch {
    return null;
  }
};
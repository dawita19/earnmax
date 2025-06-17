import axios from 'axios';

const AUTH_API_BASE = process.env.NEXT_PUBLIC_AUTH_API_URL || '/api/auth';

export const AuthApi = {
  // User Authentication
  register: async (payload: {
    fullName: string;
    phoneNumber: string;
    email?: string;
    password: string;
    inviteCode?: string;
    ipAddress?: string;
  }) => {
    return axios.post(`${AUTH_API_BASE}/register`, payload);
  },

  login: async (identifier: string, password: string) => {
    return axios.post(`${AUTH_API_BASE}/login`, { identifier, password });
  },

  verifyOtp: async (otp: string, sessionToken: string) => {
    return axios.post(`${AUTH_API_BASE}/verify-otp`, { otp, sessionToken });
  },

  // Session Management
  refreshToken: async (refreshToken: string) => {
    return axios.post(`${AUTH_API_BASE}/refresh-token`, { refreshToken });
  },

  logout: async () => {
    return axios.post(`${AUTH_API_BASE}/logout`);
  },

  // Password Management
  requestPasswordReset: async (emailOrPhone: string) => {
    return axios.post(`${AUTH_API_BASE}/password/reset-request`, { emailOrPhone });
  },

  resetPassword: async (token: string, newPassword: string) => {
    return axios.post(`${AUTH_API_BASE}/password/reset`, { token, newPassword });
  },

  // Security
  enableTwoFactor: async () => {
    return axios.post(`${AUTH_API_BASE}/two-factor/enable`);
  },

  verifyTwoFactor: async (token: string) => {
    return axios.post(`${AUTH_API_BASE}/two-factor/verify`, { token });
  }
};
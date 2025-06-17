import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: {
    userId: string;
    phoneNumber: string;
    email: string;
    vipLevel: number;
    balance: number;
    totalEarnings: number;
  } | null;
  token: string | null;
  isAdmin: boolean;
  adminLevel: 'high' | 'low' | null;
  login: (credentials: { phoneOrEmail: string; password: string }) => Promise<void>;
  adminLogin: (credentials: { username: string; password: string }) => Promise<void>;
  logout: () => void;
  register: (userData: {
    fullName: string;
    phoneNumber: string;
    email: string;
    password: string;
    inviteCode: string;
  }) => Promise<void>;
  verifyTwoFactor: (code: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAdmin: false,
      adminLevel: null,
      login: async (credentials) => {
        // Implementation for user login
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify(credentials),
        });
        const data = await response.json();
        set({ user: data.user, token: data.token });
      },
      adminLogin: async (credentials) => {
        // Implementation for admin login
        const response = await fetch('/api/admin/login', {
          method: 'POST',
          body: JSON.stringify(credentials),
        });
        const data = await response.json();
        set({ 
          user: data.user, 
          token: data.token,
          isAdmin: true,
          adminLevel: data.adminLevel
        });
      },
      logout: () => set({ user: null, token: null, isAdmin: false, adminLevel: null }),
      register: async (userData) => {
        // Implementation for registration
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          body: JSON.stringify(userData),
        });
        const data = await response.json();
        set({ user: data.user, token: data.token });
      },
      verifyTwoFactor: async (code) => {
        // 2FA verification logic
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user, isAdmin: state.isAdmin, adminLevel: state.adminLevel }),
    }
  )
);
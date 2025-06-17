import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface AuthState {
  user: {
    userId: string;
    fullName: string;
    phoneNumber: string;
    email: string;
    vipLevel: number;
    balance: number;
    totalEarnings: number;
    inviteCode: string;
    accountStatus: 'active' | 'suspended';
  } | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (phoneOrEmail: string, password: string) => Promise<void>;
  register: (
    fullName: string,
    phoneNumber: string,
    email: string,
    password: string,
    inviteCode: string
  ) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUser: (updates: Partial<AuthState['user']>) => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    immer((set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      login: async (phoneOrEmail, password) => {
        set({ loading: true, error: null });
        try {
          // Mock API call
          const response = await mockLogin(phoneOrEmail, password);
          
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            loading: false,
          });
        } catch (err) {
          set({ error: err.message, loading: false });
        }
      },

      register: async (fullName, phoneNumber, email, password, inviteCode) => {
        set({ loading: true, error: null });
        try {
          const response = await mockRegister(
            fullName,
            phoneNumber,
            email,
            password,
            inviteCode
          );
          
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            loading: false,
          });
        } catch (err) {
          set({ error: err.message, loading: false });
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      refreshUser: async () => {
        if (!get().token) return;
        try {
          const user = await mockRefreshUser(get().token);
          set({ user });
        } catch (err) {
          console.error('Failed to refresh user:', err);
        }
      },

      updateUser: (updates) => {
        set((state) => {
          if (state.user) {
            state.user = { ...state.user, ...updates };
          }
        });
      },
    })),
    {
      name: 'earnmax-auth',
      partialize: (state) => ({ token: state.token }),
    }
  )
);

// Mock API functions
async function mockLogin(phoneOrEmail: string, password: string) {
  return {
    user: {
      userId: '123456',
      fullName: 'Test User',
      phoneNumber: '+251912345678',
      email: 'test@earnmax.com',
      vipLevel: 0,
      balance: 0,
      totalEarnings: 0,
      inviteCode: 'ABCDEF',
      accountStatus: 'active',
    },
    token: 'mock-jwt-token',
  };
}

async function mockRegister(
  fullName: string,
  phoneNumber: string,
  email: string,
  password: string,
  inviteCode: string
) {
  return {
    user: {
      userId: Math.floor(100000 + Math.random() * 900000).toString(),
      fullName,
      phoneNumber,
      email,
      vipLevel: 0,
      balance: 0,
      totalEarnings: 0,
      inviteCode: generateInviteCode(),
      accountStatus: 'active',
    },
    token: 'mock-jwt-token',
  };
}

async function mockRefreshUser(token: string) {
  return {
    userId: '123456',
    fullName: 'Test User',
    phoneNumber: '+251912345678',
    email: 'test@earnmax.com',
    vipLevel: 0,
    balance: 0,
    totalEarnings: 0,
    inviteCode: 'ABCDEF',
    accountStatus: 'active',
  };
}

function generateInviteCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}
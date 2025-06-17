// auth.d.ts
declare namespace Auth {
  interface LoginCredentials {
    identifier: string; // phone or email
    password: string;
    twoFactorCode?: string;
  }

  interface RegisterData {
    fullName: string;
    phoneNumber: string;
    email?: string;
    password: string;
    inviterCode?: string;
    ipAddress?: string;
  }

  interface SessionUser {
    userId: number;
    vipLevel: number;
    accountStatus: 'active' | 'suspended';
    twoFactorEnabled: boolean;
  }

  interface PasswordReset {
    token: string;
    newPassword: string;
    confirmPassword: string;
  }
}
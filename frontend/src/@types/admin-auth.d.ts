interface AdminAuthCredentials {
  username: string;
  password: string;
  twoFactorCode?: string;
}

interface AdminAuthResponse {
  accessToken: string;
  refreshToken: string;
  admin: {
    adminId: number;
    username: string;
    email: string;
    adminLevel: 'high' | 'low';
    permissions: string[];
    twoFactorEnabled: boolean;
  };
}

interface AdminSession {
  adminId: number;
  username: string;
  adminLevel: 'high' | 'low';
  permissions: {
    canApprovePurchases: boolean;
    canApproveUpgrades: boolean;
    canApproveWithdrawals: boolean;
    canSuspendUsers: boolean;
    canViewAuditLogs: boolean;
    canManageAdmins: boolean;
  };
  iat: number;
  exp: number;
}

interface AdminTwoFactorSetup {
  secret: string;
  qrCodeUrl: string;
}
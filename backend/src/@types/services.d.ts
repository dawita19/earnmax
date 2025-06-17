import {
  UserDocument,
  PurchaseRequestDocument,
  WithdrawalRequestDocument,
  ReferralBonusDocument,
  DailyTaskDocument
} from './database';

interface AuthService {
  registerUser(registrationData: UserRegistrationData): Promise<UserDocument>;
  authenticateUser(credentials: UserCredentials): Promise<{ user: UserDocument, token: string }>;
  authenticateAdmin(credentials: AdminCredentials): Promise<{ admin: AdminDocument, token: string }>;
  refreshToken(token: string): Promise<{ newToken: string }>;
}

interface UserService {
  getUserById(id: string): Promise<UserDocument>;
  updateUserProfile(userId: string, updateData: UserUpdateData): Promise<UserDocument>;
  changePassword(userId: string, passwordData: PasswordChangeData): Promise<void>;
  lockUserAccount(userId: string, adminId: string, reason: string): Promise<void>;
}

interface VipService {
  getVipLevels(): Promise<VipLevelDocument[]>;
  initiatePurchase(userId: string, purchaseData: PurchaseInitiationData): Promise<PurchaseRequestDocument>;
  processPurchaseApproval(requestId: string, adminId: string, approvalData: PurchaseApprovalData): Promise<void>;
  initiateUpgrade(userId: string, upgradeData: UpgradeInitiationData): Promise<UpgradeRequestDocument>;
  processUpgradeApproval(requestId: string, adminId: string, approvalData: UpgradeApprovalData): Promise<void>;
}

interface TransactionService {
  initiateWithdrawal(userId: string, withdrawalData: WithdrawalInitiationData): Promise<WithdrawalRequestDocument>;
  processWithdrawalApproval(requestId: string, adminId: string, approvalData: WithdrawalApprovalData): Promise<void>;
  distributeRoundRobinRequests(): Promise<void>;
}

interface ReferralService {
  calculateReferralBonuses(sourceType: 'purchase' | 'upgrade' | 'task', sourceId: Types.ObjectId): Promise<ReferralBonusDocument[]>;
  getReferralNetwork(userId: string, level?: number): Promise<ReferralNetworkDocument[]>;
  getReferralStatistics(userId: string): Promise<ReferralStats>;
}

interface TaskService {
  generateDailyTasks(userId: string): Promise<DailyTaskDocument[]>;
  completeTask(userId: string, taskId: string): Promise<TaskCompletionResult>;
  resetExpiredTasks(): Promise<void>;
}

interface AdminService {
  getDashboardStatistics(): Promise<SystemStatisticsDocument>;
  getPendingRequests(): Promise<PendingRequests>;
  processBatchRequests(requestIds: string[], adminId: string, action: 'approve' | 'reject'): Promise<BatchProcessingResult>;
}

interface NotificationService {
  sendUserNotification(userId: string, notification: UserNotification): Promise<void>;
  sendAdminAlert(notification: AdminAlert): Promise<void>;
  markAsRead(notificationIds: string[], userId: string): Promise<void>;
}

interface AuditService {
  logAdminAction(adminId: string, action: AdminAction): Promise<void>;
  logUserActivity(userId: string, action: UserAction): Promise<void>;
  getActivityLogs(filter: ActivityFilter): Promise<ActivityLog[]>;
}

// Supporting types
interface UserRegistrationData {
  full_name: string;
  phone_number: string;
  email?: string;
  password: string;
  invite_code?: string;
  ip_address?: string;
}

interface PurchaseInitiationData {
  vip_level: number;
  payment_method: string;
  payment_proof: string;
}

interface TaskCompletionResult {
  task: DailyTaskDocument;
  earningsAdded: number;
  referralBonuses: ReferralBonusDocument[];
}

// ... additional supporting types as needed

export {
  AuthService, UserService, VipService, TransactionService,
  ReferralService, TaskService, AdminService, NotificationService,
  AuditService,
  UserRegistrationData, PurchaseInitiationData, TaskCompletionResult
};
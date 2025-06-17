import axios from 'axios';
import { UserProfile, ReferralNetwork, Notification } from '../../types';

const USER_API_BASE = process.env.NEXT_PUBLIC_USER_API_URL || '/api/user';

export const UserApi = {
  // Profile Management
  getProfile: async (): Promise<UserProfile> => {
    const { data } = await axios.get(`${USER_API_BASE}/profile`);
    return data;
  },

  updateProfile: async (updates: Partial<UserProfile>) => {
    const { data } = await axios.patch(`${USER_API_BASE}/profile`, updates);
    return data;
  },

  updatePassword: async (currentPassword: string, newPassword: string) => {
    return axios.patch(`${USER_API_BASE}/password`, { currentPassword, newPassword });
  },

  // Referral System
  getReferralInfo: async (): Promise<{
    inviteCode: string;
    totalInvites: number;
    referralBonus: number;
    referralLink: string;
  }> => {
    const { data } = await axios.get(`${USER_API_BASE}/referral`);
    return data;
  },

  getReferralNetwork: async (level = 1): Promise<ReferralNetwork[]> => {
    const { data } = await axios.get(`${USER_API_BASE}/referral/network?level=${level}`);
    return data;
  },

  // VIP Status
  getVipStatus: async () => {
    const { data } = await axios.get(`${USER_API_BASE}/vip`);
    return data;
  },

  // Notifications
  getNotifications: async (unreadOnly = false): Promise<Notification[]> => {
    const { data } = await axios.get(`${USER_API_BASE}/notifications?unreadOnly=${unreadOnly}`);
    return data;
  },

  markNotificationAsRead: async (notificationId: number) => {
    return axios.patch(`${USER_API_BASE}/notifications/${notificationId}/read`);
  },

  markAllNotificationsAsRead: async () => {
    return axios.patch(`${USER_API_BASE}/notifications/read-all`);
  },

  // Account Security
  getLoginHistory: async () => {
    const { data } = await axios.get(`${USER_API_BASE}/security/logins`);
    return data;
  },

  terminateOtherSessions: async () => {
    return axios.post(`${USER_API_BASE}/security/terminate-sessions`);
  }
};
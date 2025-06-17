import { create } from 'zustand';

interface UserProfile {
  fullName: string;
  userId: string;
  vipLevel: number;
  vipAmount: number;
  balance: number;
  totalEarnings: number;
  totalWithdrawn: number;
  totalReferralBonus: number;
  firstLevelInvites: number;
  secondLevelInvites: number;
  thirdLevelInvites: number;
  fourthLevelInvites: number;
  totalInvites: number;
  paymentMethod: string;
  accountStatus: string;
  joinDate: string;
}

interface TeamMember {
  userId: string;
  fullName: string;
  vipLevel: number;
  joinDate: string;
}

interface UserState {
  profile: UserProfile | null;
  team: {
    firstLevel: TeamMember[];
    secondLevel: TeamMember[];
    thirdLevel: TeamMember[];
    fourthLevel: TeamMember[];
  };
  invitationCode: string;
  fetchUserProfile: () => Promise<void>;
  fetchTeamMembers: () => Promise<void>;
  updatePaymentMethod: (method: string, details: string) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  calculateReferralBonus: (level: 1 | 2 | 3 | 4) => number;
}

export const useUserStore = create<UserState>((set, get) => ({
  profile: null,
  team: {
    firstLevel: [],
    secondLevel: [],
    thirdLevel: [],
    fourthLevel: [],
  },
  invitationCode: '',
  fetchUserProfile: async () => {
    const response = await fetch('/api/user/profile');
    const data = await response.json();
    set({ profile: data.profile, invitationCode: data.invitationCode });
  },
  fetchTeamMembers: async () => {
    const response = await fetch('/api/user/team');
    const data = await response.json();
    set({ team: data.team });
  },
  updatePaymentMethod: async (method, details) => {
    await fetch('/api/user/payment-method', {
      method: 'PUT',
      body: JSON.stringify({ method, details }),
    });
    await get().fetchUserProfile();
  },
  updatePassword: async (currentPassword, newPassword) => {
    await fetch('/api/user/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },
  calculateReferralBonus: (level) => {
    const profile = get().profile;
    if (!profile) return 0;
    
    switch (level) {
      case 1: return profile.totalReferralBonus * 0.2;
      case 2: return profile.totalReferralBonus * 0.1;
      case 3: return profile.totalReferralBonus * 0.05;
      case 4: return profile.totalReferralBonus * 0.02;
      default: return 0;
    }
  },
}));
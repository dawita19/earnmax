export class InvitationLinkDto {
  code: string;
  url: string;
  shares: number;
  conversions: number;
}

export class TeamMemberDto {
  userId: number;
  fullName: string;
  joinDate: Date;
  vipLevel: number;
  level: number; // 1-4 representing referral level
  earningsGenerated: number;
}

export class TeamResponseDto {
  invitationLink: InvitationLinkDto;
  totalMembers: number;
  membersByLevel: {
    level1: TeamMemberDto[];
    level2: TeamMemberDto[];
    level3: TeamMemberDto[];
    level4: TeamMemberDto[];
  };
}
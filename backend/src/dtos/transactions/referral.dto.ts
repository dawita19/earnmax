import { IsInt, IsPositive, IsNumber } from 'class-validator';

export class ReferralNetworkDto {
  @IsInt()
  @IsPositive()
  inviterId: number;

  @IsInt()
  @IsPositive()
  inviteeId: number;

  @IsInt()
  @IsPositive()
  level: number;
}

export class ReferralBonusDto {
  @IsInt()
  @IsPositive()
  inviterId: number;

  @IsInt()
  @IsPositive()
  inviteeId: number;

  @IsNumber()
  @IsPositive()
  amount: number;

  source: 'purchase' | 'upgrade' | 'task';
  sourceId: number;
}

export class TeamStatsResponseDto {
  totalInvites: number;
  firstLevel: number;
  secondLevel: number;
  thirdLevel: number;
  fourthLevel: number;
  totalReferralBonus: number;
  weeklyBonusEligibility: {
    level: number; // 0-4 representing bonus tiers
    bonusPercentage: number;
    invitesNeeded: number;
  };
}
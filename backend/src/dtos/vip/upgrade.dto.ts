import { IsInt, IsPositive, IsNumber, IsOptional, IsUrl } from 'class-validator';

export class VipUpgradeRequestDto {
  @IsInt()
  @IsPositive()
  newLevel: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  additionalPayment?: number;

  @IsUrl()
  @IsOptional()
  paymentProofUrl?: string;
}

export class VipUpgradeResponseDto {
  status: 'pending' | 'approved' | 'rejected' | 'instant';
  balanceDeduction: number;
  newLevel: number;
  newDailyEarnings: number;
}
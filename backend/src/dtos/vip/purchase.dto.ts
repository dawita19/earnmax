import { IsInt, IsPositive, IsString, IsUrl } from 'class-validator';

export class VipPurchaseRequestDto {
  @IsInt()
  @IsPositive()
  level: number;

  @IsUrl()
  paymentProofUrl: string;

  @IsString()
  paymentMethod: string;
}

export class VipPurchaseResponseDto {
  status: 'pending' | 'approved' | 'rejected';
  estimatedApprovalTime: Date;
  currentBalance: number;
}
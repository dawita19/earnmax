import { IsInt, IsPositive, IsNotEmpty, IsDecimal, IsUrl, IsIn, ValidateIf } from 'class-validator';
import { VIP_LEVELS } from '../../constants';

export class VipUpgradeRequestDto {
  @IsInt()
  @IsPositive()
  @IsIn(VIP_LEVELS)
  current_level: number;

  @IsInt()
  @IsPositive()
  @IsIn(VIP_LEVELS)
  new_level: number;

  @ValidateIf(o => o.payment_proof_url)
  @IsUrl()
  payment_proof_url?: string;
}

export class VipUpgradeApprovalDto {
  @IsNotEmpty()
  @IsString()
  admin_id: string;

  @IsNotEmpty()
  @IsString()
  @IsIn(['approved', 'rejected'])
  status: string;

  @IsDecimal()
  @IsPositive()
  recharge_amount: number;

  @IsString()
  admin_notes?: string;
}
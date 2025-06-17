import { IsInt, IsPositive, IsNotEmpty, IsString, IsUrl, IsIn } from 'class-validator';
import { VIP_LEVELS } from '../../constants';

export class VipPurchaseRequestDto {
  @IsInt()
  @IsPositive()
  @IsIn(VIP_LEVELS)
  vip_level: number;

  @IsString()
  @IsNotEmpty()
  payment_method: string;

  @IsUrl()
  payment_proof_url: string;
}

export class VipPurchaseApprovalDto {
  @IsNotEmpty()
  @IsString()
  admin_id: string;

  @IsNotEmpty()
  @IsString()
  @IsIn(['approved', 'rejected'])
  status: string;

  @IsString()
  admin_notes?: string;
}
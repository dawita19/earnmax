import { IsDecimal, IsPositive, IsNotEmpty, IsString, IsIn } from 'class-validator';
import { PAYMENT_METHODS } from '../../constants';

export class WithdrawalRequestDto {
  @IsDecimal()
  @IsPositive()
  amount: number;

  @IsString()
  @IsNotEmpty()
  @IsIn(PAYMENT_METHODS)
  payment_method: string;

  @IsString()
  @IsNotEmpty()
  payment_details: string;

  @IsString()
  @IsNotEmpty()
  payment_password: string;
}

export class WithdrawalApprovalDto {
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
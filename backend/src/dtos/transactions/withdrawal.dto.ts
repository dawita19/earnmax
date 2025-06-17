import { IsNumber, IsPositive, IsString, Min } from 'class-validator';

export class WithdrawalRequestDto {
  @IsNumber()
  @IsPositive()
  @Min(60) // Minimum withdrawal for VIP0
  amount: number;

  @IsString()
  paymentMethod: string;

  @IsString()
  paymentDetails: string;
}

export class WithdrawalResponseDto {
  requestId: string;
  status: 'pending' | 'approved' | 'rejected';
  currentBalance: number;
  totalWithdrawn: number;
  remainingWithdrawalLimit: number;
}
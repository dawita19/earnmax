import { IsEmail, IsPhoneNumber, IsString } from 'class-validator';

export class UserProfileDto {
  @IsString()
  fullName: string;

  @IsPhoneNumber()
  phoneNumber: string;

  @IsEmail()
  @IsOptional()
  email?: string;
}

export class UserProfileResponseDto {
  userId: number;
  fullName: string;
  phoneNumber: string;
  email?: string;
  vipLevel: number;
  balance: number;
  totalEarnings: number;
  totalWithdrawn: number;
  joinDate: Date;
  accountStatus: 'active' | 'suspended';
}

export class UpdatePasswordDto {
  @IsString()
  @MinLength(8)
  currentPassword: string;

  @IsString()
  @MinLength(8)
  newPassword: string;
}
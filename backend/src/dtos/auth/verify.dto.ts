import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyPhoneDto {
  @IsNotEmpty()
  @IsString()
  phone_number: string;

  @IsNotEmpty()
  @IsString()
  verification_code: string;
}

export class ResendVerificationDto {
  @IsNotEmpty()
  @IsString()
  phone_number: string;
}

export class TwoFactorVerifyDto {
  @IsNotEmpty()
  @IsString()
  token: string;

  @IsNotEmpty()
  @IsString()
  code: string;
}
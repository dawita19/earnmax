import { IsNotEmpty, IsString, IsEmail, IsPhoneNumber, IsOptional, IsStrongPassword } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  full_name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsPhoneNumber()
  phone_number?: string;
}

export class UpdatePasswordDto {
  @IsNotEmpty()
  @IsString()
  current_password: string;

  @IsNotEmpty()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  new_password: string;
}

export class UpdatePaymentMethodDto {
  @IsNotEmpty()
  @IsString()
  payment_method: string;

  @IsNotEmpty()
  @IsString()
  payment_details: string;

  @IsNotEmpty()
  @IsString()
  payment_password: string;
}
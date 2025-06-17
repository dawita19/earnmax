import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, Matches } from 'class-validator';

export class UserSignupDto {
  @IsNotEmpty()
  @IsString()
  full_name: string;

  @IsNotEmpty()
  @IsPhoneNumber('ET') // Assuming Ethiopia phone numbers
  phone_number: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/, {
    message: 'Password must be at least 8 characters with 1 letter, 1 number and 1 special character',
  })
  password: string;

  @IsNotEmpty()
  @IsString()
  confirm_password: string;

  @IsOptional()
  @IsString()
  invite_code?: string;

  @IsNotEmpty()
  @IsString()
  device_id: string;
}
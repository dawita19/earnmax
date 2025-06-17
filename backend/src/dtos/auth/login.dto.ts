import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class UserLoginDto {
  @IsNotEmpty()
  @IsString()
  identifier: string; // Can be phone or email

  @IsNotEmpty()
  @IsString()
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/, {
    message: 'Password must be at least 8 characters with 1 letter, 1 number and 1 special character',
  })
  password: string;

  @IsNotEmpty()
  @IsString()
  device_id: string;
}
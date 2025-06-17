import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';

export enum AdminLevel {
  HIGH = 'high',
  LOW = 'low',
}

export class AdminLoginDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;
}

export class AdminCreateDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsEnum(AdminLevel)
  admin_level: AdminLevel;

  permissions?: Record<string, boolean>;
}

export class AdminUpdateDto {
  @IsString()
  @MinLength(8)
  password?: string;

  @IsEmail()
  email?: string;

  @IsEnum(AdminLevel)
  admin_level?: AdminLevel;

  permissions?: Record<string, boolean>;
}
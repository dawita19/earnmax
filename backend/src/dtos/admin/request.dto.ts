import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export enum RequestType {
  PURCHASE = 'purchase',
  UPGRADE = 'upgrade',
  WITHDRAWAL = 'withdrawal',
}

export enum RequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export class ProcessRequestDto {
  @IsNotEmpty()
  @IsNumber()
  request_id: number;

  @IsNotEmpty()
  @IsEnum(RequestType)
  request_type: RequestType;

  @IsNotEmpty()
  @IsEnum(RequestStatus)
  status: RequestStatus;

  @IsOptional()
  @IsString()
  admin_notes?: string;
}

export class RequestFilterDto {
  @IsOptional()
  @IsEnum(RequestType)
  type?: RequestType;

  @IsOptional()
  @IsEnum(RequestStatus)
  status?: RequestStatus;

  @IsOptional()
  @IsNumber()
  admin_id?: number;

  @IsOptional()
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  limit?: number = 10;
}
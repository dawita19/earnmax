import { IsNotEmpty, IsString, IsInt, Min, Max } from 'class-validator';

export class InvitationCodeDto {
  @IsNotEmpty()
  @IsString()
  invitation_code: string;
}

export class ReferralBonusQueryDto {
  @IsInt()
  @Min(1)
  @Max(4)
  level: number = 1;

  @IsInt()
  @Min(1)
  page: number = 1;

  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;
}
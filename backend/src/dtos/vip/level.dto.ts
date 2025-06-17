import { IsInt, IsPositive, IsNumber, IsString } from 'class-validator';

export class VipLevelDto {
  @IsInt()
  @IsPositive()
  level: number;

  @IsNumber()
  @IsPositive()
  investment: number;

  @IsNumber()
  @IsPositive()
  dailyEarning: number;

  @IsNumber()
  @IsPositive()
  perTaskEarning: number;

  @IsNumber()
  @IsPositive()
  minWithdrawal: number;

  @IsNumber()
  @IsPositive()
  maxTotalWithdrawal: number;

  @IsString()
  investmentArea: string;

  tasks: string[];
}

export class VipLevelsResponseDto {
  levels: VipLevelDto[];
  currentLevel: number;
  nextLevel?: VipLevelDto;
}
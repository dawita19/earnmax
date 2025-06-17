import { IsInt, IsPositive, IsNotEmpty, IsDecimal, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class DailyTaskDto {
  @IsNotEmpty()
  name: string;

  @IsDecimal()
  @IsPositive()
  earnings: number;
}

export class CreateVipLevelDto {
  @IsInt()
  @IsPositive()
  level_id: number;

  @IsDecimal()
  @IsPositive()
  investment_amount: number;

  @IsDecimal()
  @IsPositive()
  daily_earning: number;

  @IsDecimal()
  @IsPositive()
  per_task_earning: number;

  @IsDecimal()
  @IsPositive()
  min_withdrawal: number;

  @IsDecimal()
  @IsPositive()
  max_total_withdrawal: number;

  @IsNotEmpty()
  investment_area: string;

  @ValidateNested({ each: true })
  @Type(() => DailyTaskDto)
  daily_tasks: DailyTaskDto[];
}

export class UpdateVipLevelDto {
  @IsDecimal()
  @IsPositive()
  investment_amount?: number;

  @IsDecimal()
  @IsPositive()
  daily_earning?: number;

  @IsDecimal()
  @IsPositive()
  per_task_earning?: number;

  @IsDecimal()
  @IsPositive()
  min_withdrawal?: number;

  @IsDecimal()
  @IsPositive()
  max_total_withdrawal?: number;
}
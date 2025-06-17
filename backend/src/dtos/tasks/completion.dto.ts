import { IsInt, IsPositive } from 'class-validator';

export class TaskCompletionDto {
  @IsInt()
  @IsPositive()
  taskId: number;

  @IsInt()
  @IsPositive()
  userId: number;
}

export class TaskCompletionResponseDto {
  earnings: number;
  newBalance: number;
  referralBonuses: {
    level1: number;
    level2: number;
    level3: number;
    level4: number;
  };
}
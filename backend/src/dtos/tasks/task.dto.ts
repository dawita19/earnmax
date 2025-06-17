import { IsEnum, IsInt, IsPositive, IsString } from 'class-validator';

export enum TaskType {
  VIEW_AD = 'view_ad',
  CLICK_AD = 'click_ad',
  SHARE_POST = 'share_post',
  // Add all other task types from your VIP levels
}

export class TaskDto {
  @IsInt()
  @IsPositive()
  taskId: number;

  @IsEnum(TaskType)
  type: TaskType;

  @IsString()
  description: string;

  @IsInt()
  @IsPositive()
  vipLevel: number;

  @IsInt()
  @IsPositive()
  earnings: number;
}

export class DailyTasksResponseDto {
  tasks: TaskDto[];
  dailyEarnings: number;
  completedCount: number;
}
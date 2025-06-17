import { IsInt, Min, Max, IsOptional } from 'class-validator';

export class TeamQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(4)
  level?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}

export class TeamStatsQueryDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  days?: number = 7;
}
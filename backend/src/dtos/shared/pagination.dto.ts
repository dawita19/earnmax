export class PaginationDto {
  page: number = 1;
  limit: number = 10;
  total?: number;
}

export class PaginatedResponseDto<T> {
  data: T[];
  pagination: PaginationDto;
}
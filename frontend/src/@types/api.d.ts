// api.d.ts
declare namespace API {
  interface BaseResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    timestamp: string;
  }

  interface PaginatedResponse<T> extends BaseResponse<T[]> {
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }

  interface ErrorResponse {
    statusCode: number;
    message: string;
    error?: string;
  }
}
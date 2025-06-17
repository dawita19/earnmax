// src/utils/api/response.ts
import { Response } from 'express';

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
  error?: {
    code: string;
    details?: string[];
  };
};

export class ApiResponder {
  static success<T>(res: Response, data: T, message = 'Success', statusCode = 200) {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data
    };
    return res.status(statusCode).json(response);
  }

  static paginated<T>(
    res: Response,
    data: T,
    meta: { page: number; limit: number; total: number },
    message = 'Success'
  ) {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
      meta: {
        page: meta.page,
        limit: meta.limit,
        total: meta.total
      }
    };
    return res.status(200).json(response);
  }

  static error(
    res: Response,
    errorCode: string,
    message = 'Error',
    statusCode = 400,
    errorDetails?: string[]
  ) {
    const response: ApiResponse<never> = {
      success: false,
      message,
      error: {
        code: errorCode,
        details: errorDetails
      }
    };
    return res.status(statusCode).json(response);
  }
}

export const API_CODES = {
  INVALID_INPUT: 'E_INVALID_INPUT',
  UNAUTHORIZED: 'E_UNAUTHORIZED',
  FORBIDDEN: 'E_FORBIDDEN',
  NOT_FOUND: 'E_NOT_FOUND',
  CONFLICT: 'E_CONFLICT',
  SERVER_ERROR: 'E_SERVER_ERROR'
};
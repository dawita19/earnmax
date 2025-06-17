// src/utils/api/error.ts
import { NextFunction, Request, Response } from 'express';
import { API_CODES, ApiResponder } from './response';

export class AppError extends Error {
  constructor(
    public readonly code: string,
    public readonly message: string,
    public readonly statusCode: number,
    public readonly details?: string[]
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return ApiResponder.error(
      res,
      err.code,
      err.message,
      err.statusCode,
      err.details
    );
  }

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return ApiResponder.error(
      res,
      API_CODES.INVALID_INPUT,
      'Validation Error',
      400,
      [err.message]
    );
  }

  // Unexpected errors
  console.error('Unexpected error:', err);
  return ApiResponder.error(
    res,
    API_CODES.SERVER_ERROR,
    'Internal Server Error',
    500
  );
};

export const asyncHandler = (fn: Function) => 
  (req: Request, res: Response, next: NextFunction) => 
    Promise.resolve(fn(req, res, next)).catch(next);

export const notFoundHandler = (req: Request, res: Response) => {
  ApiResponder.error(
    res,
    API_CODES.NOT_FOUND,
    `Route ${req.method} ${req.path} not found`,
    404
  );
};
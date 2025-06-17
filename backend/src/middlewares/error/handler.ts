import { ErrorRequestHandler } from 'express';
import { ValidationError } from 'express-validator';
import { CustomError } from '../../errors/custom-error';
import { RequestLogger } from '../request/logger';

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  // Log the error
  RequestLogger.logger.error(err.message, {
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    userId: req.user?._id
  });

  // Handle different error types
  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({
      success: false,
      errors: err.serializeErrors()
    });
  }

  if (err.array && err.array() instanceof Array) {
    const validationError = err as unknown as { array: () => ValidationError[] };
    return res.status(400).json({
      success: false,
      errors: validationError.array().map(error => ({
        message: error.msg,
        field: error.param
      }))
    });
  }

  // Generic error response
  res.status(500).json({
    success: false,
    errors: [{ message: 'Something went wrong' }]
  });
};
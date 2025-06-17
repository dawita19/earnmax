import { validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { ApiResponder, API_CODES } from './response';

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return ApiResponder.error(
      res,
      API_CODES.INVALID_INPUT,
      'Validation failed',
      400,
      errors.array().map(e => `${e.param}: ${e.msg}`)
    );
  }
  next();
};
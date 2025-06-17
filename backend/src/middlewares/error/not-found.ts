import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../../errors/custom-error';

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new CustomError('Endpoint not found', 404);
  next(error);
};
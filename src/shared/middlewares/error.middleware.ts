import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors/AppError';

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      status: 'validation_error',
      errors: err.errors,
    });
  }

  console.error('[INTERNAL ERROR]', err);

  return res.status(500).json({
    status: 'error',
    message: 'Internal Server Error',
  });
};

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger.js';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

interface PrismaError extends Error {
  code: string;
  meta?: Record<string, unknown>;
}

function isPrismaError(err: unknown): err is PrismaError {
  return (
    err instanceof Error &&
    'code' in err &&
    typeof (err as PrismaError).code === 'string' &&
    (err as PrismaError).code.startsWith('P')
  );
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Handle Zod validation errors
  if (err instanceof ZodError) {
    res.status(422).json({
      status: 'error',
      message: 'Validation failed',
      errors: err.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    });
    return;
  }

  // Handle known operational errors
  if (err instanceof AppError) {
    logger.warn({ err, url: req.url, method: req.method }, err.message);
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
    return;
  }

  // Handle Prisma errors
  if (isPrismaError(err)) {
    logger.warn({ err, url: req.url, method: req.method }, 'Prisma error');

    if (err.code === 'P2002') {
      res.status(409).json({
        status: 'error',
        message: 'A record with this value already exists.',
      });
      return;
    }

    if (err.code === 'P2025') {
      res.status(404).json({
        status: 'error',
        message: 'Record not found.',
      });
      return;
    }

    res.status(500).json({
      status: 'error',
      message: 'A database error occurred.',
    });
    return;
  }

  // Unhandled / unexpected errors
  logger.error({ err, url: req.url, method: req.method }, 'Unhandled error');

  const isDevelopment = process.env['NODE_ENV'] === 'development';

  res.status(500).json({
    status: 'error',
    message: 'An unexpected error occurred.',
    ...(isDevelopment && { stack: err.stack }),
  });
}

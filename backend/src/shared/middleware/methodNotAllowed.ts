import { type Request, type Response, type NextFunction } from 'express';

export function methodNotAllowed(allowedMethods: string[]) {
  const allow = allowedMethods.join(', ');

  return (_req: Request, res: Response, _next: NextFunction): void => {
    res.setHeader('Allow', allow);
    res.status(405).json({
      status: 'error',
      message: 'Method not allowed.',
    });
  };
}

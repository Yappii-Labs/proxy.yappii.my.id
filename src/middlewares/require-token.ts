import type { Request, Response, NextFunction } from 'express';

export function requireToken(req: Request, res: Response, next: NextFunction) {
  const token = req.headers['x-api-token'];
  
  if (!token) {
    return res.status(401).json({
      message: 'Missing API token',
      data: null,
      errors: null,
    });
  }

  next();
}
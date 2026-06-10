import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth.js';

export const isOwner = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'owner') {
    return res.status(403).json({ message: 'Only owners allowed' });
  }
  next();
};

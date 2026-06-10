import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User.js';
import dotenv from 'dotenv';
dotenv.config();

// Extend the Express Request interface directly in this file for simplicity
export interface AuthRequest extends Request {
  user?: IUser;
}

export const isOwner = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'owner') {
    return res.status(403).json({ success: false, message: 'Forbidden – owners only' });
  }
  next();
};

export const protectedRoute = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token && req.cookies?.token) token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ success: false, message: 'Unauthorized – no token provided' });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Unauthorized – invalid token' });
    }

    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    req.user = user as IUser;
    next();
  } catch (err) {
    console.error('protectRoute error:', err);
    next(err);
  }
};

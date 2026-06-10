import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15min
  max: 100, // limit each ip to 100 requests per windowMs
  message: 'Too many requests from this IP. Please try again after 15 minutes',
});

export const bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // requests per hour
  message: {
    success: false,
    message: 'Too many booking attempts. Please try again after 1 hour.',
  },
  // keyGenerator: (req: Request, res: Response) => {
  //   const userReq = req as any;
  //   if (userReq.user?.id) return userReq.user.id;
  //   return req.ip || 'default';
  // },
});

// Note: voiceLimiter has been removed since the voice agent was completely stripped out.

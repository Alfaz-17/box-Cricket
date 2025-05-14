export const isOwner = (req, res, next) => {
  if (!req.user || req.user.role !== 'owner') {
    return res
      .status(403)
      .json({ success: false, message: 'Forbidden – owners only' });
  }
  next();
};
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import dotenv from 'dotenv';
dotenv.config();

export const protectedRoute = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: 'Unauthorized – no token provided' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res
        .status(401)
        .json({ success: false, message: 'Unauthorized – invalid token' });
    }

    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('protectRoute error:', err);
    // Delegate to global error handler
    next(err);
  }
};

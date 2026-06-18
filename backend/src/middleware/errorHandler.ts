import { Request, Response, NextFunction } from 'express';

// Define a custom error interface
interface CustomError extends Error {
  statusCode?: number;
}

import { logger } from '../utils/logger.js';

export const errorHandler = (err: CustomError, req: Request, res: Response, next: NextFunction) => {
  // Log the error to our Winston file and console
  logger.error(`[Error Handler] ${err.message}`, { stack: err.stack, path: req.path, method: req.method });

  // Set default status code if none is provided
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Send a clean response to the client
  res.status(statusCode).json({
    success: false,
    message: message,
    // Only send the stack trace if we are NOT in production
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

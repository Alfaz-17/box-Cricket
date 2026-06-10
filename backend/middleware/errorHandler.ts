import { Request, Response, NextFunction } from 'express';

// Define a custom error interface
interface CustomError extends Error {
  statusCode?: number;
}

export const errorHandler = (err: CustomError, req: Request, res: Response, next: NextFunction) => {
  // Log the error for our own debugging
  console.error(`[Error] ${err.message}`);
  if (err.stack) {
    console.error(err.stack);
  }

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

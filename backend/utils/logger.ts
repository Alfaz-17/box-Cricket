import winston from 'winston';

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Custom log format for readability
const customFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }), // Automatically capture stack traces
    customFormat
  ),
  transports: [
    // 1. Log errors to a dedicated error.log file
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    // 2. Log everything to a combined.log file
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// 3. If we're not in production, also log to the console with beautiful colors
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: combine(
      colorize(),
      timestamp({ format: 'HH:mm:ss' }),
      printf(({ level, message, timestamp, stack }) => {
        return `${timestamp} ${level}: ${stack || message}`;
      })
    )
  }));
}

import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

export const generateToken = (userId: string): string => {
  // TypeScript strictly checks if JWT_SECRET might be undefined
  const secret = process.env.JWT_SECRET as string;
  
  const token = jwt.sign({ userId }, secret, {
    expiresIn: '7d',
  });

  return token; // Don't set cookie
}

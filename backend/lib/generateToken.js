
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv';
dotenv.config();

export const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

res.cookie("token", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // true in production (HTTPS)
  sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", // Cross-site only in production
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

  return token;
};


import jwt from 'jsonwebtoken'

export const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("token", token, {
    httpOnly: true,          // Prevent access via JS (for security)
    secure: true,            // Send only over HTTPS (important for Vercel + Render)
    sameSite: "None",        // Allow cross-origin cookie sharing (Vercel ↔ Render)
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return token;
};

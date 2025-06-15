
import jwt from 'jsonwebtoken'

export const generateToken=(userId,res)=>{


    const token=jwt.sign({userId},process.env.JWT_SECRET,{
        expiresIn:"7d"
    })
  res.cookie("token", token, {
  httpOnly: true,
  secure: false, // ✅ false for HTTP (true only if using HTTPS)
  sameSite: 'Lax', // or 'None' if frontend and backend are on different domains
  maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
});

    return token;
}
// middleware/auth.js  –– token‑auth branch
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import dotenv from 'dotenv'
dotenv.config()

/* ───────────────────────────────────────────
   Owner‑only guard
─────────────────────────────────────────── */
export const isOwner = (req, res, next) => {
  if (!req.user || req.user.role !== 'owner') {
    return res.status(403).json({ success: false, message: 'Forbidden – owners only' })
  }
  next()
}

/* ───────────────────────────────────────────
   Auth guard (header‑token version)
─────────────────────────────────────────── */
export const protectedRoute = async (req, res, next) => {
  try {
    /* 1. Grab token from  Authorization: Bearer <token>  */
    let token = null
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1]
    }

    /* (optional) fallback to cookie for dev/Postman */
    if (!token && req.cookies?.token) token = req.cookies.token

    if (!token) {
      return res.status(401).json({ success: false, message: 'Unauthorized – no token provided' })
    }

    /* 2. Verify token */
    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Unauthorized – invalid token' })
    }

    /* 3. Attach user to request */
    const user = await User.findById(decoded.userId).select('-password')
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    req.user = user
    next()
  } catch (err) {
    console.error('protectRoute error:', err)
    next(err) // delegate to global error handler
  }
}

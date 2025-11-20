// routes/authRoutes.js
import express from 'express'
import {
  login,
  getMe,
  logout,
  sendOtp,
  verifyOtp,
  completeSignup,
  forgotPas,
  updateProfile,
  getAllUsers,
} from '../controllers/authController.js'
import { protectedRoute } from '../middleware/auth.js'

const router = express.Router()
router.post('/otp', sendOtp)

router.post('/verify-otp', verifyOtp)
router.post('/signup', completeSignup)
router.put('/update-profile', protectedRoute, updateProfile)
router.post('/forgot-password', forgotPas)
router.post('/login', login)
router.post('/me', protectedRoute, getMe)
router.post('/logout', logout)

router.get('/users', getAllUsers)
export default router

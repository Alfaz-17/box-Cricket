import express from 'express'
import { addReview, getReviews } from '../controllers/reviewController.js'
import { protectedRoute } from '../middleware/auth.js'
import { markAllAsRead } from '../controllers/notificationController.js'

const router = express.Router()

router.post('/create/:id', protectedRoute, addReview) // List all cricket boxes
router.get('/:id', protectedRoute, getReviews) // Box details by ID
router.get('/isRead', protectedRoute, markAllAsRead)

export default router

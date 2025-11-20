import express from 'express'
import { protectedRoute } from '../middleware/auth.js'
import { getAllMessages, sendMessage } from '../controllers/messageController.js'

const router = express.Router()

router.post('/send', protectedRoute, sendMessage)
router.get('/all/:groupId', protectedRoute, getAllMessages)

export default router

import { Router } from 'express';
import { chatWithGemini } from '../controllers/aiController.js';
import { aiChatLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/chat', aiChatLimiter, chatWithGemini);

export default router;

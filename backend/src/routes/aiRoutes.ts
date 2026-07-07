import { Router } from 'express';
import { chatWithGemini } from '../controllers/aiController.js';

const router = Router();

router.post('/chat', chatWithGemini);

export default router;

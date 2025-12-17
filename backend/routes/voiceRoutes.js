import express from "express";
import {upload} from '../middleware/upload.js';
import {voiceCheckSlot, getWelcomeMessage} from '../controllers/voiceController.js';
import { voiceLimiter } from '../middleware/rateLimiter.js';

const router =express.Router();


router.post("/check-slot", voiceLimiter, upload.single("audio"), voiceCheckSlot);
router.get("/welcome", getWelcomeMessage);


export default router;
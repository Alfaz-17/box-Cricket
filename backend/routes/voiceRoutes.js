import express from "express";
import {upload} from '../middleware/upload.js';
import {voiceCheckSlot} from '../controllers/voiceController.js';

const router =express.Router();


router.post("/check-slot",upload.single("audio"),voiceCheckSlot);;


export default router;
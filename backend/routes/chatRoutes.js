import express from "express";
import { textCheckSlot } from "../controllers/chatController.js";

const router = express.Router();

router.post("/check-slot", textCheckSlot);

export default router;

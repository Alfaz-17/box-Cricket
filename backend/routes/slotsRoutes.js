import express from 'express';
import { isOwner, protectedRoute } from '../middleware/auth.js';
import { blockTimeSlot, getBlockedAndBookedSlots, unblockTimeSlot } from '../controllers/SlotsController.js';


const router =express.Router();






router.post("/block-slots",protectedRoute,isOwner, blockTimeSlot);
router.get("/booked-blocked-slots/:id",protectedRoute,getBlockedAndBookedSlots)
router.delete('/unblock/:slotId', protectedRoute,isOwner, unblockTimeSlot);


export default router;
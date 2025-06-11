import express from 'express';
import { isOwner, protectedRoute } from '../middleware/auth.js';
import { getDasboardSummary } from '../controllers/analyticsControoller.js';


const router=express.Router();



router.get("/owner",protectedRoute,getDasboardSummary)




export default router;






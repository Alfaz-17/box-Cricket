import express from 'express';
import { isOwner, protectedRoute } from '../middleware/auth.js';
import { getDasboardSummary } from '../controllers/analyticsController.js';


const router=express.Router();



router.get("/owner",protectedRoute,isOwner,getDasboardSummary)




export default router;






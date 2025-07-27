import express from 'express';
import { protectedRoute } from '../middleware/auth.js';
import { isOwner } from '../middleware/role.js';

import {
  createBox,
  deleteBox,
  feedBackAndSupport,
  getAllBoxes,
  getBoxDetails,
  getOwnerBoxes,
  updateBox,
} from '../controllers/boxController.js';
import { getAvailableBoxes } from '../controllers/bookingController.js';




const router = express.Router();

//owner 
router.post("/create", protectedRoute,isOwner,createBox);
router.put("/update/:id", protectedRoute, isOwner, updateBox);
router.delete("/delete/:id", protectedRoute, isOwner, deleteBox);
router.post("/support",protectedRoute,feedBackAndSupport);
router.get("/my-box", protectedRoute, isOwner, getOwnerBoxes);

//public
router.get("/public", getAllBoxes);           // List all cricket boxes
router.get("/public/:id",getBoxDetails); 
router.post("/availableBoxes",getAvailableBoxes)    // Box details by ID


export default router;

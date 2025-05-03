import express from 'express'
import { protectedRoute } from '../middleware/auth.js';
import { isOwner } from '../middleware/role.js';
import { createBox, deleteBox, getOwnerBoxes, updateBox } from '../controllers/boxController.js';



const router =express.Router();



router.post("/create",protectedRoute,isOwner,createBox);
router.put("/update/:id",protectedRoute,isOwner,updateBox)
router.delete("/delete/:id",protectedRoute,isOwner,deleteBox)
router.get("/my-box",protectedRoute,isOwner,getOwnerBoxes)

export default router
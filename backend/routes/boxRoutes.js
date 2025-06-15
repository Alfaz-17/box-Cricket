import express from 'express';
import { protectedRoute } from '../middleware/auth.js';
import { isOwner } from '../middleware/role.js';

import {
  createBox,
  deleteBox,
  feedBackAndSupport,
  getOwnerBoxes,
  updateBox,
} from '../controllers/boxController.js';




const router = express.Router();

// No multer now, frontend uploads to Cloudinary directly
router.post("/create", protectedRoute,isOwner,createBox);
router.put("/update/:id", protectedRoute, isOwner, updateBox);

router.delete("/delete/:id", protectedRoute, isOwner, deleteBox);
router.get("/my-box", protectedRoute, isOwner, getOwnerBoxes);
router.post("/support",protectedRoute,feedBackAndSupport)
export default router;

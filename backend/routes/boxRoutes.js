import express from 'express';
import { protectedRoute } from '../middleware/auth.js';
import { isOwner } from '../middleware/role.js';
import upload from '../lib/multer.js'; 
import {
  addReview,
  createBox,
  deleteBox,
  getOwnerBoxes,
  updateBox,
} from '../controllers/boxController.js';

const router = express.Router();

// No multer now, frontend uploads to Cloudinary directly
router.post(
  "/create",
  protectedRoute,
  isOwner,
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'images', maxCount: 5 },
  ]),
  createBox
);
router.put("/update/:id", protectedRoute, isOwner, updateBox);

router.delete("/delete/:id", protectedRoute, isOwner, deleteBox);
router.get("/my-box", protectedRoute, isOwner, getOwnerBoxes);
router.post("/:id/review", protectedRoute, addReview);

export default router;

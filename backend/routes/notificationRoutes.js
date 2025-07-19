import express from 'express';
import { protectedRoute } from '../middleware/auth.js';
import {getNotifications,deleteNotification, markAllAsRead, getUnreadCount} from '../controllers/notificationController.js'


const router=express.Router();


router.get("/",protectedRoute,getNotifications);
router.post("/deleteNotification/:notificationId",protectedRoute,deleteNotification);
router.put("/mark-all-read",protectedRoute,markAllAsRead);
router.get("/unread-count",protectedRoute,getUnreadCount)


export default router
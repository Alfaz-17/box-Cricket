import express from 'express';
import { protectedRoute } from '../middleware/auth.js';
import {  createGroup, deleteGroup, getGroupMembers, groupNotification, inviteToGroup, joinGroup, leaveGroup, myGroups } from '../controllers/groupController.js';
import { deleteNotification } from '../controllers/notificationController.js';

const router=express.Router();


router.post("/create",protectedRoute,createGroup);
router.post("/invite",protectedRoute,inviteToGroup);
router.post("/join",protectedRoute,joinGroup);
router.get("/myGroups",protectedRoute,myGroups);

router.post("/getMembers/:groupId",protectedRoute,getGroupMembers);
router.post("/delete/:groupId",protectedRoute,deleteGroup);
router.post("/leave/:groupId",protectedRoute,leaveGroup);


router.get("/notification",protectedRoute,groupNotification);
router.post("/deleteNotification/:notificationId",protectedRoute,deleteNotification);

export default router;
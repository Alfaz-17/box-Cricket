import express from 'express'
import { protectedRoute } from '../middleware/auth.js'
import {
  createGroup,
  deleteGroup,
  getGroupMembers,
  inviteToGroup,
  joinGroup,
  leaveGroup,
  myGroups,
} from '../controllers/groupController.js'

const router = express.Router()

router.post('/create', protectedRoute, createGroup)
router.post('/invite', protectedRoute, inviteToGroup)
router.post('/join', protectedRoute, joinGroup)
router.get('/myGroups', protectedRoute, myGroups)

router.post('/getMembers/:groupId', protectedRoute, getGroupMembers)
router.post('/delete/:groupId', protectedRoute, deleteGroup)
router.post('/leave/:groupId', protectedRoute, leaveGroup)

export default router

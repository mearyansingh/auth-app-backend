import express from 'express'
import userAuth from '../middleware/userAuth.js'
import { getUserData, getUserProfile, updateUserProfile } from '../controllers/userController.js'

const userRouter = express.Router()

// '/api/user'
//User profile routes
// userRouter.get('/data', userAuth, getUserData)
userRouter.get('/profile', userAuth, getUserProfile).put('/profile', userAuth, updateUserProfile)

export default userRouter
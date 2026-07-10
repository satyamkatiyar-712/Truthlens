import express from 'express'
import { upload } from '../middleware/upload.js'
import { ConnectingAi } from '../controllers/Aiconnection.js'
import { authHandlerMiddleware } from '../middleware/authHandler.js'
const router=express.Router()

router.post("/user/verify",upload.single('image'),authHandlerMiddleware,ConnectingAi)

export default router
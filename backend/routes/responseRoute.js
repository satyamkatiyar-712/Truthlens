import express from 'express'
import { upload } from '../middleware/upload.js'
import { ConnectingAi } from '../controllers/Aiconnection.js'
const router=express.Router()

router.post("/user/verify",upload.single('image'),ConnectingAi)

export default router
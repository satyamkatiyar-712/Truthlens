import express from 'express'
import { SignupUser } from '../controllers/userSignin.js'
import { Loginuser } from '../controllers/userSignin.js'
import { LogoutUser } from '../controllers/userSignin.js'
import { authHandlerMiddleware } from '../middleware/authHandler.js'
import { SendOtp } from '../controllers/userSignin.js'

const router= express.Router()

router.post("/user/signup",SignupUser)
router.post("/user/signin",Loginuser)
router.post("/user/logout",authHandlerMiddleware,LogoutUser)
router.post("/user/send-otp", SendOtp);

export default router 
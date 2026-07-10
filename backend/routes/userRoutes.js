import express from 'express'
import { SignupUser ,Loginuser,LogoutUser,SendOtp,forgotPasswordOtp,resetPassword} from '../controllers/userSignin.js'
import { authHandlerMiddleware } from '../middleware/authHandler.js'

const router= express.Router()

router.post("/user/signup",SignupUser)
router.post("/user/signin",Loginuser)
router.post("/user/logout",authHandlerMiddleware,LogoutUser)
router.post("/user/send-otp", SendOtp);
router.post("/user/forgot-password-otp", forgotPasswordOtp);
router.post("/user/reset-password", resetPassword);

// routes/userRoutes.js
router.get("/user/check-auth", authHandlerMiddleware, (req, res) => {
    res.status(200).json({ success: true, message: "Session active" });
});

export default router
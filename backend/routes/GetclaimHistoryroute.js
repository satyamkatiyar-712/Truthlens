import express from 'express'
import { FindtheClaims } from '../controllers/FetchClaimHistory.js'
import { DeleteHistory } from '../controllers/Aiconnection.js'
import { UpdateHistory } from '../controllers/Aiconnection.js'
import { TogglePinHistory } from '../controllers/Aiconnection.js'
import { authHandlerMiddleware } from '../middleware/authHandler.js'

const router = express.Router()

router.get("/user/claims",authHandlerMiddleware,FindtheClaims)
router.delete("/user/claim/delete/:id",authHandlerMiddleware,DeleteHistory)
router.put("/user/claim/update/:id",authHandlerMiddleware,UpdateHistory)
router.put("/user/claim/pin/:id",authHandlerMiddleware,TogglePinHistory);


export default router 
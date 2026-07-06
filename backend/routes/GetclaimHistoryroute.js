import express from 'express'
import { FindtheClaims } from '../controllers/FetchClaimHistory.js'
import { DeleteHistory } from '../controllers/Aiconnection.js'
import { UpdateHistory } from '../controllers/Aiconnection.js'
import { TogglePinHistory } from '../controllers/Aiconnection.js'
const router = express.Router()

router.get("/user/claims",FindtheClaims)
router.delete("/user/claim/delete/:id",DeleteHistory)
router.put("/user/claim/update/:id",UpdateHistory)
router.put("/user/claim/pin/:id", TogglePinHistory);


export default router
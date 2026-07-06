import express from 'express';
import responseRoute from "./routes/responseRoute.js"
import claimHistoryRoute from "./routes/GetclaimHistoryroute.js"
import cors from 'cors'

const app = express();

app.use(cors())
app.use(express.json());

app.use("/api",responseRoute)
app.use("/api",claimHistoryRoute)

export default app;
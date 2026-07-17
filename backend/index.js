import express from 'express';
import cookieParser from 'cookie-parser';
import responseRoute from "./routes/responseRoute.js"
import claimHistoryRoute from "./routes/GetclaimHistoryroute.js"
import userRoutes from "./routes/userRoutes.js"
import cors from 'cors'

const app = express();
app.use(cookieParser());
app.set('trust proxy', 1);
app.use(cors({
    origin: "http://localhost:5173", 
    credentials: true 
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/api",responseRoute)
app.use("/api",claimHistoryRoute)
app.use("/api",userRoutes)

export default app;
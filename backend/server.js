// server.js
import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import connectMongoDB from './lib/connectMongoDB.js'
import cookieParser from 'cookie-parser';
import boxRoutes from "./routes/boxRoutes.js";
import bookingRoutes from './routes/bookingRoutes.js'
import reviewRoutes from './routes/reviewRoutes.js';
import slotsRoutes from './routes/slotsRoutes.js';
import analyticsRoute from './routes/analyticsRoute.js'
import { startBot } from './lib/whatsappBot.js'
import cors from 'cors'
dotenv.config();
const app = express();

  app.use(cors({origin: 'http://localhost:5173',credentials:true}))



app.use(cookieParser());
app.use(express.json({ limit: '20mb' })); // For JSON requests
app.use(express.urlencoded({ extended: true, limit: '20mb' })); // For form submissions
const PORT = process.env.PORT || 5000


app.use("/api/auth", authRoutes);
app.use("/api/boxes", boxRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/reviews",reviewRoutes);
app.use("/api/slots",slotsRoutes);
app.use("/api/analytics",analyticsRoute);


//start whatsApp chaybot
startBot().then(() => {
    console.log("WhatsApp bot started successfully");
}).catch(err => {
    console.error("Failed to start WhatsApp bot:", err);
});



console.log(process.env.PORT)
app.listen(PORT,()=>{
    console.log("server is runnning on port",PORT);


    connectMongoDB();
})
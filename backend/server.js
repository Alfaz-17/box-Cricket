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
import analyticsRoutes from './routes/analyticsRoutes.js'
import groupRoutes from './routes/groupRoutes.js'
import messageRoutes from './routes/messageRoutes.js'
import notificationRoutes from './routes/notificationRoutes.js'
import { startBot } from './lib/whatsappBot.js';
import http from 'http';
import cors from 'cors'
import { initSocket } from "./lib/soket.js";
import "./workers/otpWorker.js";
import { generalLimiter } from "./middleware/rateLimiter.js";
dotenv.config();
const app = express();

//create socket server
const server=http.createServer(app);
initSocket(server);
app.use(generalLimiter);
app.use(
  cors({
    origin:process.env.CLIENT_URL || "http://localhost:5173",

  })
);


app.use(cookieParser());
app.use(express.json({ limit: '20mb' })); // For JSON requests
app.use(express.urlencoded({ extended: true, limit: '20mb' })); // For form submissions
const PORT = process.env.PORT || 5000


app.use("/api/auth", authRoutes);
app.use("/api/boxes", boxRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/reviews",reviewRoutes);
app.use("/api/slots",slotsRoutes);
app.use("/api/analytics",analyticsRoutes);
app.use("/api/group",groupRoutes);
app.use("/api/messages",messageRoutes);
app.use("/api/notification",notificationRoutes)

//start whatsApp chaybot
startBot().then(() => {
    console.log("WhatsApp bot started successfully");
}).catch(err => {
    console.error("Failed to start WhatsApp bot:", err);
});



console.log(process.env.PORT)
server.listen(PORT,()=>{
    console.log("server is runnning on port",PORT);


    connectMongoDB();
})
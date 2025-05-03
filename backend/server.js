// server.js
import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import connectMongoDB from './lib/connectMongoDB.js'
import cookieParser from 'cookie-parser';
import boxRoutes from "./routes/boxRoutes.js";
import bookingRoutes from './routes/bookingRoutes.js'
import ownerRoutes from './routes/ownerRoutes.js'
import publicRoutes from "./routes/publicRoutes.js";

dotenv.config();
const app = express();

// ✅ Apply express.raw() *only* for the webhook route
app.use(
    "/api/booking/webhook",
    express.raw({ type: "application/json" }),
    bookingRoutes
  );


app.use(cookieParser())
app.use(express.json());
const PORT = process.env.PORT || 5000


app.use("/api/auth", authRoutes);
app.use("/api/box", boxRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/owners", ownerRoutes);
app.use("/api/public", publicRoutes);

console.log(process.env.PORT)
app.listen(PORT,()=>{
    console.log("server is runnning on port",PORT);
    connectMongoDB();
})
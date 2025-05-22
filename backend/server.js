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
import reviewRoutes from './routes/reviewRoutes.js'
import cors from 'cors'
dotenv.config();
const app = express();

// ✅ Apply express.raw() *only* for the webhook route
app.use(
    "/api/booking/webhook",
    express.raw({ type: "application/json" }),
    bookingRoutes
  );
  app.use(cors({origin:"http://localhost:5173",credentials:true}))

// --- GLOBAL JSON ERROR HANDLER ---
app.use((err, req, res, next) => {
  console.error('🔥 Unhandled error:', err);

  // Build a real string from whatever was thrown
  let message;
  if (typeof err === 'string') {
    message = err;
  } else if (err instanceof Error) {
    message = err.message;
  } else {
    // Could be a plain object from multer/cloudinary
    try {
      message = JSON.stringify(err);
    } catch {
      message = String(err);
    }
  }

  res
    .status(err.status || 500)
    .json({ success: false, message });
});

app.use(cookieParser());
app.use(express.json({ limit: '20mb' })); // For JSON requests
app.use(express.urlencoded({ extended: true, limit: '20mb' })); // For form submissions
const PORT = process.env.PORT || 5000


app.use("/api/auth", authRoutes);
app.use("/api/boxes", boxRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/owners", ownerRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/reviews",reviewRoutes)
console.log(process.env.PORT)
app.listen(PORT,()=>{
    console.log("server is runnning on port",PORT);
    connectMongoDB();
})
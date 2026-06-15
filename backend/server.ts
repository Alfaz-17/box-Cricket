// server.js
import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import { envVars } from './utils/envValidation.js';
import authRoutes from './routes/authRoutes.js';
import connectMongoDB from './lib/connectMongoDB.js'
import cookieParser from 'cookie-parser'
import boxRoutes from './routes/boxRoutes.js'
import bookingRoutes from './routes/bookingRoutes.js'
import reviewRoutes from './routes/reviewRoutes.js'
import slotsRoutes from './routes/slotsRoutes.js'
import analyticsRoutes from './routes/analyticsRoutes.js'
import chatRoutes from './routes/chatRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js'
import sitemapRouter from './routes/sitemap.js'
import { logger } from './utils/logger.js'


// Removed WhatsApp import
import http from 'http'
import cors from 'cors'
import { initSocket } from './lib/soket.js'
import { generalLimiter } from './middleware/rateLimiter.js'
import mime from 'mime'
import { startPendingBookingCleanup } from './cron/cleanupPendingBookings.js'

dotenv.config()
const app = express()

// Start the cleanup jobs immediately
startPendingBookingCleanup();

//create socket server
const server = http.createServer(app)

// 🛡️ Enterprise Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Allows your frontend to fetch data
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" } // Allows Google Login popup
})); // Sets secure HTTP headers

app.use(generalLimiter);
app.use(
  cors({
    origin: [
      process.env.CLIENT_URL,
      process.env.CLIENT_URL_TEST,
      "http://localhost:5173",  // optional local dev
    ].filter(Boolean),
  })
)


app.use(cookieParser())
app.use(express.json({ limit: '20mb' })) // For JSON requests
app.use(express.urlencoded({ extended: true, limit: '20mb' })) // For form submissions

// app.use(mongoSanitize()); // Removed due to getter property conflict (Zod + Mongoose handle validation)

// Removed Voice Agent Audio Serving Logic

const PORT = envVars.PORT || 5001

app.use('/api/auth', authRoutes)
app.use('/api/boxes', boxRoutes)
app.use('/api/booking', bookingRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/slots', slotsRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use("/api/chat", chatRoutes)
import { errorHandler } from './middleware/errorHandler.js';

app.use('/api/payment', paymentRoutes)
app.use('/', sitemapRouter) // Sitemap route

// Use Global Error Handler (Must be after all routes)
app.use(errorHandler);

//start whatsApp chaybot


// Connect to MongoDB
await connectMongoDB();

server.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});

initSocket(server)

import { Request, Response } from 'express';
app.get("/", (req: Request, res: Response) => res.send("OK"));

// WhatsApp bot removed


// server.js
import express from 'express'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import authRoutes from './routes/authRoutes.js'
import connectMongoDB from './lib/connectMongoDB.js'
import cookieParser from 'cookie-parser'
import boxRoutes from './routes/boxRoutes.js'
import bookingRoutes from './routes/bookingRoutes.js'
import reviewRoutes from './routes/reviewRoutes.js'
import slotsRoutes from './routes/slotsRoutes.js'
import analyticsRoutes from './routes/analyticsRoutes.js'
import voiceRoutes from './routes/voiceRoutes.js'


import { startBot } from './lib/whatsappBot.js'
import http from 'http'
import cors from 'cors'
import { initSocket } from './lib/soket.js'
import { generalLimiter } from './middleware/rateLimiter.js'
import mime from 'mime'
import { startCleanupJob } from './cron/cleanupVoiceFiles.js'

dotenv.config()
const app = express()

// Start the cleanup job immediately
startCleanupJob();

//create socket server
const server = http.createServer(app)

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

// Serve uploaded audio files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.get("/uploads/voice_:id.mp3", async (req, res, next) => {
  const filePath = path.join(__dirname, "../uploads", `voice_${req.params.id}.mp3`);
  
  // fs module needed for exists logic
  const fs = await import('fs');

  let attempts = 0;
  const maxAttempts = 50; // 5 seconds (50 * 100ms)

  const checkFile = () => {
    if (fs.existsSync(filePath)) {
      next(); // File exists, let express.static serve it
    } else {
      attempts++;
      if (attempts >= maxAttempts) {
        return res.status(404).send("Audio generation timed out");
      }
      setTimeout(checkFile, 100); // Wait 100ms and check again
    }
  };

  checkFile();
});

app.use(
  "/uploads",
  express.static(path.join(__dirname, "../uploads"), {
    setHeaders: (res, filePath) => {
      res.setHeader("Content-Type", mime.getType(filePath));
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET");
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    }
  })
);

const PORT = process.env.PORT || 5001

app.use('/api/auth', authRoutes)
app.use('/api/boxes', boxRoutes)
app.use('/api/booking', bookingRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/slots', slotsRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use("/api/voice",voiceRoutes)

//start whatsApp chaybot


console.log(process.env.PORT)
server.listen(PORT, () => {
  console.log('server is runnning on port', PORT)

  connectMongoDB()
});

initSocket(server)

app.get("/", (req, res) => res.send("OK"));

startBot()
  .then(() => {
    console.log('WhatsApp bot started successfully')
  })
  .catch(err => {
    console.error('Failed to start WhatsApp bot:', err)
  })

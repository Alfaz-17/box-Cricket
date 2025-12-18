import rateLimit from 'express-rate-limit'

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, //15min
  max: 100, // limit each ip to 100 request per windowsMs
  message: 'Too many request frrom this Ip Pleaes try again after 15 minitues',
})

export const bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max:20, //  requests per hour
  message: {
    success: false,
    message: 'Too many booking attempts. Please try again  after 1 hour.',
  },

  // this is count req per user and without keygenrator its count on ip per request
  // keyGenerator: (req, res) => {
  //   if (req.user?.id) return req.user._id
  //   return ipKeyGenerator(req, res)
  // },
})


import { textToSpeechLMNT } from '../lib/textToSpeechLMNT.js';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const voiceLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 40, // User set to 2 for testing
  handler: (req, res, next, options) => {
    const errorMsg = "आपने इस घंटे के लिए अपनी 10 वॉयस रिक्वेस्ट का उपयोग कर लिया है। कृपया बाद में प्रयास करें।";
    const audioFileName = "voice_limit_hindi.mp3";
    const filePath = path.join(__dirname, '../uploads', audioFileName);

    // ⚡ OPTIMIZATION: Check if static file already exists
    if (!fs.existsSync(filePath)) {
      // Use murf for consistency
      import('../lib/textToSpeechMurf.js').then(({ textToSpeechMurf }) => {
         textToSpeechMurf(errorMsg, "hi", audioFileName)
           .catch(err => console.error("Rate Limit TTS Failed:", err));
      });
    }

    res.status(429).json({
      success: false,
      message: 'Voice request limit reached.',
      isError: true,
      voiceText: "Rate limit exceeded",
      replyText: errorMsg,
      audioUrl: `/uploads/${audioFileName}`
    });
  }
})

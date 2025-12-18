import { textToSpeechMurf } from '../lib/textToSpeechMurf.js';
import dotenv from 'dotenv';
dotenv.config();

const welcomeText = "मोटा भाई, मैं आपकी स्लॉट चेक करने में मदद कर सकता हूँ। बस आप तारीख और समय बता दीजिए।";
const audioFileName = "welcome_mota_bhai_v2.mp3";

async function run() {
  console.log("Generating static welcome message...");
  await textToSpeechMurf(welcomeText, "hi", audioFileName);
  
  console.log("Generating static rate limit message...");
  const errorMsg = "आपने इस घंटे के लिए अपनी 10 वॉयस रिक्वेस्ट का उपयोग कर लिया है। कृपया बाद में प्रयास करें।";
  await textToSpeechMurf(errorMsg, "hi", "voice_limit_hindi.mp3");
  
  console.log("Done.");
}

run();

import fs from "fs";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

// Voice IDs based on Murf.ai standard naming conventions (Locale-Name)
// Fallbacks provided in comments if these specific IDs change
const VOICES = {
  hi: "hi-IN-kabir",  // Male Hindi
  en: "en-US-cooper", // Male US English
  gu: "gu-IN-default" // Placeholder, will use Google TTS fallback
};

export async function textToSpeechMurf(text, language = "hi", explicitFileName = null) {
  // 1️⃣ Special handling for Gujarati (Google TTS for native pronunciation)
  if (language === "gu") {
    try {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=gu&client=tw-ob`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error("Google TTS failed");
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const fileName = explicitFileName || `voice_${Date.now()}.mp3`;
      await fs.promises.writeFile(`uploads/${fileName}`, buffer);
      
      return fileName;
    } catch (err) {
      console.error("Google TTS Error:", err);
      // Fallback to Hindi-Murf logic below if this fails? 
      // For now, let it fall through to mapped Hindi or throw.
      // We will let it fall through to Murf with 'hi' if we want, or throw.
      // Let's just throw to keep behavior consistent with previous impl.
      throw err; 
    }
  }

  // 2️⃣ Murf.ai for others
  // Map languages to configured voices
  const voiceId = VOICES[language] || VOICES.en;

  console.log(`🎙️ Generating Speech with Murf.ai | Voice: ${voiceId} | Text: ${text.substring(0, 20)}...`);

  const apiKey = process.env.MURF_API_KEY;
  if (!apiKey) {
      console.error("❌ MURF_API_KEY is undefined in environment variables");
      throw new Error("Missing Murf API Key");
  }
  // console.log(`🔐 API Key loaded: ${apiKey.substring(0, 4)}...`);

  try {
      const response = await fetch("https://api.murf.ai/v1/speech/stream", {
        method: "POST",
        headers: {
          "api-key": apiKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          voiceId: voiceId,
          text: text,
          format: "mp3",
          model: "GEN2"
          // encodeAsBase64 is NOT supported on stream endpoint
        })
      });

      if (!response.ok) {
        // Try to read error as text
        const errText = await response.text();
        console.error(`❌ Murf API Error [${response.status}]:`, errText);
        throw new Error(`Murf TTS failed: ${response.status} ${response.statusText}`);
      }

      // Stream endpoint returns binary data directly
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const fileName = explicitFileName || `voice_${Date.now()}.mp3`;
      await fs.promises.writeFile(`uploads/${fileName}`, buffer);
      console.log(`✅ TTS Saved (Stream): ${fileName}`);

      return fileName;

  } catch (error) {
      console.error("❌ TextToSpeechMurf Error:", error);
      throw error;
  }
}

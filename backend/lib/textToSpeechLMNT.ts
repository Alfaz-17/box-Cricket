import fs from "fs";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

// You can use any voice ID — "lily" is a reasonable default.
// You can also list voices via LMNT API if needed.
const VOICES = {
  hi: "lily",
  gu: "lily",
  en: "lily"
};

export async function textToSpeechLMNT(text, language = "hi", explicitFileName = null) {
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
      // Fallback to Hindi-LMNT if Google fails? Or just throw? 
      // Let's fallback to Hindi LMNT logic below if this fails, or strict fail.
      // Strict fail is better than bad accent for now, but let's just let it fall through or throw.
      throw err; 
    }
  }

  // 2️⃣ LMNT for everything else (Hi, En, Ur->Hi)
  // Map unsupported languages to Hindi (or closest equivalent)
  const langMap = {
    ur: "hi", 
    // gu removed from here since handled above
  };
  const safeLang = langMap[language] || language;

  const response = await fetch("https://api.lmnt.com/v1/ai/speech", {
    method: "POST",
    headers: {
      "X-API-Key": process.env.LMNT_API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      text,
      voice: VOICES[language] || VOICES.hi,
      language: safeLang,
      format: "mp3"
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("LMNT Error:", errText);
    throw new Error("LMNT TTS failed");
  }

  // LMNT returns JSON with base64-encoded audio
  const jsonResponse = await response.json();
  
  // Extract and decode the base64 audio
  const audioBase64 = jsonResponse.audio;
  const audioBuffer = Buffer.from(audioBase64, 'base64');

  const fileName = explicitFileName || `voice_${Date.now()}.mp3`;
  await fs.promises.writeFile(`uploads/${fileName}`, audioBuffer);

  return fileName;
}

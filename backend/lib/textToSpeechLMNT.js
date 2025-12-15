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

export async function textToSpeechLMNT(text, language = "hi") {
  const response = await fetch("https://api.lmnt.com/v1/ai/speech", {
    method: "POST",
    headers: {
      "X-API-Key": process.env.LMNT_API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      text,
      voice: VOICES[language] || VOICES.hi,
      language: language,
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

  const fileName = `voice_${Date.now()}.mp3`;
  fs.writeFileSync(`uploads/${fileName}`, audioBuffer);

  return fileName;
}

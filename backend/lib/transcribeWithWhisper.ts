import Groq from "groq-sdk";
import fs from "fs";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export const transcribeWithWhisper = async (audioPath) => {
  try {
    const transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(audioPath),
      model: "whisper-large-v3",
      response_format: "json",
      temperature: 0.0,
    });

    return transcription.text.trim();
  } catch (error) {
    console.error("Groq Whisper error:", error);
    throw new Error("Voice transcription failed");
  }
};

import { transcribeWithWhisper } from "../lib/transcribeWithWhisper.js";
import { parseVoiceQuery } from "../lib/parseVoiceQuery.js";
import { findAvailableSlots } from "../lib/findAvailableSlots.js";


import moment from "moment";
import { buildVoiceResponse } from "../lib/buildVoiceResponse.js";
import { textToSpeechLMNT } from "../lib/textToSpeechLMNT.js";

function finalizeParsed(parsed) {
  // If AI didn't give date, assume today
  if (!parsed.date) {
    parsed.date = moment().format("YYYY-MM-DD");
  }

  // Validate date + time
  const ok = moment(
    `${parsed.date} ${parsed.startTime}`,
    "YYYY-MM-DD hh:mm A",
    true
  ).isValid();

  if (!ok) {
    throw new Error("Invalid date/time from voice input");
  }

  return parsed;
}
 
export const voiceCheckSlot = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No audio received" });
    }

    // 1️⃣ Speech → Text
    const text = await transcribeWithWhisper(req.file.path);
    console.log("User said:", text);

    // 2️⃣ Text → Intent + Time
const parsedRaw = await parseVoiceQuery(text);
const parsed = finalizeParsed(parsedRaw);
    console.log("Parsed intent:", parsed);

    // Allow both check_slot and book_slot (treat booking inquiry as a check first)
    if (parsed.intent !== "check_slot" && parsed.intent !== "book_slot") {
      return res.json({ message: "Unsupported intent" });
    }

    // 3️⃣ Find all free slots
    const result = await findAvailableSlots({
      date: parsed.date,
      startTime: parsed.startTime,
      duration: parsed.duration
    });

   // 4️⃣ Build reply text
const replyText = buildVoiceResponse({ parsed, result });

    // 5️⃣ TTS (Async / Fire & Forget)
    // We generate the filename HERE so we can return it immediately
    const audioFileName = `voice_${Date.now()}.mp3`;
    
    // Start TTS in background (don't await)
    textToSpeechLMNT(replyText, parsed.language, audioFileName)
      .catch(err => console.error("Async TTS Failed:", err));

    // 6️⃣ Respond Immediately
    return res.json({
      voiceText: text,
      replyText,
      audioUrl: `/uploads/${audioFileName}`
    });


  } catch (err) {
    console.error("Voice API Error:", err);
    
    // 🛑 Graceful Error Handling (Spoken)
    try {
      const errorMsg = "Sorry, I couldn't understand that. Please try again.";
      // Default to English or Hindi for errors based on a guess, or just English
      const audioFile = await textToSpeechLMNT(errorMsg, "en");
      
      return res.json({
        voiceText: "Error processing request",
        replyText: errorMsg,
        audioUrl: `/uploads/${audioFile}`,
        isError: true
      });
    } catch (ttsErr) {
      console.error("Critical: Error TTS also failed", ttsErr);
      res.status(500).json({ message: "Voice API error" });
      console.error("Critical: Error TTS also failed", ttsErr);
      res.status(500).json({ message: "Voice API error" });
    }
  } finally {
    // 🧹 Instant Cleanup: Delete the uploaded USER voice file
    if (req.file && req.file.path) {
      try {
        const fs = await import('fs');
        await fs.promises.unlink(req.file.path);
        console.log("Deleted temp user upload:", req.file.filename);
      } catch (dErr) {
        console.error("Failed to delete temp upload:", dErr);
      }
    }
  }
};

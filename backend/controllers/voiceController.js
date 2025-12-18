import { transcribeWithWhisper } from "../lib/transcribeWithWhisper.js";
import { parseVoiceQuery } from "../lib/parseVoiceQuery.js";
import { findAvailableSlots } from "../lib/findAvailableSlots.js";
import { getSession, updateSession, generateSessionId } from "../lib/conversationSession.js";

import moment from "moment";
import { buildVoiceResponse } from "../lib/buildVoiceResponse.js";
import { textToSpeechMurf } from "../lib/textToSpeechMurf.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🗑️ Helper for delayed deletion (to allow client to fetch)
const autoDeleteFile = (filename, delay = 10000) => {
  setTimeout(() => {
    const filePath = path.join(__dirname, '../../uploads', filename);
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) console.error(`Failed to auto-delete ${filename}:`, err);
        else console.log(`🗑️ Auto-deleted voice response: ${filename}`);
      });
    }
  }, delay);
};

function finalizeParsed(parsed) {
  // Don't set default date if we're still gathering info
  // Only validate when we have all required fields
  
  // Validate date + time (only if both exist)
  if (parsed.date && parsed.startTime) {
    const ok = moment(
      `${parsed.date} ${parsed.startTime}`,
      "YYYY-MM-DD hh:mm A",
      true
    ).isValid();

    if (!ok) {
      throw new Error("Invalid date/time from voice input");
    }
  }

  return parsed;
}
 
export const voiceCheckSlot = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No audio received" });
    }

    // 🆔 Get or create session ID
    let sessionId = req.body.sessionId;
    if (!sessionId) {
      sessionId = generateSessionId();
      console.log("🆕 New session created:", sessionId);
    } else {
      console.log("🔄 Continuing session:", sessionId);
    }

    // 📝 Retrieve conversation context
    const conversationContext = getSession(sessionId);
    console.log("📝 Conversation context:", conversationContext);

    // 1️⃣ Speech → Text
    const text = await transcribeWithWhisper(req.file.path);
    console.log("User said:", text);

    // 2️⃣ Text → Intent + Time (with context)
    const parsedRaw = await parseVoiceQuery(text, conversationContext);
    const parsed = finalizeParsed(parsedRaw);
    console.log("Parsed intent:", parsed);

    // 💾 Update session with new information
    updateSession(sessionId, {
      date: parsed.date,
      startTime: parsed.startTime,
      duration: parsed.duration,
      language: parsed.language
    });

    // Allow both check_slot and book_slot (treat booking inquiry as a check first)
    if (parsed.intent !== "check_slot" && parsed.intent !== "book_slot") {
      return res.json({ 
        message: "Unsupported intent",
        sessionId 
      });
    }

    // 🔍 CHECK IF WE NEED MORE INFORMATION
    if (parsed.needsMoreInfo) {
      console.log("⚠️ Incomplete query - asking follow-up question");
      
      // Generate follow-up question
      const replyText = await buildVoiceResponse({ parsed, result: null });
      
      // 5️⃣ TTS (Murf)
      const audioFileName = `voice_${Date.now()}.mp3`;
      try {
        await textToSpeechMurf(replyText, parsed.language, audioFileName);
        autoDeleteFile(audioFileName); // Clean up after 60s
      } catch (err) {
        console.error("TTS Failed:", err);
      }

      // 6️⃣ Respond with follow-up question
      return res.json({
        voiceText: text,
        replyText,
        audioUrl: `/uploads/${audioFileName}`,
        sessionId,
        needsMoreInfo: true,
        structuredData: null // No structured data yet
      });
    }

    // ✅ We have all information - proceed with slot query
    console.log("✅ Complete query - checking slots");

    // 3️⃣ Find all free slots
    const result = await findAvailableSlots({
      date: parsed.date,
      startTime: parsed.startTime,
      duration: parsed.duration
    });
    console.log("Result", result);

    // 4️⃣ Build Voice Response (using AI if enabled)
    const replyText = await buildVoiceResponse({ parsed, result });

    // 📊 Build Structured Response Data
    const endTime = moment(parsed.startTime, ["h:mm A", "hh:mm A"])
      .add(parsed.duration, 'hours')
      .format("hh:mm A");

    const structuredData = {
      date: moment(parsed.date).format("DD MMM YYYY"), // e.g., "17 Dec 2025"
      startTime: parsed.startTime, // e.g., "08:00 PM"
      endTime: endTime, // e.g., "10:00 PM"
      duration: parsed.duration,
      available: result.available,
      boxes: result.available && result.slots ? 
        [...new Set(result.slots.map(s => s.quarterName.replace(/-/g, "").replace(/\\s+/g, " ").trim()))] : 
        [],
      language: parsed.language
    };

    // 5️⃣ TTS (Murf)
    const audioFileName = `voice_${Date.now()}.mp3`;
    
    try {
      await textToSpeechMurf(replyText, parsed.language, audioFileName);
      autoDeleteFile(audioFileName); // Clean up after 60s
    } catch (err) {
      console.error("TTS Failed:", err);
    }

    // 6️⃣ Respond with slot availability
    return res.json({
      voiceText: text,
      replyText,
      audioUrl: `/uploads/${audioFileName}`,
      sessionId,
      needsMoreInfo: false,
      structuredData // ⭐ NEW: Structured data for UI display
    });


  } catch (err) {
    console.error("Voice API Error:", err);
    
    // 🛑 Graceful Error Handling (Spoken)
    try {
      const errorMsg = "Sorry, I couldn't understand that. Please try again.";
      const audioFileName = `voice_err_${Date.now()}.mp3`;
      await textToSpeechMurf(errorMsg, "en", audioFileName);
      autoDeleteFile(audioFileName); // Clean up
      
      return res.json({
        voiceText: "Error processing request",
        replyText: errorMsg,
        audioUrl: `/uploads/${audioFileName}`,
        isError: true
      });
    } catch (ttsErr) {
      console.error("Critical: Error TTS also failed", ttsErr);
      res.status(500).json({ message: "Voice API error" });
    }
  } finally {
    // 🧹 Instant Cleanup: Delete the uploaded USER voice file
    if (req.file && req.file.path) {
      try {
        await fs.promises.unlink(req.file.path);
        console.log("Deleted temp user upload:", req.file.filename);
      } catch (dErr) {
        console.error("Failed to delete temp upload:", dErr);
      }
    }
  }
};



// 🎙️ Welcome Message Endpoint
export const getWelcomeMessage = async (req, res) => {
  try {
    const welcomeText = "मोटा भाई, मैं आपकी स्लॉट चेक करने में मदद कर सकता हूँ। बस आप तारीख और समय बता दीजिए।";
    const audioFileName = "welcome_mota_bhai_v2.mp3"; // Incremented version to force rebuild
    const filePath = path.join(__dirname, '../../uploads', audioFileName);

    // Reuse existing file to save time/cost
    if (!fs.existsSync(filePath)) {
      console.log("🎙️ Generating New Mota Bhai Welcome Message...");
      await textToSpeechMurf(welcomeText, "hi", audioFileName);
    }
    
    return res.json({
      replyText: welcomeText,
      audioUrl: `/uploads/${audioFileName}`,
      language: "hi"
    });
  } catch (err) {
    console.error("Welcome Message Error:", err);
    res.status(500).json({ message: "Failed to generate welcome message" });
  }
};

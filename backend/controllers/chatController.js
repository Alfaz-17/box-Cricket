import { parseVoiceQuery } from "../lib/parseVoiceQuery.js";
import { findAvailableSlots } from "../lib/findAvailableSlots.js";
import { getSession, updateSession, generateSessionId } from "../lib/conversationSession.js";
import { buildVoiceResponse } from "../lib/buildVoiceResponse.js";
import moment from "moment";

function finalizeParsed(parsed) {
  // Validate date + time (only if both exist)
  if (parsed.date && parsed.startTime) {
    const ok = moment(
      `${parsed.date} ${parsed.startTime}`,
      "YYYY-MM-DD hh:mm A",
      true
    ).isValid();

    if (!ok) {
      throw new Error("Invalid date/time from input");
    }
  }
  return parsed;
}

export const textCheckSlot = async (req, res) => {
  try {
    const { text, sessionId: existingSessionId } = req.body;

    if (!text) {
      return res.status(400).json({ message: "No text received" });
    }

    // 🆔 Get or create session ID
    let sessionId = existingSessionId;
    if (!sessionId) {
      sessionId = generateSessionId();
      console.log("🆕 New chat session created:", sessionId);
    }

    // 📝 Retrieve conversation context
    const conversationContext = getSession(sessionId);
    
    // 2️⃣ Text → Intent + Time (with context)
    const parsedRaw = await parseVoiceQuery(text, conversationContext);
    const parsed = finalizeParsed(parsedRaw);
    console.log("Parsed intent (Chat):", parsed);

    // 💾 Update session with new information
    updateSession(sessionId, {
      date: parsed.date,
      startTime: parsed.startTime,
      duration: parsed.duration,
      language: parsed.language
    });

    if (parsed.intent !== "check_slot" && parsed.intent !== "book_slot") {
      return res.json({ 
        message: "Unsupported intent",
        sessionId,
        replyText: "Sorry, I can only help with checking slots." 
      });
    }

    // 🔍 CHECK IF WE NEED MORE INFORMATION
    if (parsed.needsMoreInfo) {
      // Generate follow-up question
      const replyText = await buildVoiceResponse({ parsed, result: null });
      
      return res.json({
        userText: text,
        replyText,
        sessionId,
        needsMoreInfo: true,
      });
    }

    // ✅ We have all information - proceed with slot query
    const requestDateTime = moment(`${parsed.date} ${parsed.startTime}`, "YYYY-MM-DD hh:mm A");
    const isPast = requestDateTime.isBefore(moment());
    
    let result = { available: false, slots: [] };

    if (!isPast) {
      result = await findAvailableSlots({
        date: parsed.date,
        startTime: parsed.startTime,
        duration: parsed.duration
      });
    }

    // 4️⃣ Build Response
    const replyText = await buildVoiceResponse({ parsed, result, isPast });

    // 📊 Build Structured Response Data
    const endTime = moment(parsed.startTime, ["h:mm A", "hh:mm A"])
      .add(parsed.duration, 'hours')
      .format("hh:mm A");

    const structuredData = {
      date: moment(parsed.date).format("DD MMM YYYY"),
      startTime: parsed.startTime,
      endTime: endTime,
      duration: parsed.duration,
      available: result.available,
      status: isPast ? "PAST" : (result.available ? "AVAILABLE" : "BOOKED"),
      boxes: result.available && result.slots ? 
        [...new Set(result.slots.map(s => s.quarterName.replace(/-/g, "").replace(/\\s+/g, " ").trim()))] : 
        [],
      language: parsed.language
    };

    return res.json({
      userText: text,
      replyText,
      sessionId,
      needsMoreInfo: false,
      structuredData
    });

  } catch (err) {
    console.error("Chat API Error:", err);
    res.status(500).json({ message: "Error processing chat request", error: err.message });
  }
};

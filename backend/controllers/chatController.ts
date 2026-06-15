import { parseVoiceQuery } from "../lib/parseVoiceQuery.js";
import { findAvailableSlots } from "../lib/findAvailableSlots.js";
import { getSession, updateSession, generateSessionId } from "../lib/conversationSession.js";
import { buildVoiceResponse } from "../lib/buildVoiceResponse.js";
import moment from "moment";
import { Request, Response } from 'express';

function finalizeParsed(parsed: any) {
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

export const textCheckSlot = async (req: Request, res: Response): Promise<void> => {
  try {
    const { text, sessionId: existingSessionId } = req.body;

    if (!text) {
      res.status(400).json({ message: "No text received" });
      return;
    }

    let sessionId = existingSessionId;
    if (!sessionId) {
      sessionId = generateSessionId();
      console.log("🆕 New chat session created:", sessionId);
    }

    let conversationContext = getSession(sessionId) || {};
    let chatHistory = conversationContext.chatHistory || [];
    
    chatHistory.push({ role: "User", content: text });
    if (chatHistory.length > 8) chatHistory = chatHistory.slice(-8);
    
    conversationContext.chatHistory = chatHistory;
    
    const parsedRaw = await parseVoiceQuery(text, conversationContext);
    const parsed = finalizeParsed(parsedRaw);
    console.log("Parsed intent (Chat):", parsed);

    updateSession(sessionId, {
      date: parsed.date,
      startTime: parsed.startTime,
      duration: parsed.duration,
      language: parsed.language,
      chatHistory: chatHistory
    });

    if (parsed.intent !== "check_slot" && parsed.intent !== "book_slot") {
      res.json({ 
        message: "Unsupported intent",
        sessionId,
        replyText: "Sorry, I can only help with checking slots." 
      });
      return;
    }

    if (parsed.needsMoreInfo) {
      const replyText = await buildVoiceResponse({ parsed, result: null });
      
      chatHistory.push({ role: "Assistant", content: replyText });
      updateSession(sessionId, { ...getSession(sessionId), chatHistory });

      res.json({
        userText: text,
        replyText,
        sessionId,
        needsMoreInfo: true,
      });
      return;
    }

    const requestDateTime = moment(`${parsed.date} ${parsed.startTime}`, "YYYY-MM-DD hh:mm A");
    const isPast = requestDateTime.isBefore(moment());
    
    let result: any = { available: false, slots: [] };

    if (!isPast) {
      result = await findAvailableSlots({
        date: parsed.date,
        startTime: parsed.startTime,
        duration: parsed.duration
      });
    }

    const replyText = await buildVoiceResponse({ parsed, result, isPast });

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
        [...new Set(result.slots.map((s: any) => `${s.boxName} (${s.quarterName.replace(/-/g, "").replace(/\\s+/g, " ").trim()})`))] : 
        [],
      language: parsed.language
    };

    chatHistory.push({ role: "Assistant", content: replyText });
    updateSession(sessionId, { ...getSession(sessionId), chatHistory });

    res.json({
      userText: text,
      replyText,
      sessionId,
      needsMoreInfo: false,
      structuredData
    });

  } catch (err: any) {
    console.error("Chat API Error:", err);
    res.status(500).json({ message: "Error processing chat request", error: err.message });
  }
};

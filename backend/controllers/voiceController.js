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

    if (parsed.intent !== "check_slot") {
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

// 5️⃣ TTS
const audioFile = await textToSpeechLMNT(replyText, parsed.language);

// 6️⃣ Respond
return res.json({
  voiceText: text,
  replyText,
  audioUrl: `/uploads/${audioFile}`
});


  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Voice API error" });
  }
};

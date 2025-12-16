import Groq from "groq-sdk";
import { to12HourFormat } from "./convertTo12Hour.js";
import moment from "moment";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export async function parseVoiceQuery(text) {
const today = moment().format("YYYY-MM-DD");

const prompt = `
You are an intelligent voice assistant for a cricket box booking system in India.

TODAY'S DATE IS: ${today}

STRICT RULES:
- Return ONLY valid JSON
- No explanation
- No markdown

DATE RULES:
- "aaj" / "आज" / "today" → ${today}
- "kal" / "कल" / "tomorrow" → next day from ${today}
- If no date mentioned → ${today}

TIME RULES:
- startTime MUST be in format hh:mm AM/PM
- "7 se 10" → startTime=07:00 PM, duration=3

OUTPUT:
{
  "intent": "check_slot",
  "date": "YYYY-MM-DD",
  "startTime": "hh:mm AM/PM",
  "duration": number,
  "language": "hi" // Detect language (hi, gu, or en)
}

User sentence:
"${text}"
`;



  const response = await groq.chat.completions.create({
  model: "llama-3.1-8b-instant",
    messages: [{ role: "user", content: prompt }],
    temperature: 0
  });

  const raw = response.choices[0].message.content.trim();

// 🛡️ SAFETY PARSE (THIS IS WHERE YOUR CODE GOES)
 
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Invalid AI response format");
  }

  // 🔁 NORMALIZE FOR YOUR DB SYSTEM
  parsed.startTime = to12HourFormat(parsed.startTime);

  // 🧹 Language Cleanup (AI sometimes returns "hi | gu | en" literally)
  const validLangs = ["hi", "gu", "en", "ur"];
  if (!validLangs.includes(parsed.language)) {
    // If invalid, try to guess or default to English/Hindi
    if (parsed.language && parsed.language.includes("gu")) parsed.language = "gu";
    else if (parsed.language && parsed.language.includes("hi")) parsed.language = "hi";
    else parsed.language = "en";
  }

  return parsed;
}
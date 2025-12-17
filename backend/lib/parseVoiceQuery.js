import Groq from "groq-sdk";
import { to12HourFormat } from "./convertTo12Hour.js";
import moment from "moment";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export async function parseVoiceQuery(text, conversationContext = null) {
const today = moment().format("YYYY-MM-DD");
const tomorrow = moment().add(1, 'days').format("YYYY-MM-DD");

// Calculate upcoming days for the next 7 days
const nextSunday = moment().day(7).format("YYYY-MM-DD"); // Next Sunday
const nextMonday = moment().day(8).format("YYYY-MM-DD");
const nextTuesday = moment().day(9).format("YYYY-MM-DD");
const nextWednesday = moment().day(10).format("YYYY-MM-DD");
const nextThursday = moment().day(11).format("YYYY-MM-DD");
const nextFriday = moment().day(12).format("YYYY-MM-DD");
const nextSaturday = moment().day(13).format("YYYY-MM-DD");

// Build context information for the AI
let contextInfo = "";
if (conversationContext) {
  contextInfo = `
CONVERSATION CONTEXT (Information gathered so far):
${conversationContext.date ? `- Date: ${conversationContext.date}` : "- Date: NOT SET"}
${conversationContext.startTime ? `- Time: ${conversationContext.startTime}` : "- Time: NOT SET"}
${conversationContext.duration ? `- Duration: ${conversationContext.duration} hours` : "- Duration: NOT SET"}
${conversationContext.language ? `- Language: ${conversationContext.language}` : ""}

The user is continuing a conversation. Extract NEW information from their current message and merge it with the context above.
`;
}

const prompt = `
You are an intelligent voice assistant for a cricket box booking system in India.

TODAY'S DATE IS: ${today}
TOMORROW'S DATE IS: ${tomorrow}

UPCOMING DAYS (for day name references):
- Next Sunday / Ravivar / રવિવાર: ${nextSunday}
- Next Monday / Somvar / સોમવાર: ${nextMonday}
- Next Tuesday / Mangalvar / મંગળવાર: ${nextTuesday}
- Next Wednesday / Budhvar / બુધવાર: ${nextWednesday}
- Next Thursday / Guruvar / ગુરુવાર: ${nextThursday}
- Next Friday / Shukravar / શુક્રવાર: ${nextFriday}
- Next Saturday / Shanivar / શનિવાર: ${nextSaturday}

${contextInfo}

STRICT RULES:
- Return ONLY valid JSON
- No explanation
- No markdown

DATE RULES:
- "aaj" / "आज" / "today" → ${today}
- "kal" / "कल" / "tomorrow" → ${tomorrow}
- "Ravivar" / "रविवार" / "Sunday" / "રવિવાર" → ${nextSunday}
- "Somvar" / "सोमवार" / "Monday" / "સોમવાર" → ${nextMonday}
- "Mangalvar" / "मंगलवार" / "Tuesday" / "મંગળવાર" → ${nextTuesday}
- "Budhvar" / "बुधवार" / "Wednesday" / "બુધવાર" → ${nextWednesday}
- "Guruvar" / "गुरुवार" / "Thursday" / "ગુરુવાર" → ${nextThursday}
- "Shukravar" / "शुक्रवार" / "Friday" / "શુક્રવાર" → ${nextFriday}
- "Shanivar" / "शनिवार" / "Saturday" / "શનિવાર" → ${nextSaturday}
- "20 tarik" / "20 tarikh" / "20th" → Calculate date for 20th of current month (if past, use next month)
- "25 ko" / "25 date" → Calculate date for 25th of current month (if past, use next month)
- For specific dates (1-31), calculate the actual YYYY-MM-DD date
- If no date mentioned AND no context date → ${today}
- If no date mentioned BUT context has date → keep context date

SPECIFIC DATE CALCULATION:
- If user says "20 tarik" or "20th", calculate the date:
  - If 20th of current month hasn't passed yet, use current month
  - If 20th of current month has passed, use next month
- Apply same logic for any date number (1-31)

TIME RULES:
- startTime MUST be in format hh:mm AM/PM
- "7 se 10" → startTime=07:00 PM, duration=3
- "Subah" / "Morning" = AM
- "Sham" / "Evening" / "Raat" / "Night" = PM
- "Dopahar" / "Afternoon" = PM (12 PM - 3 PM)

DURATION RULES:
- "1 ghanta" / "1 hour" → duration=1
- "2 ghante" / "2 hours" → duration=2
- "7 se 10" / "7 to 10" → calculate duration (e.g., 3 hours)
- If user says just a time without duration, set duration=null
- Default duration is 1 hour only if user explicitly mentions a single time point

INCOMPLETE QUERY DETECTION:
- If user asks general questions like "कोई स्लॉट खाली है?" / "any slot available?" / "slot free?" without date/time/duration, set needsMoreInfo=true
- If date is known but time is missing, set needsMoreInfo=true
- If date and time are known but duration is missing, set needsMoreInfo=true
- If all three (date, time, duration) are known, set needsMoreInfo=false

EXAMPLES (Follow these patterns STRICTLY):
User: "Ravivar ko slot khali hai?"
JSON: { "intent": "check_slot", "date": "${nextSunday}", "startTime": null, "duration": null, "language": "hi", "needsMoreInfo": true }

User: "20 tarik ko sham 8 baje"
JSON: { "intent": "check_slot", "date": "CALCULATE_20TH", "startTime": "08:00 PM", "duration": null, "language": "hi", "needsMoreInfo": true }

User: "Next Sunday 7 PM for 2 hours"
JSON: { "intent": "check_slot", "date": "${nextSunday}", "startTime": "07:00 PM", "duration": 2, "language": "en", "needsMoreInfo": false }

User: "Aaj sham 8 baje 2 ghante ke liye"
JSON: { "intent": "check_slot", "date": "${today}", "startTime": "08:00 PM", "duration": 2, "language": "hi", "needsMoreInfo": false }

User: "कोई स्लॉट खाली है?" (without context)
JSON: { "intent": "check_slot", "date": null, "startTime": null, "duration": null, "language": "hi", "needsMoreInfo": true }

User: "आज" (when context has no date)
JSON: { "intent": "check_slot", "date": "${today}", "startTime": null, "duration": null, "language": "hi", "needsMoreInfo": true }

User: "शाम 8 बजे" (when context has date but no time)
JSON: { "intent": "check_slot", "date": "KEEP_FROM_CONTEXT", "startTime": "08:00 PM", "duration": null, "language": "hi", "needsMoreInfo": true }

User: "2 घंटे" / "2 hours" (when context has date and time)
JSON: { "intent": "check_slot", "date": "KEEP_FROM_CONTEXT", "startTime": "KEEP_FROM_CONTEXT", "duration": 2, "language": "hi", "needsMoreInfo": false }

OUTPUT:
{
  "intent": "check_slot",
  "date": "YYYY-MM-DD or null or KEEP_FROM_CONTEXT or CALCULATE_<NUMBER>",
  "startTime": "hh:mm AM/PM or null",
  "duration": number or null,
  "language": "hi", // Detect language: "hi" (Hindi), "gu" (Gujarati), or "en" (English). If user speaks any other language (Urdu, Marathi, etc.), use "hi" as default.
  "needsMoreInfo": boolean // true if date OR time OR duration is missing
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

// 🛡️ SAFETY PARSE
 
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Invalid AI response format");
  }

  // 🔄 MERGE WITH CONVERSATION CONTEXT
  if (conversationContext) {
    // If AI returned "KEEP_FROM_CONTEXT", use the context value
    if (parsed.date === "KEEP_FROM_CONTEXT" || !parsed.date) {
      parsed.date = conversationContext.date || null;
    }
    if (parsed.startTime === "KEEP_FROM_CONTEXT" || !parsed.startTime) {
      parsed.startTime = conversationContext.startTime || null;
    }
    if (!parsed.duration && conversationContext.duration) {
      parsed.duration = conversationContext.duration;
    }
    if (!parsed.language) {
      parsed.language = conversationContext.language || "en";
    }
  }

  // 📅 HANDLE SPECIFIC DATE CALCULATIONS (e.g., "20 tarik")
  if (parsed.date && parsed.date.startsWith("CALCULATE_")) {
    const dateNumber = parseInt(parsed.date.replace("CALCULATE_", ""));
    if (!isNaN(dateNumber) && dateNumber >= 1 && dateNumber <= 31) {
      const currentDate = moment();
      const targetDate = moment().date(dateNumber);
      
      // If the date has already passed this month, use next month
      if (targetDate.isBefore(currentDate, 'day')) {
        targetDate.add(1, 'month');
      }
      
      parsed.date = targetDate.format("YYYY-MM-DD");
    }
  }

  // 🔁 NORMALIZE FOR YOUR DB SYSTEM (only if startTime exists)
  if (parsed.startTime) {
    parsed.startTime = to12HourFormat(parsed.startTime);

    // 🔧 DETERMINISTIC FIX: Force PM if AI fails but context is obvious
    const lowerText = text.toLowerCase();
    const isPMContext = ["sham", "shaam", "raat", "night", "evening", "dopahar", "afternoon", "pm"].some(word => lowerText.includes(word));
    const isAMContext = ["subah", "morning", "am"].some(word => lowerText.includes(word));

    if (parsed.startTime && parsed.startTime.includes("AM") && isPMContext && !isAMContext) {
      // User said "Raat" but AI output "AM" -> Flip it
      parsed.startTime = parsed.startTime.replace("AM", "PM");
    } else if (parsed.startTime && parsed.startTime.includes("PM") && isAMContext && !isPMContext) {
      // User said "Subah" but AI output "PM" -> Flip it
      parsed.startTime = parsed.startTime.replace("PM", "AM");
    }
  }

  // 🧹 Language Cleanup (AI sometimes returns "hi | gu | en" literally)
  const validLangs = ["hi", "gu", "en"];
  if (!validLangs.includes(parsed.language)) {
    // If invalid or unsupported language, default to Hindi
    if (parsed.language && parsed.language.includes("gu")) {
      parsed.language = "gu";
    } else if (parsed.language && parsed.language.includes("en")) {
      parsed.language = "en";
    } else {
      // Default to Hindi for all other languages (Urdu, Marathi, etc.)
      parsed.language = "hi";
      console.log(`Unsupported language detected, defaulting to Hindi. Original: ${parsed.language}`);
    }
  }

  // ✅ FINAL CHECK: Set needsMoreInfo if date, time, OR duration is missing
  if (!parsed.date || !parsed.startTime || !parsed.duration) {
    parsed.needsMoreInfo = true;
  } else {
    parsed.needsMoreInfo = false;
  }

  return parsed;
}

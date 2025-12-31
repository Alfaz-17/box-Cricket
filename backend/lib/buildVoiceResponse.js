import Groq from "groq-sdk";
import moment from "moment";
import dotenv from "dotenv";
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

function speakableDate(dateStr, lang) {
  const date = moment(dateStr);
  const today = moment();
  const tomorrow = moment().add(1, 'days');

  if (date.isSame(today, 'day')) {
    if (lang === 'hi') return "आज";
    if (lang === 'gu') return "આજે";
    return "today";
  }
  if (date.isSame(tomorrow, 'day')) {
    if (lang === 'hi') return "कल";
    if (lang === 'gu') return "આવતીકાલે";
    return "tomorrow";
  }
  return date.format("D MMMM");
}

function speakableTime(timeStr, lang) {
  // Input is "10:00 PM" (12-hour format)
  const time = moment(timeStr, ["h:mm A", "hh:mm A"]);
  const h = time.hour(); // 0-23
  const m = time.minutes();
  
  // Format based on language
  // Hindi/Urdu
  if (lang === 'hi' || lang === 'ur') {
    let period = "सुबह"; // Morning (0-11)
    if (h >= 12) {
      if (h === 12 || h < 16) period = "दोपहर"; // Afternoon (12-3 PM)
      else if (h < 19) period = "शाम"; // Evening (4-6 PM)
      else period = "रात"; // Night (7+ PM)
    } else {
      if (h < 4) period = "रात"; // Late night logic
    }
    
    const displayH = h % 12 || 12;
    return `${period} ${displayH} बजे`;
  }

  // Gujarati
  if (lang === 'gu') {
    let period = "સવારે"; 
    if (h >= 12) {
      if (h === 12 || h < 16) period = "બપોરે";
      else if (h < 19) period = "સાંજે";
      else period = "રાત્રે";
    } else {
       if (h < 4) period = "રાત્રે";
    }

    const displayH = h % 12 || 12;
    return `${period} ${displayH} વાગ્યે`;
  }

  // English fallback
  return time.format("h:mm A");
}

/**
 * Calculate end time based on start time and duration
 */
function calculateEndTime(startTime, duration) {
  const start = moment(startTime, ["h:mm A", "hh:mm A"]);
  const end = start.add(duration, 'hours');
  return end.format("hh:mm A");
}

/**
 * Generate follow-up question when information is incomplete
 */
function generateFollowUpQuestion(parsed) {
  const lang = parsed.language || 'en';
  
  // Missing date
  if (!parsed.date) {
    if (lang === 'hi') return "कब के लिए देखना है? आज या कल?";
    if (lang === 'gu') return "ક્યારે માટે જોવું છે? આજે કે આવતીકાલે?";
    return "When would you like to book? Today or tomorrow?";
  }
  
  // Missing time (but have date)
  if (!parsed.startTime) {
    if (lang === 'hi') return "किस समय चाहिए?";
    if (lang === 'gu') return "કયા સમયે જોઈએ છે?";
    return "What time would you like?";
  }

  // Missing duration (but have date and time)
  if (!parsed.duration) {
    if (lang === 'hi') return "कितने घंटे के लिए चाहिए?";
    if (lang === 'gu') return "કેટલા કલાક માટે જોઈએ છે?";
    return "For how many hours?";
  }
  
  // Shouldn't reach here, but fallback
  if (lang === 'hi') return "कृपया पूरी जानकारी दें।";
  if (lang === 'gu') return "કૃપા કરીને સંપૂર્ણ માહિતી આપો.";
  return "Please provide complete information.";
}

export async function buildVoiceResponse({ parsed, result, isPast }) {
  const lang = parsed.language || 'en';
  
  // 🔍 CHECK IF WE NEED MORE INFORMATION
  if (parsed.needsMoreInfo) {
    return generateFollowUpQuestion(parsed);
  }
  
  // ✅ We have all info, proceed with slot availability response
  const isAvailable = result?.available || false;
  const requestedDate = speakableDate(parsed.date, lang);
  const requestedTime = speakableTime(parsed.startTime, lang);
  const endTime = calculateEndTime(parsed.startTime, parsed.duration);
  const requestedEndTime = speakableTime(endTime, lang);
  
  // Extract box names if available
  let availabilityInfo = "";
  if (!isPast && isAvailable && result.slots && result.slots.length > 0) {
    const uniqueBoxes = [...new Set(result.slots.map(s => s.quarterName.replace(/-/g, "").replace(/\\s+/g, " ").trim()))];
    availabilityInfo = uniqueBoxes.join(", ");
  }

  const status = isPast ? "PAST_TIME" : (isAvailable ? "AVAILABLE" : "NOT AVAILABLE");

  // Construct System Prompt for the AI
  // Construct System Prompt for the AI
  // Construct System Prompt for the AI
  const systemPrompt = `
    You are 'Mota Bhai', a cricket box booking assistant.
    Goal: Inform slot availability in a SHORT, DIRECT, and SIMPLE way.
    
    CONTEXT:
    - Language: ${lang}
    - Boxes: ${availabilityInfo} 
    - Time: ${requestedTime} to ${requestedEndTime} 
    - Date: ${requestedDate} (e.g., "today", "tomorrow", "aaj", "kal")
    - Status: ${status}

    INSTRUCTIONS:
    1. Reply ONLY in ${lang}.
    2. Be friendly but keep it informative.
    3. MANDATORY: Mention the Date ("${requestedDate}") and Time ("${requestedTime}") in your answer.
    4. Use "Box", "Timing" (English words).

    SCENARIOS:
    - PAST: "Mota bhai, ${requestedDate} ${requestedTime} ka timing chala gaya."
    - AVAILABLE: "Haan Mota bhai, ${requestedDate} ${requestedTime} ${availabilityInfo} available hai."
    - NOT AVAILABLE: "Sorry Mota bhai, ${requestedDate} ${requestedTime} koi slot available nahi hai."

    EXAMPLES:
    - "Haan Mota bhai, aaj raat 9 baje Box 1 available hai."
    - "Nahi Mota bhai, kal subah 10 baje slot nahi hai."
  `;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Generate response." }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.5,
      max_tokens: 60,
    });

    const aiResponse = completion.choices[0]?.message?.content?.trim();
    if (aiResponse) return aiResponse;
    throw new Error("Empty AI response");

  } catch (error) {
    console.error("AI Generation Failed, falling back to template:", error);
    
    // Fallback Template Logic (Simple but Informative)
    if (isPast) {
         if (lang === 'hi') return `मोटा भाई, ${requestedDate} ${requestedTime} का टाइमिंग तो चला गया।`;
         if (lang === 'gu') return `મોટા ભાઈ, ${requestedDate} ${requestedTime} નો ટાઈમિંગ તો જતો રહ્યો છે.`;
         return `Mota Bhai, the time ${requestedTime} on ${requestedDate} has passed.`;
    }

    if (isAvailable) {
      if (lang === 'hi') return `हाँ मोटा भाई, ${requestedDate} ${requestedTime} ${availabilityInfo} उपलब्ध है।`;
      if (lang === 'gu') return `હા મોટા ભાઈ, ${requestedDate} ${requestedTime} ${availabilityInfo} ઉપલબ્ધ છે.`;
      return `Yes Mota Bhai, ${availabilityInfo} is available on ${requestedDate} at ${requestedTime}.`;
    } else {
      if (lang === 'hi') return `माफ़ कीजिये मोटा भाई, ${requestedDate} ${requestedTime} कोई स्लॉट खाली नहीं है।`;
      if (lang === 'gu') return `માફ કરશો મોટા ભાઈ, ${requestedDate} ${requestedTime} કોઈ સ્લોટ ઉપલબ્ધ નથી.`;
      return `Sorry Mota Bhai, no slots available on ${requestedDate} at ${requestedTime}.`;
    }
  }
}

const responses = {
  hi: {
    notAvailable: "उस समय कोई स्लॉट नहीं है।",
    available: ({ boxString }) =>
      `हाँ, ${boxString} उपलब्ध है।`
  },

  gu: {
    notAvailable: "તે સમયે કોઈ સ્લોટ નથી.",
    available: ({ boxString }) =>
      `હા, ${boxString} ખાલી છે.`
  },

  en: {
    notAvailable: "No slots at that time.",
    available: ({ boxString }) =>
      `Yes, ${boxString} is available.`
  }
};

responses.ur = responses.hi;



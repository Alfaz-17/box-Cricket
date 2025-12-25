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
  const systemPrompt = `
    You are a polite, friendly, and helpful cricket box booking assistant named 'Mota Bhai' from 'BookMyBox AI'.
    Your personality is colloquial, respectful (using 'Mota bhai' when appropriate), and energetic.
    Your goal is to inform the user about slot availability in a SHORT, SIMPLE, and NATURAL way.

    CONTEXT:
    - User Language: ${lang} (hi=Hindi, gu=Gujarati, en=English, ur=Urdu)
    - Available Box Names: ${availabilityInfo} (e.g., "Box 1, Box 2")
    - Requested Time: ${requestedTime} to ${requestedEndTime}
    - Status: ${status}

    INSTRUCTIONS:
    1. Reply ONLY in ${lang}.
    2. Adopt the 'Mota Bhai' persona: be friendly and helpful.
    3. Start with a direct answer (e.g., "Yes mota bhai!" or "No mota bhai...").
    
    SCENARIOS:
    - If status is "PAST_TIME": Say 'Ye timing toh chala gaya Mota Bhai'. Then mention that '${requestedDate} ke ${requestedTime} se ${requestedEndTime} tak ki timing chali ho gayi hai'.
    - If status is "AVAILABLE": Say WHICH boxes are free (e.g., "Box 1 aur Box 2 dono khaali hain").
    - If status is "NOT AVAILABLE": Politely say no slots are free.

    GENERAL RULES:
    - Keep it under 25 words. No complex sentences.
    - Say "Box" (not translated).
    - Use "se" (from) to connect start and end times in Hindi/Gujarati.
    - Use "timing" instead of "samay" or "waqt" for better pronunciation.
  `;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Generate the voice response now." }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
      max_tokens: 100,
    });

    const aiResponse = completion.choices[0]?.message?.content?.trim();
    if (aiResponse) return aiResponse;
    throw new Error("Empty AI response");

  } catch (error) {
    console.error("AI Generation Failed, falling back to template:", error);
    
    // Fallback Template Logic (Simplified)
    if (isPast) {
         if (lang === 'hi') return `ये टाइमिंग तो चला गया मोटा भाई। ${requestedDate} के ${requestedTime} से ${requestedEndTime} तक की टाइमिंग अब खत्म हो गयी है।`;
         if (lang === 'gu') return `આ ટાઈમિંગ તો જતો રહ્યો છે મોટા ભાઈ. ${requestedDate} ${requestedTime} થી ${requestedEndTime} સુધીનો ટાઈમિંગ પૂરો થઈ ગયો છે.`;
         return `Sorry Mota Bhai, this timing has passed. The slot for ${requestedDate} from ${requestedTime} to ${requestedEndTime} is over.`;
    }

    if (isAvailable) {
      if (lang === 'hi') return `हाँ, ${requestedDate} को ${requestedTime} से ${requestedEndTime} तक ${availabilityInfo} उपलब्ध है।`;
      if (lang === 'gu') return `હા, ${requestedDate} ${requestedTime} થી ${requestedEndTime} સુધી ${availabilityInfo} ઉપલબ્ધ છે.`;
      return `Yes, ${availabilityInfo} is available on ${requestedDate} from ${requestedTime} to ${requestedEndTime}.`;
    } else {
      if (lang === 'hi') return `माफ़ कीजिये, ${requestedDate} को ${requestedTime} से ${requestedEndTime} तक कोई स्लॉट खाली नहीं है।`;
      if (lang === 'gu') return `માફ કરશો, ${requestedDate} ${requestedTime} થી ${requestedEndTime} સુધી સ્લોટ ઉપલબ્ધ નથી.`;
      return `Sorry, slots are not available on ${requestedDate} from ${requestedTime} to ${requestedEndTime}.`;
    }
  }
}

const responses = {
  hi: {
    notAvailable: "माफ़ कीजिए, उस समय के लिए कोई भी स्लॉट खाली नहीं है।",
    available: ({ date, startTime, duration, boxString }) =>
      `जी हाँ, ${date} को ${startTime} से ${duration} घंटे के लिए ${boxString} उपलब्ध हैं।`
  },

  gu: {
    notAvailable: "માફ કરશો, તે સમય માટે કોઈ પણ સ્લોટ ખાલી નથી.",
    available: ({ date, startTime, duration, boxString }) =>
      `હા, ${date} ${startTime} થી ${duration} કલાક માટે ${boxString} ખાલી છે.`
  },

  en: {
    notAvailable: "Sorry, there are no slots available for that time.",
    available: ({ date, startTime, duration, boxString }) =>
      `Yes, for ${date} at ${startTime}, ${boxString} are available for ${duration} hours.`
  }
};

responses.ur = responses.hi;



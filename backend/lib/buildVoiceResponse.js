import moment from "moment";
import dotenv from "dotenv";
dotenv.config();

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
  const time = moment(timeStr, ["h:mm A", "hh:mm A"]);
  const h = time.hour();
  
  if (lang === 'hi' || lang === 'ur') {
    let period = "सुबह";
    if (h >= 12) {
      if (h === 12 || h < 16) period = "दोपहर";
      else if (h < 19) period = "शाम";
      else period = "रात";
    } else {
      if (h < 4) period = "रात";
    }
    const displayH = h % 12 || 12;
    return `${period} ${displayH} बजे`;
  }

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

  return time.format("h:mm A");
}

function calculateEndTime(startTime, duration) {
  const start = moment(startTime, ["h:mm A", "hh:mm A"]);
  const end = start.add(duration, 'hours');
  return end.format("hh:mm A");
}

function generateFollowUpQuestion(parsed) {
  const lang = parsed.language || 'en';
  
  if (!parsed.date) {
    if (lang === 'hi') return "कब के लिए देखना है? आज या कल?";
    if (lang === 'gu') return "ક્યારે માટે જોવું છે? આજે કે આવતીકાલે?";
    return "When would you like to book? Today or tomorrow?";
  }
  
  if (!parsed.startTime) {
    if (lang === 'hi') return "किस समय चाहिए?";
    if (lang === 'gu') return "કયા સમયે જોઈએ છે?";
    return "What time would you like?";
  }

  if (!parsed.duration) {
    if (lang === 'hi') return "कितने घंटे के लिए चाहिए?";
    if (lang === 'gu') return "કેટલા કલાક માટે જોઈએ છે?";
    return "For how many hours?";
  }
  
  if (lang === 'hi') return "कृपया पूरी जानकारी दें।";
  if (lang === 'gu') return "કૃપા કરીને સંપૂર્ણ માહિતી આપો.";
  return "Please provide complete information.";
}

export async function buildVoiceResponse({ parsed, result, isPast }) {
  const lang = parsed.language || 'en';
  
  if (parsed.needsMoreInfo) {
    return generateFollowUpQuestion(parsed);
  }
  
  const isAvailable = result?.available || false;
  const requestedDate = speakableDate(parsed.date, lang);
  const requestedTime = speakableTime(parsed.startTime, lang);
  const endTime = calculateEndTime(parsed.startTime, parsed.duration);
  const requestedEndTime = speakableTime(endTime, lang);
  
  let availabilityInfo = "";
  if (!isPast && isAvailable && result.slots && result.slots.length > 0) {
    const uniqueBoxes = [...new Set(result.slots.map(s => `${s.boxName} ${s.quarterName.replace(/-/g, "").replace(/\s+/g, " ").trim()}`))];
    availabilityInfo = uniqueBoxes.join(", ");
  }

  // Fast Forward: Skip LLM and directly use templates for instant response
  if (isPast) {
       if (lang === 'hi') return `मोटा भाई, ${requestedDate} ${requestedTime} का टाइमिंग तो चला गया।`;
       if (lang === 'gu') return `મોટા ભાઈ, ${requestedDate} ${requestedTime} નો ટાઈમિંગ તો જતો રહ્યો છે.`;
       return `Mota Bhai, the time ${requestedTime} on ${requestedDate} has passed.`;
  }

  if (isAvailable) {
    if (lang === 'hi') return `हाँ मोटा भाई, ${requestedDate} ${requestedTime} से ${requestedEndTime} तक ${availabilityInfo} उपलब्ध है।`;
    if (lang === 'gu') return `હા મોટા ભાઈ, ${requestedDate} ${requestedTime} થી ${requestedEndTime} સુધી ${availabilityInfo} ઉપલબ્ધ છે.`;
    return `Yes Mota Bhai, ${availabilityInfo} is available on ${requestedDate} from ${requestedTime} to ${requestedEndTime}.`;
  } else {
    if (lang === 'hi') return `माफ़ कीजिये मोटा भाई, ${requestedDate} ${requestedTime} कोई स्लॉट खाली नहीं है।`;
    if (lang === 'gu') return `માફ કરશો મોટા ભાઈ, ${requestedDate} ${requestedTime} કોઈ સ્લોટ ઉપલબ્ધ નથી.`;
    return `Sorry Mota Bhai, no slots available on ${requestedDate} at ${requestedTime}.`;
  }
}

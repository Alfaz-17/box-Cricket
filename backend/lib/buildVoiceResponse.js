import moment from "moment";

function speakableDate(date, language) {
  if (moment(date).isSame(moment(), "day")) {
    if (language === "en") return "today";
    if (language === "gu") return "આજે";
    return "आज";
  }
  return date;
}

function speakableTime(timeStr, language) {
  // Input: "04:00 PM" or "10:30 AM"
  // parsed by moment or just string manipulation
  let [time, modifier] = timeStr.split(" ");
  let [hours, minutes] = time.split(":");
  hours = parseInt(hours, 10); // remove leading zero

  // Minute handling
  const minutePart = minutes === "00" ? "" : `:${minutes}`;

  if (language === "hi") {
    // Hindi mapping
    let period = "";
    if (modifier === "AM") {
      if (hours >= 4 && hours < 12) period = "सुबह"; // Morning
      else if (hours === 12) period = "दोपहर"; // Noon
      else period = "रात"; // Late night/early morning
    } else { // PM
      if (hours >= 12 && hours < 4) period = "दोपहर"; // Afternoon
      else if (hours >= 4 && hours < 8) period = "शाम"; // Evening
      else period = "रात"; // Night
    }
    return `${period} ${hours}${minutePart} बजे`;
  }

  if (language === "gu") {
    // Gujarati mapping
    let period = "";
    if (modifier === "AM") {
      if (hours >= 4 && hours < 12) period = "સવારે";
      else if (hours === 12) period = "બપોરે";
      else period = "રાત્રે";
    } else { // PM
      if (hours >= 12 && hours < 4) period = "બપોરે";
      else if (hours >= 4 && hours < 8) period = "સાંજે";
      else period = "રાત્રે";
    }
    return `${period} ${hours}${minutePart} વાગ્યે`;
  }

  // English fallback: "7 PM" instead of "07:00 PM"
  return `${hours}${minutePart} ${modifier}`;
}

export function buildVoiceResponse({ parsed, result }) {
  const { language, startTime, duration, date } = parsed;

  const effectiveLang = (language === 'ur') ? 'hi' : language;

  if (!result.available) {
    return responses[effectiveLang].notAvailable;
  }

  // Extract unique Box Names (from quarters) and clean them ("Box - 1" -> "Box 1")
  const uniqueBoxes = [...new Set(result.slots.map(s => s.quarterName.replace(/-/g, "").replace(/\s+/g, " ").trim()))];
  
  // Get Venue Name (assuming all slots are from the same venue query context, or just take first one)
  const venueName = result.slots[0]?.boxName || "Stadium";

  const boxString = uniqueBoxes.join(
    effectiveLang === "en"
      ? " and "
      : effectiveLang === "hi"
      ? " और "
      : " અને "
  );

  const fullLocationString = `${venueName} ${boxString}`;

  const spokenDate = speakableDate(date, effectiveLang);
  const spokenTime = speakableTime(startTime, effectiveLang);

  return responses[effectiveLang].available({
    date: spokenDate,
    startTime: spokenTime,
    duration,
    boxString: fullLocationString
  });
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

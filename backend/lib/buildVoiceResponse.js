import moment from "moment";

function speakableDate(date, language) {
  if (moment(date).isSame(moment(), "day")) {
    if (language === "en") return "today";
    if (language === "gu") return "આજે";
    return "आज";
  }
  return date;
}

export function buildVoiceResponse({ parsed, result }) {
  const { language, startTime, duration, date } = parsed;

  if (!result.available) {
    return responses[language].notAvailable;
  }

  const quarters = result.slots
    .map(s => s.quarterName)
    .join(
      language === "en"
        ? " and "
        : language === "hi"
        ? " और "
        : " અને "
    );

  const spokenDate = speakableDate(date, language);

  return responses[language].available({
    date: spokenDate,
    startTime,
    duration,
    quarters
  });
}

const responses = {
  hi: {
    notAvailable: "माफ़ कीजिए, इस समय कोई स्लॉट उपलब्ध नहीं है।",
    available: ({ date, startTime, duration, quarters }) =>
      `हाँ, ${date} ${startTime} से ${duration} घंटे के लिए ${quarters} खाली हैं।`
  },

  gu: {
    notAvailable: "માફ કરશો, આ સમય માટે કોઈ સ્લોટ ઉપલબ્ધ નથી.",
    available: ({ date, startTime, duration, quarters }) =>
      `હા, ${date} ${startTime} થી ${duration} કલાક માટે ${quarters} ખાલી છે.`
  },

  en: {
    notAvailable: "Sorry, no slots are available at this time.",
    available: ({ date, startTime, duration, quarters }) =>
      `Yes, ${date} from ${startTime} for ${duration} hours, ${quarters} are available.`
  }
};

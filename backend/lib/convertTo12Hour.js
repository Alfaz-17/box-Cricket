import moment from "moment";

//  CONVERT AI TIME TO 12-HOUR
export function to12HourFormat(time) {
  if (!time) throw new Error("Missing time from AI");

  // Try multiple formats AI may return
  const formats = [
    "HH:mm",
    "H:mm",
    "hh:mm A",
    "h:mm A",
    "hh A",
    "h A"
  ];

  const parsed = moment(time, formats, true);

  if (!parsed.isValid()) {
    console.error("Invalid time from AI:", time);
    throw new Error("Invalid time format from AI");
  }

  // ✅ RETURN FORMAT YOUR DB EXPECTS
  return parsed.format("hh:mm A");
}


import moment from "moment";

export function parseDateTime(dateStr, timeStr) {
  const dateTime = moment(`${dateStr} ${timeStr}`, "YYYY-MM-DD hh:mm A");
  if (!dateTime.isValid()) throw new Error("Invalid date or time format");
  return dateTime.toDate();
}
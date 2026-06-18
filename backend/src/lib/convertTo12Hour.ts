import moment from "moment";

export function to12HourFormat(time?: string): string {
  if (!time) throw new Error("Missing time from AI");

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

  return parsed.format("hh:mm A");
}

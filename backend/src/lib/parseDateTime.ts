import moment from 'moment';

export function parseDateTime(dateStr: string, timeStr: string): Date {
  const dateTime = moment(`${dateStr} ${timeStr}`, 'YYYY-MM-DD hh:mm A');
  if (!dateTime.isValid()) throw new Error('Invalid date or time format');
  return dateTime.toDate();
}

export const formatDate = dateString => {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  return new Date(dateString).toLocaleDateString('en-US', options)
}

export const formatTime = (timeString) => {
  const d = new Date(timeString);
  return d.toLocaleTimeString("en-US", {
    timeZone: "Asia/Kolkata", // remove if you don't want IST conversion
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

// Helper to format endTime - handles both Date objects (old format) and strings (new format)
export const formatEndTime = (endTime) => {
  if (!endTime) return '';
  
  // If it's already a formatted string (e.g., "05:00 PM"), return as-is
  if (typeof endTime === 'string' && endTime.includes('M')) {
    return endTime;
  }
  
  // Otherwise, it's a Date object or date string, format it
  return formatTime(endTime);
};


export function convertTo12Hour(time) {
  let [hour, minute] = time.split(':').map(Number);

  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12; // convert 0 -> 12, 13 -> 1 etc.

  return `${hour}:${minute.toString().padStart(2,'0')} ${ampm}`;
}
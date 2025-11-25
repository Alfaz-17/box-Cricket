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

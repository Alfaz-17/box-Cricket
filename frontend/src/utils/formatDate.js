export const formatDate = dateString => {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  return new Date(dateString).toLocaleDateString('en-US', options)
}

export const formatBookingDate = (dateString) => {
  const date = new Date(dateString)
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  
  return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
}

export const formatTime = (timeString) => {
  if (!timeString) return ''
  
  // If it's already a 12h formatted string (e.g. "09:00 AM"), return as-is
  if (typeof timeString === 'string' && (timeString.includes('AM') || timeString.includes('PM'))) {
    return timeString
  }

  // Handle HH:mm or HH:mm:ss strings by converting to 12h
  if (typeof timeString === 'string' && timeString.includes(':')) {
    return convertTo12Hour(timeString)
  }

  // Handle Date objects or timestamp strings
  const d = new Date(timeString)
  if (isNaN(d.getTime())) return timeString

  return d.toLocaleTimeString("en-US", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

export const formatEndTime = (endTime) => {
  return formatTime(endTime)
}

export function convertTo12Hour(time) {
  if (!time) return ''
  
  // If it's already a 12h formatted string, return as-is
  if (typeof time === 'string' && (time.includes('AM') || time.includes('PM'))) {
    return time
  }

  try {
    const parts = time.split(':')
    let hour = parseInt(parts[0], 10)
    let minute = parseInt(parts[1], 10)

    if (isNaN(hour) || isNaN(minute)) return time

    const ampm = hour >= 12 ? 'PM' : 'AM'
    hour = hour % 12 || 12
    return `${hour}:${minute.toString().padStart(2, '0')} ${ampm}`
  } catch (e) {
    return time
  }
}
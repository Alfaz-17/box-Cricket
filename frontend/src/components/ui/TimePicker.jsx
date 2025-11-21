import React from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const TimePicker = ({ value, onChange }) => {
  // Generate options for every 30 mins in 12-hour format AM/PM
  const generateTimeOptions = () => {
    const times = []
    for (let hour = 1; hour <= 12; hour++) {
      for (let min of [0, 30]) {
        const displayMin = min.toString().padStart(2, '0')
        times.push(`${hour}:${displayMin} AM`)
        times.push(`${hour}:${displayMin} PM`)
      }
    }
    return times
  }

  const timeOptions = generateTimeOptions()

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select time" />
      </SelectTrigger>
      <SelectContent>
        {timeOptions.map((time, idx) => (
          <SelectItem key={idx} value={time}>
            {time}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export default TimePicker

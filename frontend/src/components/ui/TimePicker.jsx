import React, { useState } from 'react';

const TimePicker = ({ value, onChange }) => {
  // Generate options for every 30 mins in 12-hour format AM/PM
  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 1; hour <= 12; hour++) {
      for (let min of [0, 30]) {
        const displayMin = min.toString().padStart(2, '0');
        times.push(`${hour}:${displayMin} AM`);
        times.push(`${hour}:${displayMin} PM`);
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border rounded px-3 py-2"
      aria-label="Select time"
    >
      <option value="">Select time</option>
      {timeOptions.map((time, idx) => (
        <option key={idx} value={time}>
          {time}
        </option>
      ))}
    </select>
  );
};

export default TimePicker;

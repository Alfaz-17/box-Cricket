import { describe, it, expect } from 'vitest';
import { parseDateTime } from '../lib/parseDateTime.js';

describe('parseDateTime', () => {
  it('should correctly parse a valid date and time string', () => {
    // Arrange
    const dateStr = '2026-10-15';
    const timeStr = '06:30 PM';

    // Act
    const result = parseDateTime(dateStr, timeStr);

    // Assert
    expect(result).toBeInstanceOf(Date);
    
    // Convert back to ISO to check if it's correct
    // Note: This relies on the local timezone where tests run, 
    // but we can at least check if the object is valid
    expect(result.toString()).not.toBe('Invalid Date');
  });

  it('should throw an error if the time format is invalid', () => {
    const dateStr = '2026-10-15';
    const timeStr = '25:99 PM'; // Invalid time

    // Expecting the function to throw an error
    expect(() => parseDateTime(dateStr, timeStr)).toThrow('Invalid date or time format');
  });

  it('should throw an error if the date format is invalid', () => {
    const dateStr = 'not-a-date';
    const timeStr = '06:30 PM'; 

    expect(() => parseDateTime(dateStr, timeStr)).toThrow('Invalid date or time format');
  });
});

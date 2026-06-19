import { describe, it, expect, vi, beforeEach } from 'vitest';
import { findAvailableSlots } from '../src/lib/findAvailableSlots.js';
import CricketBox from '../src/models/CricketBox.js';
import Booking from '../src/models/Booking.js';
import BlockedSlot from '../src/models/BlockedSlot.js';

// Mock the Mongoose models
vi.mock('../src/models/CricketBox.js');
vi.mock('../src/models/Booking.js');
vi.mock('../src/models/BlockedSlot.js');

describe('findAvailableSlots', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return available slots when there are no conflicts or blocks', async () => {
    // Arrange: Mock the database returning one box with one quarter
    CricketBox.find.mockResolvedValue([
      {
        _id: 'box1',
        name: 'Premium Turf',
        quarters: [{ _id: 'q1', name: 'Quarter 1' }]
      }
    ]);

    // Mock no blocked slots
    BlockedSlot.find.mockResolvedValue([]);

    // Mock no overlapping bookings
    Booking.exists.mockResolvedValue(false);

    // Act
    const result = await findAvailableSlots({
      date: '2026-10-15',
      startTime: '06:00 PM',
      duration: 1
    });

    // Assert
    expect(result.available).toBe(true);
    expect(result.slots).toHaveLength(1);
    expect(result.slots[0].boxName).toBe('Premium Turf');
    expect(result.slots[0].quarterName).toBe('Quarter 1');
  });

  it('should return no available slots if the quarter is booked', async () => {
    // Arrange
    CricketBox.find.mockResolvedValue([
      {
        _id: 'box1',
        name: 'Premium Turf',
        quarters: [{ _id: 'q1', name: 'Quarter 1' }]
      }
    ]);

    BlockedSlot.find.mockResolvedValue([]);

    // Mock an overlapping booking exists!
    Booking.exists.mockResolvedValue(true);

    // Act
    const result = await findAvailableSlots({
      date: '2026-10-15',
      startTime: '06:00 PM',
      duration: 1
    });

    // Assert
    expect(result.available).toBe(false);
    expect(result.slots).toHaveLength(0);
  });
});

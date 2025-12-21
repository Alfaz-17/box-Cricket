import Booking from '../models/Booking.js';

/**
 * Cleanup job to delete pending/unpaid bookings after 15 minutes
 * Runs every 10 minutes to prevent orphaned bookings
 */
export function startPendingBookingCleanup() {
  console.log('🧹 Pending Booking Cleanup Job Started (Interval: 10 mins)');
  
  // Run every 10 minutes (600,000 ms)
  setInterval(async () => {
    try {
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
      
      // Find and delete bookings that are:
      // 1. Status is 'pending' (not confirmed)
      // 2. Payment status is 'pending' or 'processing' (not paid)
      // 3. Created more than 15 minutes ago
      // 4. Not offline bookings (isOffline: false)
      const result = await Booking.deleteMany({
        status: 'pending',
        paymentStatus: { $in: ['pending', 'processing'] },
        isOffline: false,
        createdAt: { $lt: fifteenMinutesAgo }
      });

      if (result.deletedCount > 0) {
        console.log(`🗑️ Deleted ${result.deletedCount} pending booking(s) older than 15 minutes`);
      }
    } catch (err) {
      console.error('❌ Pending Booking Cleanup Job Error:', err.message);
    }
  }, 10 * 60 * 1000); // Run every 10 minutes
}

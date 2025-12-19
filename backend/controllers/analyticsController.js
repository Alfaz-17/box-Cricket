import Booking from '../models/Booking.js'
import CricketBox from '../models/CricketBox.js'

export const getDasboardSummary = async (req, res) => {
  try {
    const boxes = await CricketBox.find({ owner: req.user._id })
    const boxIds = boxes.map(box => box._id)

    const filter = {
      box: { $in: boxIds },
      status: { $in: ['confirmed', 'completed'] },
      $or: [{ paymentStatus: 'paid' }, { isOffline: true }],
    }

    const bookings = await Booking.find(filter)

    const totalBookings = await Booking.countDocuments(filter)
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.amountPaid || 0), 0)
    const totalBoxes = boxes.length

    const userIds = new Set(bookings.map(b => b.user.toString()))
    const totalUsers = userIds.size

    // These could be dynamic in the future based on date ranges
    const bookingChange = 0
    const revenueChange = 0
    const boxChange = 0
    const userChange = 0

    res.json({
      totalBookings,
      totalRevenue,
      totalBoxes,
      totalUsers,
      bookingChange,
      revenueChange,
      boxChange,
      userChange,
    })
  } catch (error) {
    console.error('Dashboard Summary Error:', error)
    res.status(500).json({ message: 'Failed to fetch dashboard summary' })
  }
}

import Booking from "../models/Booking.js";
import CricketBox from "../models/CricketBox.js";




export const getDasboardSummary = async (req, res) => {
  try {
    const boxes = await CricketBox.find({ owner: req.user._id });
    const boxIds = boxes.map(box => box._id);

    const bookings = await Booking.find({ box: { $in: boxIds } });

    const totalBookings = await Booking.countDocuments({ box: { $in: boxIds } });
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.amountPaid || 0), 0);
    const totalBoxes = boxes.length;

    const userIds = new Set(bookings.map(b => b.user.toString()));
    const totalUsers = userIds.size;

    const bookingChange = 12;
    const revenueChange = 8;
    const boxChange = 2;
    const userChange = 24;

    res.json({
      totalBookings,
      totalRevenue,
      totalBoxes,
      totalUsers,
      bookingChange,
      revenueChange,
      boxChange,
      userChange
    });
  } catch (error) {
    console.error("Dashboard Summary Error:", error);
    res.status(500).json({ message: "Failed to fetch dashboard summary" });
  }
};

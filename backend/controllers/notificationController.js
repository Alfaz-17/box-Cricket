import Notification from "../models/Notification.js";

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ toUser: req.user._id })
      .sort({ createdAt: -1 })
      .populate("toUser", "profileImg name")
      .populate("fromUser", "profileImg name")
      .populate("groupId", "name")
      .populate("bookingId", "startDateTime endDateTime status")
      .populate("boxId", "name location");

    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error in notification controller", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    await Notification.findByIdAndDelete(notificationId);
    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { toUser: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );

    res.json({ message: "ALl notification Mark as Read" });
  } catch (error) {
    res.status(500).json({ message: "internal server error" });
    console.log("error in markNotifation controller ", error);
  }
};

export const getUnreadCount = async (req, res) => {
  const count = await Notification.countDocuments({
    toUser: req.user._id,
    isRead: false,
  });
  res.json({ count });
};

// frontend/src/store/useNotificationStore.js
import { create } from "zustand";
import api from "../utils/api";

const useNotificationStore = create((set) => ({
  unreadCount: 0,
  notifications: [],

  fetchUnreadCount: async () => {
    try {
      const { data } = await api.get("/notification/unread-count");
      set({ unreadCount: data.count });
      console.log(data.count)
    } catch (err) {
      console.error("Failed to fetch unread count", err);
    }
  },

  fetchNotifications: async () => {
    try {
      const res = await api.get("/notification/");
      set({ notifications: res.data });
      
    } catch (err) {
      console.error("Error fetching notifications", err);
    }
  },

  markAllAsRead: async () => {
    try {
       await api.put("/notification/mark-all-read");

    } catch (err) {
      console.error("Failed to mark all notifications as read", err);
    }
  },

  clearUnreadCount: () => set({ unreadCount: 0 }),
}));

export default useNotificationStore;

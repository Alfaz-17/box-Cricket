// components/NotificationBar.jsx
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import io from "socket.io-client";

const ENDPOINT = "http://localhost:5001"; // socket server

const NotificationBar = ({ token, userId }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const s = io(ENDPOINT, {
      auth: { token },
    });
    setSocket(s);

    s.on("group-invite", (data) => {
      setNotifications((prev) => [
        { ...data, type: "invite", id: Date.now() },
        ...prev,
      ]);
    });

    s.on("group-joined", (data) => {
      setNotifications((prev) => [
        { ...data, type: "joined", id: Date.now() },
        ...prev,
      ]);
    });

    return () => {
      s.disconnect();
    };
  }, [token]);

  return (
    <div className="fixed top-4 right-4 z-50 w-96 max-w-full">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="flex items-center gap-2 p-3 bg-yellow-100 border-b border-yellow-300">
          <Bell className="text-yellow-500" />
          <h3 className="font-semibold text-yellow-700">Notifications</h3>
        </div>
        <ul className="max-h-80 overflow-y-auto">
          {notifications.length === 0 && (
            <li className="p-3 text-gray-500 text-sm">No new notifications</li>
          )}
          {notifications.map((n) => (
            <li
              key={n.id}
              className="p-3 border-b last:border-b-0 text-sm hover:bg-yellow-50"
            >
              <div className="font-medium">
                {n.type === "invite"
                  ? "Group Invite"
                  : n.type === "joined"
                  ? "Group Joined"
                  : "Notification"}
              </div>
              <div className="text-gray-600">{n.message}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default NotificationBar;

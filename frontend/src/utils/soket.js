import { io } from "socket.io-client";

 const socket = io(import.meta.env.VITE_API_BASE_URL || "http://localhost:5001", {
  transports: ["websocket"], // ✅ force WebSocket (optional, avoids XHR)
  withCredentials: true,     // ✅ if using cookies/auth
});
export default socket;

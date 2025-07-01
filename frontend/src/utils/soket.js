import { io } from "socket.io-client";

 const socket = io("http://localhost:5001", {
  transports: ["websocket"], // ✅ force WebSocket (optional, avoids XHR)
  withCredentials: true,     // ✅ if using cookies/auth
});
export default socket;

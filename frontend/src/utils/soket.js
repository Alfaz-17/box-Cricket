import { io } from 'socket.io-client'

const socket = io(import.meta.env.VITE_API_BASE_URL || 'http://172.20.10.2:5001', {
  transports: ['websocket'], // ✅ force WebSocket (optional, avoids XHR)
})
export default socket

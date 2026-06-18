import { io } from 'socket.io-client'
import { BASE_URL } from './api'

const socket = io(BASE_URL, {
  transports: ['websocket'], // ✅ force WebSocket (optional, avoids XHR)
})
export default socket

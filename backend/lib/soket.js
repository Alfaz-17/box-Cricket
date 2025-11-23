// socket.js
import { Server } from 'socket.io'

let io
const onlineUsers = new Map()

export const initSocket = server => {
  console.log('🧠 Initializing Socket.IO...')
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL, // ✅ frontend origin
      methods: ['GET', 'POST'],
      credentials: true, // ✅ must match frontend
    },
    transports: ['websocket'], // ✅ add this
  })

  io.on('connection', socket => {
    console.log('🔌 New connection:', socket.id)

    // Register user
    socket.on('register', userId => {
      onlineUsers.set(userId, socket.id)
      console.log(`✅ User ${userId} registered with socket ID ${socket.id}`)
    })

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('❌ Disconnected:', socket.id)
      for (let [uid, sid] of onlineUsers.entries()) {
        if (sid === socket.id) {
          onlineUsers.delete(uid)
          break
        }
      }
    })
  })
}

export const getIO = () => io
export const getOnlineUsers = () => onlineUsers

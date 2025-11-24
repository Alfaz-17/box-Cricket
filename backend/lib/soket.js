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
  socket.on("join-box", boxId => {
    socket.join(boxId)
    console.log(`📌 User joined room: ${boxId}`)
  })

  // 🔹 Leave room (optional when switching pages)
  socket.on("leave-box", boxId => {
    socket.leave(boxId)
    console.log(`📤 User left room: ${boxId}`)
  });

  
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

export const getIO = () => io ;
export const getOnlineUsers = () => onlineUsers

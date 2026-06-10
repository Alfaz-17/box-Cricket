import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';

let io: SocketIOServer;
const onlineUsers = new Map<string, string>();

export const initSocket = (server: HttpServer): void => {
  console.log('🧠 Initializing Socket.IO...');
  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.CLIENT_URL, // ✅ frontend origin
      methods: ['GET', 'POST'],
      credentials: true, // ✅ must match frontend
    },
    transports: ['websocket'], // ✅ add this
  });

  io.on('connection', (socket) => {
    console.log('🔌 New connection:', socket.id);

    // Register user
    socket.on('register', (userId: string) => {
      onlineUsers.set(userId, socket.id);
      console.log(`✅ User ${userId} registered with socket ID ${socket.id}`);
    });

    socket.on('join-box', (boxId: string) => {
      socket.join(boxId);
      console.log(`📌 User joined room: ${boxId}`);
    });

    // 🔹 Leave room (optional when switching pages)
    socket.on('leave-box', (boxId: string) => {
      socket.leave(boxId);
      console.log(`📤 User left room: ${boxId}`);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('❌ Disconnected:', socket.id);
      for (const [uid, sid] of onlineUsers.entries()) {
        if (sid === socket.id) {
          onlineUsers.delete(uid);
          break;
        }
      }
    });
  });
};

export const getIO = (): SocketIOServer => io;
export const getOnlineUsers = (): Map<string, string> => onlineUsers;

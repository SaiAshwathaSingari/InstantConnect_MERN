// server.js
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server as IOServer } from 'socket.io';
import dotenv from 'dotenv';
import friendRequestsRoutes from "./routes/friendRequestsRoutes.js";
import { connectDB } from './lib/db_connect.js';
import userRouter from './routes/userRoutes.js';
import messageRoutes from './routes/messageRoutes.js';

dotenv.config();

const app = express();

// Config
const FRONTEND_URL = process.env.VITE_FRONTEND_URL || 'http://localhost:5173';
const PORT = process.env.PORT || 5000;

// CORS
const corsOptions = {
  origin: FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'token', 'x-auth-token', 'Origin', 'Accept'],
  exposedHeaders: ['token', 'Authorization']
};
app.use(cors(corsOptions));

// Body parsers (increased limits for file uploads)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }));

// Health
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/user', userRouter);
app.use('/api/message', messageRoutes);
app.use('/api/friend-requests', friendRequestsRoutes);
// Error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(err?.status || 500).json({
    success: false,
    message: err?.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err?.stack : undefined
  });
});

// DB connect (do not crash Vercel if fails; just log)
connectDB()
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection failed:', err && err.message ? err.message : err));

// Exports for serverless + socket usage:
export let io = null;               // will be set only when we start an HTTP server (local)
export const userSocketMap = {};    // can be used even if empty (live-binding)

// Start an HTTP server + socket.io only when running as a real server (local dev or explicit flag).
// Reason: Vercel expects a default export (app) and will handle requests itself; long-lived sockets are not
// supported on Vercel serverless functions. For production sockets, use a separate server or service.
const SHOULD_START_SERVER = process.env.NODE_ENV !== 'production' || process.env.START_AS_SERVER === 'true';

if (SHOULD_START_SERVER) {
  const server = http.createServer(app);

  // create io and attach
  io = new IOServer(server, {
    cors: {
      origin: FRONTEND_URL,
      credentials: true
    },
    // optional: pingInterval / timeout adjustments for your environment
  });

  // Socket.io handlers (optimized for better online status)
  io.on('connection', (socket) => {
    const userId = socket.handshake.query?.userId;
    console.log('Socket connected:', socket.id, 'userId:', userId);

    if (userId && userId !== 'undefined') {
      // Store socket mapping
      userSocketMap[userId] = socket.id;
      
      // Immediately emit updated online users to all clients
      const onlineUserIds = Object.keys(userSocketMap);
      io.emit('getOnlineUsers', onlineUserIds);
      
      // Also emit specific user connected event
      socket.broadcast.emit('userConnected', userId);
      
      console.log(`User ${userId} is now online. Total online: ${onlineUserIds.length}`);
    }

    // Handle request for online users
    socket.on('getOnlineUsers', () => {
      const onlineUserIds = Object.keys(userSocketMap);
      socket.emit('getOnlineUsers', onlineUserIds);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      if (userId && userId !== 'undefined' && userSocketMap[userId]) {
        delete userSocketMap[userId];
        
        // Emit updated online users to all clients
        const onlineUserIds = Object.keys(userSocketMap);
        io.emit('getOnlineUsers', onlineUserIds);
        
        // Also emit specific user disconnected event
        socket.broadcast.emit('userDisconnected', userId);
        
        console.log(`User ${userId} disconnected. Total online: ${onlineUserIds.length}`);
      }
    });

    // Handle manual status updates
    socket.on('updateOnlineStatus', () => {
      const onlineUserIds = Object.keys(userSocketMap);
      io.emit('getOnlineUsers', onlineUserIds);
    });

    // Handle recording events
    socket.on('recordingStarted', (data) => {
      const { receiverId } = data;
      const receiverSocketId = userSocketMap[receiverId];
      
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('userStartedRecording', { senderId: userId });
        console.log(`User ${userId} started recording for ${receiverId}`);
      }
    });

    socket.on('recordingStopped', (data) => {
      const { receiverId } = data;
      const receiverSocketId = userSocketMap[receiverId];
      
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('userStoppedRecording', { senderId: userId });
        console.log(`User ${userId} stopped recording for ${receiverId}`);
      }
    });
  });

  // Start listening (local/dev)
  server.listen(PORT, () => {
    console.log(`🚀 Local server + sockets running on port ${PORT}`);
    console.log(`🌐 CORS allowed for: ${FRONTEND_URL}`);
  });

  // Graceful shutdown for local
  const shutdown = (err) => {
    if (err) console.error('Shutdown due to error:', err);
    try {
      io?.close();
      server.close(() => {
        console.log('Server closed');
        process.exit(err ? 1 : 0);
      });
    } catch (e) {
      process.exit(1);
    }
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

// Export default app for Vercel serverless
export default app;

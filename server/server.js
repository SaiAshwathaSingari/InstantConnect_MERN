// server.js
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server as IOServer } from 'socket.io';
import dotenv from 'dotenv';

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

// Body parsers
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));

// Health
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/user', userRouter);
app.use('/api/message', messageRoutes);

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

  // Socket.io handlers
  io.on('connection', (socket) => {
    const userId = socket.handshake.query?.userId;
    console.log('Socket connected:', socket.id, 'userId:', userId);

    if (userId) {
      userSocketMap[userId] = socket.id;
      io.emit('getOnlineUsers', Object.keys(userSocketMap));
    }

    socket.on('getOnlineUsers', () => {
      socket.emit('getOnlineUsers', Object.keys(userSocketMap));
    });

    socket.on('disconnect', () => {
      if (userId && userSocketMap[userId]) {
        delete userSocketMap[userId];
      }
      io.emit('getOnlineUsers', Object.keys(userSocketMap));
      console.log('Socket disconnected:', socket.id);
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

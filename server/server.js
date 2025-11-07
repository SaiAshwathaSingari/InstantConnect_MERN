import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import { connectDB } from './lib/db_connect.js';
import userRouter from './routes/userRoutes.js';
import messageRoutes from './routes/messageRoutes.js';

dotenv.config();

const app = express();

// CORS setup
const corsOptions = {
  origin: process.env.VITE_FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'token', 'x-auth-token', 'Origin', 'Accept']
};
app.use(cors(corsOptions));

// Body parsers
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));

// Routes
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.use('/api/user', userRouter);
app.use('/api/message', messageRoutes);

// DB connect (safe)
connectDB()
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// ⚡ Socket.io (optional for local dev)
if (process.env.NODE_ENV !== 'production') {
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: { origin: process.env.VITE_FRONTEND_URL, credentials: true }
  });

  const userSocketMap = {};
  io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) {
      userSocketMap[userId] = socket.id;
      io.emit('getOnlineUsers', Object.keys(userSocketMap));
    }
    socket.on('disconnect', () => {
      delete userSocketMap[userId];
      io.emit('getOnlineUsers', Object.keys(userSocketMap));
    });
  });

  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => console.log(`🚀 Local server running on port ${PORT}`));
}

// 🟢 Vercel needs this line:
export default app;

import express from 'express';
import cors from 'cors';
import http from 'http';
import { connectDB } from './lib/db_connect.js';
import userRouter from './routes/userRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.VITE_FRONTEND_URL || 'http://localhost:5173';
const server = http.createServer(app);

// CORS configuration (for both local + production)
const corsOptions = {
  origin: FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'token',
    'x-auth-token',
    'Origin',
    'Accept'
  ],
  exposedHeaders: ['token', 'Authorization']
};

app.use(cors(corsOptions));

// Handle preflight requests
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', FRONTEND_URL);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, token, x-auth-token, Origin, Accept');
    return res.status(200).json({});
  }
  next();
});

// Increase payload limit (for images)
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));

// Socket.io setup
export const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    credentials: true
  }
});

// Store users online
export const userSocketMap = {};

io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;
  console.log('User connected:', userId);

  if (userId) {
    userSocketMap[userId] = socket.id;
    io.emit('userConnected', userId);
  }

  socket.on('getOnlineUsers', () => {
    io.emit('getOnlineUsers', Object.keys(userSocketMap));
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', userId);
    if (userId) {
      delete userSocketMap[userId];
      io.emit('userDisconnected', userId);
    }
    io.emit('getOnlineUsers', Object.keys(userSocketMap));
  });
});

// Health check route
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/user', userRouter);
app.use('/api/message', messageRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
  process.exit(1);
});

// Start server
const startServer = async () => {
  try {
    await connectDB();
    console.log('✅ MongoDB connected successfully');
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 CORS allowed for: ${FRONTEND_URL}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

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
const server = http.createServer(app);

// CORS configuration with all necessary headers
const corsOptions = {
  origin: "http://localhost:5173", // frontend URL
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
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, token, x-auth-token, Origin, Accept');
    return res.status(200).json({});
  }
  next();
});

// Increase payload size limit for image uploads
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ limit: '2mb', extended: true }));

// Socket.io setup
export const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",  // frontend URL
    credentials: true
  }
});

// store users online
export const userSocketMap = {};

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("User connected", userId);

  if (userId) {
    userSocketMap[userId] = socket.id;
    // Emit to all clients that a new user is online
    io.emit("userConnected", userId);
  }

  // Handle request for online users
  socket.on("getOnlineUsers", () => {
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });

  socket.on("disconnect", () => {
    console.log("User disconnected", userId);
    if (userId) {
      delete userSocketMap[userId];
      // Emit to all clients that a user went offline
      io.emit("userDisconnected", userId);
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// Middleware setup
app.use(express.json());

// Health check route
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Main routes
app.use('/api/user', userRouter);
app.use('/api/message', messageRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
  process.exit(1);
});

// Initialize server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('MongoDB connected successfully');

    // Start the HTTP server
    server.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer().catch(error => {
  console.error('Server initialization failed:', error);
  process.exit(1);
});

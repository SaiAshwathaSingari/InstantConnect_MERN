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

  if (userId) userSocketMap[userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("User disconnected", userId);
    if (userId) delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// Middleware setup
app.use(express.json());

app.use(cors({
  origin: "http://localhost:5173",  // frontend URL
  credentials: true
}));

// routes
app.get('/api/status', (req, res) => {
  res.send("Server is running");
});

app.use('/api/user', userRouter);
app.use('/api/message', messageRoutes);

// Connect to DB
await connectDB();

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

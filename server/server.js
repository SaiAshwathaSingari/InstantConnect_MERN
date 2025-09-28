import express, { application } from 'express';
import cors from 'cors';
import http from 'http';
import { connectDB } from './lib/db_connect.js';
import userRouter from './routes/userRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { Socket } from 'dgram';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

export const io = new Server(server,{
  cors:{
    origin: "*"
  }
});
//store users online
export const userSocketMap = {};
io.on("connection",(Socket)=>{
  const userId = Socket.handshake.query.userId;
  console.log("User connected", userId);
  if(userId) userSocketMap[userId] = Socket.id;
  io.emit("getOnlineUsers",Object.keys(userSocketMap));
  Socket.on("disconnect",()=>{
    console.log("User disconnected", userId);
    if(userId) delete userSocketMap[userId];
    io.emit("getOnlineUsers",Object.keys(userSocketMap));
  } 
)}); 
//middleware Setup
app.use(express.json());
app.use(cors());

//routes

app.get('/api/status',(req,res)=>{
  res.send("Server is running")
})
//routes of User Router
app.use('/api/user',userRouter);
app.use('/api/message',messageRoutes);
//Connect to DB
await connectDB();
server.listen(PORT,()=>{
  console.log(`Server is running on http://localhost:${PORT}`);
})
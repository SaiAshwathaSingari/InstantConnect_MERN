import express, { application } from 'express';
import cors from 'cors';
import http from 'http';
import { connectDB } from './lib/db_connect.js';

const app = express();
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);


//middleware Setup
app.use(express.json());
app.use(cors());

//routes

app.get('/api/status',(req,res)=>{
  res.send("Server is running")
})
//Connect to DB
await connectDB();
server.listen(PORT,()=>{
  console.log(`Server is running on http://localhost:${PORT}`);
})
// Full API with database connections and routes
// This file contains the complete functionality that was causing the crash
// We'll add this back to index.js once the basic function works

import express from 'express';
import cors from 'cors';
import { connectDB } from '../lib/db_connect.js';
import userRouter from '../routes/userRoutes.js';
import messageRoutes from '../routes/messageRoutes.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// CORS configuration with all necessary headers
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
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

// Health check route
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root route for Vercel
app.get('/', (req, res) => {
  res.json({ 
    message: 'InstantConnect API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Main routes
app.use('/api/user', userRouter);
app.use('/api/message', messageRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Initialize database connection - but don't block the serverless function
let dbConnected = false;
let dbInitializing = false;

const initializeDB = async () => {
  if (dbConnected || dbInitializing) return;
  
  dbInitializing = true;
  
  try {
    if (process.env.MONGODB_URI) {
      await connectDB();
      dbConnected = true;
      console.log('MongoDB connected successfully');
    } else {
      console.warn('MONGODB_URI not found in environment variables');
    }
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    // Don't throw error in serverless environment
  } finally {
    dbInitializing = false;
  }
};

// Initialize DB connection on cold start
initializeDB();

// Export for Vercel
export default app;

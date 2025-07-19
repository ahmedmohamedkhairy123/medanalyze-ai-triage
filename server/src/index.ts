import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/database';
import authRoutes from './routes/auth';
import analysesRoutes from './routes/analyses';
import startFastApi from './fastApi';

// 1. Initialize Configuration
dotenv.config();
const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

// 2. WebSocket Setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
  }
});

// 3. Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. Routes
app.use('/api/auth', authRoutes);
app.use('/api/analyses', analysesRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'MedAnalyze API is running' });
});

// 5. WebSocket Logic
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

/**
 * 6. Server Startup Sequence
 * We connect to the Database and FastAPI before opening the port
 */
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('✅ MongoDB connected successfully');

    // Start FastAPI server
    await startFastApi();
    console.log('⚡ FastAPI server started');

    // Start the main Express/Socket.io server
    httpServer.listen(PORT, () => {
      console.log(`🚀 Main API running on port ${PORT}`);
      console.log(`📡 WebSocket server ready`);
    });

  } catch (err) {
    console.error('❌ Server startup failed:', err);
    process.exit(1);
  }
};

startServer();
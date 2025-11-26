import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { config } from 'dotenv';
import { initTRPC } from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';
import { appRouter } from './trpc/router';
import { createContext } from './trpc/context';

// Load environment variables
config();

const app = express();
const httpServer = createServer(app);

// Initialize Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// tRPC endpoint
app.use(
  '/trpc',
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext: (opts) => createContext(opts, io),
  })
);

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  
  // Handle subscription to analysis updates
  socket.on('subscribe:analysis', (data: { analysisId: string }) => {
    socket.join(`analysis:${data.analysisId}`);
    console.log(`Client ${socket.id} subscribed to analysis ${data.analysisId}`);
  });
  
  socket.on('unsubscribe:analysis', (data: { analysisId: string }) => {
    socket.leave(`analysis:${data.analysisId}`);
    console.log(`Client ${socket.id} unsubscribed from analysis ${data.analysisId}`);
  });
  
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Start server
const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 tRPC endpoint: http://localhost:${PORT}/trpc`);
  console.log(`🔌 WebSocket server ready`);
  console.log(`💾 Database: ${process.env.DATABASE_URL?.split('@')[1] || 'localhost:5432/crypto_intel'}`);
  console.log(`🧠 Ollama: ${process.env.OLLAMA_BASE_URL || 'http://localhost:11434'}`);
});

// Export io instance for use in other modules
export { io };

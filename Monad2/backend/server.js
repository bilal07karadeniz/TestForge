import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import analyzeRoutes from './routes/analyze.js';
import { validateConfig } from './utils/monad.config.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3000;

// Make io available to routes
app.set('io', io);

// Middleware
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api', analyzeRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Monad AI Contract Tester',
    version: '1.0.0',
    endpoints: {
      analyze: 'POST /api/analyze',
      health: 'GET /api/health'
    },
    network: 'Monad Testnet',
    chainId: 10143
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Start server
async function startServer() {
  try {
    // Validate configuration
    console.log('Validating configuration...');
    validateConfig();
    console.log('✓ Configuration valid');

    // Check API key
    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_anthropic_api_key_here') {
      console.warn('\n⚠️  WARNING: ANTHROPIC_API_KEY not set in .env file!');
      console.warn('Please set your API key to use AI features.\n');
    }

    // Socket.io connection handling
    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });

    httpServer.listen(PORT, () => {
      console.log('\n╔════════════════════════════════════════════╗');
      console.log('║   Monad AI Contract Tester - Backend     ║');
      console.log('╚════════════════════════════════════════════╝\n');
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`🔌 WebSocket ready for real-time updates`);
      console.log(`🌐 Network: Monad Testnet (Chain ID: 10143)`);
      console.log(`🤖 AI Model: claude-sonnet-4-5-20250929`);
      console.log('\nEndpoints:');
      console.log(`  POST http://localhost:${PORT}/api/analyze`);
      console.log(`  GET  http://localhost:${PORT}/api/health`);
      console.log('\nReady to analyze smart contracts! 🎉\n');
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
  process.exit(1);
});

startServer();

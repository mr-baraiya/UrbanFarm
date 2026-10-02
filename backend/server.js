require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const errorMiddleware = require('./middleware/errorMiddleware');
const routes = require('./routes');

const app = express();

// CORS configuration for local and deployed frontend
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://urbanfarm.baraiyavishalbhai32.workers.dev',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy: Origin ${origin} is not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database connection middleware for Serverless (Vercel) & local
app.use(async (req, res, next) => {
  // Allow health checks without waiting on DB if DB is down
  if (req.path === '/health' || req.path === '/') {
    return next();
  }
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('Database connection error in request middleware:', error.message);
    res.status(500).json({
      success: false,
      message: 'Database connection failed. Please check MONGO_URI configuration.',
      error: error.message
    });
  }
});

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'OK',
    name: 'UrbanFarm Backend API',
    version: '3.0.0',
    serverless: Boolean(process.env.VERCEL),
    endpoints: {
      health: '/health',
      api: '/api'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Urban Farming Assistant API is healthy and operational',
    timestamp: new Date().toISOString()
  });
});

// Main API Routes
app.use('/api', routes);

// Error handling (must be last middleware)
app.use(errorMiddleware);

// Handle 404 for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Start local server if not running as a Vercel serverless function
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 UrbanFarm Backend running on http://localhost:${PORT}`);
    });
  }).catch((err) => {
    console.error('Failed to start server:', err.message);
  });
}

module.exports = app;
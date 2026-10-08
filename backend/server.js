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
  'http://localhost:5000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  'https://urbanfarm.baraiyavishalbhai32.workers.dev',
  process.env.FRONTEND_URL,
].filter(Boolean);

const isOriginAllowed = (origin) => {
  if (!origin) return true;
  const cleanOrigin = origin.trim().replace(/\/+$/, '');
  if (allowedOrigins.some((o) => o.replace(/\/+$/, '') === cleanOrigin)) return true;
  // Match Cloudflare Workers & Vercel deployments of UrbanFarm
  if (/^https:\/\/urbanfarm[a-zA-Z0-9-]*\.baraiyavishalbhai32\.workers\.dev$/i.test(cleanOrigin)) return true;
  if (/^https:\/\/urbanfarm[a-zA-Z0-9-]*\.vercel\.app$/i.test(cleanOrigin)) return true;
  if (/^https:\/\/[a-zA-Z0-9-]+\.workers\.dev$/i.test(cleanOrigin)) return true;
  if (process.env.NODE_ENV !== 'production' && /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(cleanOrigin)) return true;
  return false;
};

// 1. Immediate Preflight & CORS Header Interceptor (Runs first, before DB or body parsers)
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin && isOriginAllowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Requested-With, Cache-Control, Pragma, Accept-Language, Accept, X-CSRF-Token'
    );
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    res.setHeader('Access-Control-Max-Age', '86400');
  }

  // Preflight OPTIONS requests must immediately respond with 204 No Content
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  next();
});

// 2. Standard CORS middleware for route-level safety
app.use(
  cors({
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Cache-Control',
      'Pragma',
      'Accept-Language',
      'Accept',
      'X-CSRF-Token'
    ],
    exposedHeaders: ['Content-Disposition'],
  })
);

app.options('*', (req, res) => {
  const origin = req.headers.origin;
  if (origin && isOriginAllowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  res.status(204).end();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Favicon handler to avoid 500 error on browser requests
app.get('/favicon.ico', (req, res) => res.status(204).end());

// SEO Robots.txt Endpoint
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(`# UrbanFarm Assistant robots.txt
User-agent: *
Allow: /
Allow: /app/diagnosis
Allow: /app/watering
Allow: /app/gardens
Allow: /app/crops
Allow: /app/community
Allow: /contact
Allow: /faq
Allow: /login
Allow: /register

Disallow: /admin/
Disallow: /api/admin/
Disallow: /api/chat/

Sitemap: https://urbanfarm.baraiyavishalbhai32.workers.dev/sitemap.xml`);
});

// SEO Sitemap.xml Endpoint
app.get('/sitemap.xml', (req, res) => {
  res.header('Content-Type', 'application/xml; charset=utf-8');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://urbanfarm.baraiyavishalbhai32.workers.dev/</loc>
    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.00</priority>
  </url>
  <url>
    <loc>https://urbanfarm.baraiyavishalbhai32.workers.dev/about</loc>
    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.80</priority>
  </url>
  <url>
    <loc>https://urbanfarm.baraiyavishalbhai32.workers.dev/features</loc>
    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.80</priority>
  </url>
  <url>
    <loc>https://urbanfarm.baraiyavishalbhai32.workers.dev/contact</loc>
    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.70</priority>
  </url>
  <url>
    <loc>https://urbanfarm.baraiyavishalbhai32.workers.dev/faq</loc>
    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.70</priority>
  </url>
  <url>
    <loc>https://urbanfarm.baraiyavishalbhai32.workers.dev/demo</loc>
    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>
  <url>
    <loc>https://urbanfarm.baraiyavishalbhai32.workers.dev/rewards</loc>
    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.80</priority>
  </url>
  <url>
    <loc>https://urbanfarm.baraiyavishalbhai32.workers.dev/market-prices</loc>
    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.90</priority>
  </url>
  <url>
    <loc>https://urbanfarm.baraiyavishalbhai32.workers.dev/app/diagnose</loc>
    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.90</priority>
  </url>
  <url>
    <loc>https://urbanfarm.baraiyavishalbhai32.workers.dev/app/watering</loc>
    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.90</priority>
  </url>
  <url>
    <loc>https://urbanfarm.baraiyavishalbhai32.workers.dev/app/gardens</loc>
    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>
  <url>
    <loc>https://urbanfarm.baraiyavishalbhai32.workers.dev/app/crops</loc>
    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>
  <url>
    <loc>https://urbanfarm.baraiyavishalbhai32.workers.dev/app/community</loc>
    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.80</priority>
  </url>
  <url>
    <loc>https://urbanfarm.baraiyavishalbhai32.workers.dev/login</loc>
    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.60</priority>
  </url>
  <url>
    <loc>https://urbanfarm.baraiyavishalbhai32.workers.dev/register</loc>
    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.60</priority>
  </url>
</urlset>`);
});

// Database connection middleware for Serverless (Vercel) & local
app.use(async (req, res, next) => {
  // Allow health checks, root, favicon, sitemap, robots, and OPTIONS without waiting on DB if DB is down
  if (
    req.method === 'OPTIONS' ||
    req.path === '/health' ||
    req.path === '/' ||
    req.path === '/favicon.ico' ||
    req.path === '/robots.txt' ||
    req.path === '/sitemap.xml'
  ) {
    return next();
  }
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('Database connection error in request middleware:', error.message);
    res.status(500).json({
      success: false,
      message: 'Database connection failed. Please check MONGO_URI configuration in Vercel environment variables.',
      error: error.message
    });
  }
});

// Root route – branded landing page
app.get('/', (req, res) => {
  res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>UrbanFarm API</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      min-height: 100vh;
      display: flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, #0a1f13 0%, #1a3a24 50%, #0d2618 100%);
      font-family: 'Segoe UI', system-ui, sans-serif;
      color: #e8f5e9;
    }
    .card {
      text-align: center;
      padding: 48px 56px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 24px;
      backdrop-filter: blur(12px);
      box-shadow: 0 24px 64px rgba(0,0,0,0.4);
      max-width: 480px;
      width: 90%;
    }
    .logo {
      width: 80px; height: 80px;
      background: linear-gradient(135deg, #2d6a4f, #52b788);
      border-radius: 20px;
      display: flex; align-items: center; justify-content: center;
      font-size: 40px;
      margin: 0 auto 24px;
      box-shadow: 0 8px 24px rgba(82,183,136,0.3);
    }
    h1 { font-size: 28px; font-weight: 700; color: #52b788; margin-bottom: 8px; }
    .subtitle { font-size: 14px; color: #a5d6a7; margin-bottom: 32px; }
    .status-badge {
      display: inline-flex; align-items: center; gap: 8px;
      background: rgba(82,183,136,0.15);
      border: 1px solid rgba(82,183,136,0.3);
      border-radius: 100px;
      padding: 6px 16px;
      font-size: 13px; color: #52b788;
      margin-bottom: 28px;
    }
    .dot { width: 8px; height: 8px; background: #52b788; border-radius: 50%; animation: pulse 1.5s infinite; }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
    .endpoints { text-align: left; margin-top: 24px; }
    .endpoint {
      display: flex; justify-content: space-between; align-items: center;
      padding: 10px 16px;
      background: rgba(255,255,255,0.04);
      border-radius: 10px;
      margin-bottom: 8px;
      font-size: 13px;
    }
    .endpoint code { color: #81c784; font-family: monospace; }
    .endpoint span { color: #a5d6a7; font-size: 12px; }
    .version { margin-top: 24px; font-size: 12px; color: #4caf50; opacity: 0.6; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">🌱</div>
    <h1>UrbanFarm API</h1>
    <p class="subtitle">AI-Powered Urban Farming Assistant Backend</p>
    <div class="status-badge">
      <div class="dot"></div>
      All systems operational
    </div>
    <div class="endpoints">
      <div class="endpoint"><code>GET /health</code><span>Health check</span></div>
      <div class="endpoint"><code>POST /api/auth/login</code><span>Authentication</span></div>
      <div class="endpoint"><code>GET /api/plants</code><span>Plant management</span></div>
      <div class="endpoint"><code>GET /api/ai/chat</code><span>AI Assistant</span></div>
    </div>
    <p class="version">v3.0.0 · ${Boolean(process.env.VERCEL) ? 'Vercel Serverless' : 'Node.js'}</p>
  </div>
</body>
</html>`);
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
  connectDB().then(async () => {
    const server = app.listen(PORT, () => {
      console.log(`🚀 UrbanFarm Backend running on http://localhost:${PORT}`);
      // Initialize MQTT Service safely
      try {
        const mqttService = require('./services/mqttService');
        const iotService = require('./services/iotService');
        mqttService.initMQTT();
        // Seed initial virtual reading for ESP32-TOMATO-01 if none exists
        setTimeout(async () => {
          await iotService.generateSimulation('NORMAL', 'ESP32-TOMATO-01', 'tomato-01');
        }, 3000);
      } catch (mqttErr) {
        console.warn('⚠️ MQTT initialization warning:', mqttErr.message);
      }
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is currently in use by another process. Retrying in 1 second...`);
        setTimeout(() => {
          server.close();
          app.listen(PORT);
        }, 1000);
      } else {
        console.error('Server error:', err);
      }
    });
  }).catch((err) => {
    console.error('Failed to start server:', err.message);
  });
}

module.exports = app;
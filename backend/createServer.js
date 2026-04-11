const express = require('express');
const http = require('http');
const path = require('path');
const { createRequire } = require('module');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { startCronJobs } = require('./utils/cron');
const { initSocket } = require('./socket');

// Use process.cwd() based resolution instead of __dirname for Render compatibility
const frontendDir = path.resolve(process.cwd(), '../frontend');
const frontendRequire = createRequire(path.join(frontendDir, 'package.json'));
const next = frontendRequire('next');

const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({
  dev,
  dir: frontendDir,
  conf: {
    distDir: '.next',
  },
});

const handle = nextApp.getRequestHandler();

function getAllowedOrigins() {
  return (
    process.env.CLIENT_URLS ||
    process.env.CLIENT_URL ||
    'http://localhost:3000'
  )
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function createCorsOrigin(allowedOrigins) {
  return (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error(`CORS blocked for origin: ${origin}`));
  };
}

async function createServer() {
  const serverApp = express();

  // Prepare Next.js FIRST before anything else
  await nextApp.prepare();

  const server = http.createServer(serverApp);
  const allowedOrigins = getAllowedOrigins();
  const corsOrigin = createCorsOrigin(allowedOrigins);

  const io = new Server(server, {
    cors: {
      origin: corsOrigin,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
  });

  serverApp.use((req, _res, next) => {
    req.io = io;
    next();
  });

  connectDB();

  serverApp.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    })
  );

  serverApp.use(
    cors({
      origin: corsOrigin,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  serverApp.use(express.json({ limit: '10mb' }));
  serverApp.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // ── Health ──────────────────────────────────────────────────────────────────
  serverApp.get('/health', (_req, res) =>
    res.json({
      success: true,
      message: 'DebateHub API running',
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    })
  );

  // ── API Routes ───────────────────────────────────────────────────────────────
  serverApp.use('/api/auth', require('./routes/auth'));
  serverApp.use('/api/debates', require('./routes/debates'));
  serverApp.use('/api/arguments', require('./routes/arguments'));
  serverApp.use('/api/stats', require('./routes/stats'));
  serverApp.use('/api/users', require('./routes/users'));
  serverApp.use('/api/notifications', require('./routes/notifications'));
  serverApp.use('/api/search', require('./routes/search'));
  serverApp.use('/api/ai', require('./routes/ai'));
  serverApp.use('/api/support', require('./routes/support'));
  serverApp.use('/api/admin', require('./routes/admin'));

  serverApp.use('/api', (req, res) => {
    res.status(404).json({
      success: false,
      message: `Route ${req.originalUrl} not found.`,
    });
  });

  // ── Error handler BEFORE Next.js handler ────────────────────────────────────
  serverApp.use(errorHandler);

  // ── Socket.IO ────────────────────────────────────────────────────────────────
  initSocket(io);

  // ── Next.js static + SSR — must be LAST, handles _next/static internally ────
  serverApp.all('*', (req, res) => {
    return handle(req, res);
  });

  const start = (port = process.env.PORT || 5000) => {
    server.listen(port, () => {
      console.log(
        `DebateHub server running on port ${port} [${process.env.NODE_ENV || 'development'}]`
      );
      startCronJobs();
    });
  };

  return { serverApp, server, io, start };
}

module.exports = { createServer };
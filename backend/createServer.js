const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { startCronJobs } = require('./utils/cron');
const { initSocket } = require('./socket');

const frontendDir = path.resolve(__dirname, '..', 'frontend');
const frontendDistDir = path.join(frontendDir, 'dist');

function getAllowedOrigins() {
  const configuredOrigins = [
    process.env.CLIENT_URLS,
    process.env.CLIENT_URL,
  ]
    .filter(Boolean)
    .flatMap((origins) => origins.split(','))
    .map((origin) => origin.trim())
    .filter(Boolean);

  return [
    ...new Set([
      ...configuredOrigins,
      'http://localhost:5000',
      'http://127.0.0.1:5000',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
    ]),
  ];
}

function createCorsOrigin(allowedOrigins) {
  return (origin, callback) => {
    callback(null, true);
  };
}

async function createServer() {
  const serverApp = express();

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
      crossOriginOpenerPolicy: false,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' }, // Required for Google OAuth origin validation
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

  // ── Error handler before React SPA fallback ────────────────────────────────────
  serverApp.use(errorHandler);

  // ── Socket.IO ────────────────────────────────────────────────────────────────
  initSocket(io);

  // React static assets + SPA fallback - must be LAST.
  serverApp.use(express.static(frontendDistDir));
  serverApp.get('*', (_req, res) => {
    res.sendFile(path.join(frontendDistDir, 'index.html'));
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

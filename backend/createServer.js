const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { startCronJobs } = require('./utils/cron');
const { initSocket } = require('./socket');

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

function createServer({ frontendHandler } = {}) {
  const app = express();
  const server = http.createServer(app);
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

  app.use((req, _res, next) => {
    req.io = io;
    next();
  });

  connectDB();

  app.use(helmet());
  app.use(cors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  app.get('/health', (_req, res) => res.json({
    success: true,
    message: 'DebateHub API running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  }));

  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/debates', require('./routes/debates'));
  app.use('/api/arguments', require('./routes/arguments'));
  app.use('/api/stats', require('./routes/stats'));
  app.use('/api/users', require('./routes/users'));
  app.use('/api/notifications', require('./routes/notifications'));
  app.use('/api/search', require('./routes/search'));
  app.use('/api/ai', require('./routes/ai'));
  app.use('/api/support', require('./routes/support'));
  app.use('/api/admin', require('./routes/admin'));

  app.use('/api', (req, res) => {
    res.status(404).json({
      success: false,
      message: `Route ${req.originalUrl} not found.`,
    });
  });

  app.use(errorHandler);

  initSocket(io);

  if (frontendHandler) {
    app.all('*', frontendHandler);
  } else {
    app.use((req, res) => {
      res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found.`,
      });
    });
  }

  return {
    app,
    server,
    io,
    start(port = process.env.PORT || 5000) {
      server.listen(port, () => {
        console.log(`DebateHub server running on port ${port} [${process.env.NODE_ENV || 'development'}]`);
        startCronJobs();
      });
    },
  };
}

module.exports = { createServer };

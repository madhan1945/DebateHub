require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const helmet   = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { startCronJobs } = require('./utils/cron');

const app = express();

connectDB();

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please slow down.' },
});
app.use('/api', globalLimiter);

app.get('/health', (req, res) => res.json({
  success: true, message: 'DebateHub API running',
  environment: process.env.NODE_ENV, timestamp: new Date().toISOString(),
}));

// ── Routes ──
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/debates',   require('./routes/debates'));
app.use('/api/arguments', require('./routes/arguments'));
app.use('/api/stats',     require('./routes/stats'));
// Day 3+
// app.use('/api/users', require('./routes/users'));

app.use((req, res) => res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` }));
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 DebateHub server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  startCronJobs();
});

module.exports = app;

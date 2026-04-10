require('dotenv').config();
const { createServer } = require('./createServer');

const { app, io, start } = createServer();

start(process.env.PORT || 5000);

module.exports = { app, io };

/*
const allowedOrigins = (
  process.env.CLIENT_URLS ||
  process.env.CLIENT_URL ||
  'http://localhost:3000'
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOrigin = (origin, callback) => {
  if (!origin || allowedOrigins.includes(origin)) {
    callback(null, true);
    return;
  }

  callback(new Error(`CORS blocked for origin: ${origin}`));
};

const io = new Server(server, {
  cors: {
    origin: corsOrigin,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 60000,
});

// Make io available to controllers via req.io
app.use((req, _res, next) => { req.io = io; next(); });

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

// Rate limiting removed per system administrator request

app.get('/health', (_req, res) => res.json({
  success: true, message: 'DebateHub API running',
  environment: process.env.NODE_ENV, timestamp: new Date().toISOString(),
}));

// ── Routes ──
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/debates',       require('./routes/debates'));
app.use('/api/arguments',     require('./routes/arguments'));
app.use('/api/stats',         require('./routes/stats'));
app.use('/api/users',         require('./routes/users'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/search',        require('./routes/search'));
app.use('/api/ai',            require('./routes/ai'));
app.use('/api/support',       require('./routes/support')); // Support Chatbot
app.use('/api/admin',         require('./routes/admin'));

app.use((req, res) => res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` }));
app.use(errorHandler);

// Init Socket.IO
initSocket(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 DebateHub server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  startCronJobs();
});

module.exports = { app, io };
*/

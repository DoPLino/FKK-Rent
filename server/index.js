const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const path = require('path');
// Centralized env loader (dotenv-flow + zod validation)
require('./config/loadEnv');
// Initialize upload/env config (parses MAX_FILE_SIZE, resolves UPLOAD_PATH, ensures directory, exposes CORS)
const { MAX_FILE_SIZE, UPLOAD_PATH, CORS } = require('./config/env');

const app = express();
// For secure cookies behind proxies (e.g., Heroku, Vercel)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    const allowed = CORS.allowedOrigins;

    // If no Origin header (e.g., curl, same-origin), allow by default
    if (!origin) return callback(null, true);

    // When credentials are enabled, we must not use '*'. The cors middleware
    // will echo back the request origin if we call callback(null, true) and
    // the provided origin is allowed. Otherwise reject.
    if (allowed.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: CORS.credentials,
  methods: CORS.allowedMethods,
  allowedHeaders: CORS.allowedHeaders,
  maxAge: CORS.maxAge,
}));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend is working!',
    timestamp: new Date().toISOString()
  });
});

// Import routes
const authRoutes = require('./routes/auth');
const equipmentRoutes = require('./routes/equipment');
const bookingRoutes = require('./routes/bookings');
const userRoutes = require('./routes/users');
const qrRoutes = require('./routes/qr');
const locationRoutes = require('./routes/locations');
const uploadRoutes = require('./routes/uploads');
// Ensure mongoose registers all models before first use (fixes MissingSchemaError on populate)
require('./models/Location');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/uploads', uploadRoutes);

// Equipment endpoints


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/filmequipment';
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB');
    console.error(error?.message || error);
    // Abort startup to avoid running with a non-functional data layer
    throw error;
  }
};

// Start server
const PORT = process.env.PORT || 3001;
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📱 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔗 API: http://localhost:${PORT}/api`);
      console.log(`📦 Upload path: ${UPLOAD_PATH}`);
      console.log(`⬆️  Max file size: ${MAX_FILE_SIZE} bytes`);
      console.log(`✅ Backend is ready with full features!`);
    });
  } catch (err) {
    console.error('🛑 Aborting startup due to database connection failure.');
    console.error(err?.message || err);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});
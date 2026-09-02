const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables from server/.env if available
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

// Middleware
const getDynamicAllowedOrigins = () => {
  const origins = new Set([
    'http://localhost:5173',
    'http://localhost:5001',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5001',
    'https://orderflow-system-delta.vercel.app',
  ]);

  if (process.env.CLIENT_URL) {
    process.env.CLIENT_URL.split(',').forEach((url) => {
      const trimmed = url.trim().replace(/\/$/, '');
      if (trimmed) origins.add(trimmed);
    });
  }

  if (process.env.VERCEL_URL) {
    const vercelUrl = process.env.VERCEL_URL.trim().replace(/\/$/, '');
    if (vercelUrl) {
      origins.add(vercelUrl.startsWith('http') ? vercelUrl : `https://${vercelUrl}`);
    }
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    const prodUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL.trim().replace(/\/$/, '');
    if (prodUrl) {
      origins.add(prodUrl.startsWith('http') ? prodUrl : `https://${prodUrl}`);
    }
  }

  return origins;
};

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (same-origin, server-to-server, mobile apps, Postman, curl)
      if (!origin) return callback(null, true);

      const cleanOrigin = origin.replace(/\/$/, '');
      const allowedOrigins = getDynamicAllowedOrigins();

      // Allow exact matches in allowed origins or any Vercel deployment preview domain
      if (allowedOrigins.has(cleanOrigin) || /\.vercel\.app$/.test(cleanOrigin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS policy blocked access from origin ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

app.use(express.json());
app.use(morgan('dev'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'OrderFlow API is running smoothly', timestamp: new Date() });
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/customers', require('./routes/customerRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/activity-logs', require('./routes/activityRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));

// Centralized Error Handling Middleware
app.use(errorHandler);

module.exports = app;

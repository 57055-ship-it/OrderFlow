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
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map((url) => url.trim().replace(/\/$/, '')) : []),
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (same-origin, server-to-server, mobile apps, Postman)
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.replace(/\/$/, '');
      if (allowedOrigins.includes(cleanOrigin) || allowedOrigins.includes('*')) {
        return callback(null, true);
      }
      return callback(new Error(`CORS policy blocked access from origin ${origin}`));
    },
    credentials: true,
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

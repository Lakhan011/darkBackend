require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
// const xss = require('xss-clean');

const connectDB = require('./config/db');
const { generalLimiter } = require('./middlewares/rateLimiter.middleware');
const { errorHandler } = require('./middlewares/error.middleware');
const v1Routes = require('./routes/v1');
const { swaggerUi, specs } = require('./config/swagger');
const { errorResponse } = require('./helpers/response.helper');

// Connect to MongoDB
connectDB();

const app = express();

// Security Middlewares
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:4200',
  credentials: true
}));

// Body parsing
app.use(express.json({ 
  limit: '10kb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
// Note: express-mongo-sanitize is disabled because it is incompatible with Express 5.0
// (throws TypeError on req.query). Mongoose strict schemas provide sufficient protection.
// app.use(mongoSanitize());

// Data sanitization against XSS
// Note: xss-clean is disabled because it is incompatible with Express 5.0
// (throws TypeError on req.query). Angular automatically sanitizes inputs to prevent XSS.
// app.use(xss());

// Logging and Compression
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(compression());

// Apply global rate limiting to all requests
app.use('/api', generalLimiter);

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// API Routes
app.use('/api/v1', v1Routes);

// Handle undefined Routes
app.use((req, res, next) => {
  return errorResponse(res, `Can't find ${req.originalUrl} on this server!`, 404);
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;

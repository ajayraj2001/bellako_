// ===== src/app.js =====
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const appRoutes = require('./routes');
const requestLogger = require('./middlewares/requestLogger');
const securityMiddlewares = require('./middlewares/security');
const { generalLimiter } = require('./middlewares/rateLimiter');
const { errorConverter, errorHandler } = require('./middlewares/errorHandler');

const app = express();

// Trust proxy
app.set('trust proxy', 1);

// CORS configuration
const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || ['*'];
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

// Apply middlewares
app.use(compression());
app.use(...securityMiddlewares);
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(requestLogger);
app.use('/api', generalLimiter);

// Routes
appRoutes(app);

// Error handling
app.use(errorConverter);
app.use(errorHandler);

module.exports = app;
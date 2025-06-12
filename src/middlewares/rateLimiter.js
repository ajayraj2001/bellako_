// ===== src/middlewares/rateLimiter.js =====
const rateLimit = require('express-rate-limit');
const ApiError = require('../utils/apiError');

const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 100) => {
    return rateLimit({
        windowMs,
        max,
        skipSuccessfulRequests: false,
        handler: (req, res, next) => {
            next(new ApiError(429, 'Too many requests, please try again later.'));
        },
        standardHeaders: true,
        legacyHeaders: false,
    });
};

module.exports = {
    generalLimiter: createRateLimiter(15 * 60 * 1000, 100), // 100 requests per 15 minutes
    authLimiter: createRateLimiter(15 * 60 * 1000, 5), // 5 requests per 15 minutes
};
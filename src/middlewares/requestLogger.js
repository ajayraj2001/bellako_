// ===== src/middlewares/requestLogger.js =====
const logger = require('../config/logger');

const requestLogger = (req, res, next) => {
    const start = Date.now();

    // Log request
    logger.http({
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('user-agent')
    });

    // Log response
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.http({
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip
        });
    });

    next();
};

module.exports = requestLogger;
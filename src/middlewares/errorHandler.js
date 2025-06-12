// ===== src/middlewares/errorHandler.js =====
const ApiError = require('../utils/apiError');
const ResponseHandler = require('../utils/responseHandler');
const logger = require('../config/logger');

const errorConverter = (err, req, res, next) => {
    let error = err;

    if (!(error instanceof ApiError)) {
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Internal Server Error';
        error = new ApiError(statusCode, message, false, err.stack);
    }

    next(error);
};

const errorHandler = (err, req, res, next) => {
    let { statusCode, message } = err;

    if (process.env.NODE_ENV === 'production' && !err.isOperational) {
        statusCode = 500;
        message = 'Internal Server Error';
    }

    // Log error
    logger.error({
        error: err,
        request: {
            method: req.method,
            url: req.originalUrl,
            headers: req.headers,
            body: req.body,
            params: req.params,
            query: req.query
        }
    });

    ResponseHandler.error(res, err, statusCode);
};

module.exports = {
    errorConverter,
    errorHandler
};

// ===== src/utils/responseHandler.js =====
const { RESPONSE_STATUS } = require('../config/constants');
const logger = require('../config/logger');

class ResponseHandler {
    static success(res, data = null, message = 'Success', statusCode = 200) {
        const response = {
            status: RESPONSE_STATUS.SUCCESS,
            message,
            timestamp: new Date().toISOString()
        };

        if (data !== null) {
            response.data = data;
        }

        return res.status(statusCode).json(response);
    }

    static paginated(res, data, pagination, message = 'Success') {
        const response = {
            status: RESPONSE_STATUS.SUCCESS,
            message,
            data,
            pagination: {
                page: pagination.page,
                limit: pagination.limit,
                totalPages: pagination.totalPages,
                totalItems: pagination.totalItems,
                hasNext: pagination.hasNext,
                hasPrev: pagination.hasPrev
            },
            timestamp: new Date().toISOString()
        };

        return res.status(200).json(response);
    }

    static error(res, error, statusCode = 500) {
        const response = {
            status: RESPONSE_STATUS.ERROR,
            message: error.message || 'Internal Server Error',
            timestamp: new Date().toISOString()
        };

        if (process.env.NODE_ENV === 'development') {
            response.stack = error.stack;
            response.error = error;
        }

        // Log error
        logger.error({
            message: error.message,
            statusCode,
            stack: error.stack,
            url: res.req?.originalUrl,
            method: res.req?.method,
            ip: res.req?.ip
        });

        return res.status(statusCode).json(response);
    }

    static validationError(res, errors) {
        const response = {
            status: RESPONSE_STATUS.FAIL,
            message: 'Validation Error',
            errors,
            timestamp: new Date().toISOString()
        };

        return res.status(400).json(response);
    }
}

module.exports = ResponseHandler;
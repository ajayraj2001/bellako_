// ===== src/middlewares/auth.js =====
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const ApiError = require('../utils/apiError');
const catchAsync = require('../utils/catchAsync');

const authenticateUser = catchAsync(async (req, res, next) => {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new ApiError(401, 'Please authenticate');
    }

    const token = authHeader.replace('Bearer ', '');

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Find user
        const user = await User.findById(decoded.id).select('-refreshToken');

        if (!user) {
            throw new ApiError(401, 'User not found');
        }

        if (!user.isActive) {
            throw new ApiError(401, 'Account is deactivated');
        }

        // Attach user to request
        req.user = user;
        req.userId = user._id;

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            throw new ApiError(401, 'Invalid token');
        }
        if (error.name === 'TokenExpiredError') {
            throw new ApiError(401, 'Token expired');
        }
        throw error;
    }
});

const optionalAuth = catchAsync(async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }

        const token = authHeader.replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decoded.id).select('-refreshToken');

        if (user && user.isActive) {
            req.user = user;
            req.userId = user._id;
        }

        next();
    } catch (error) {
        // Continue without authentication
        next();
    }
});

module.exports = {
    authenticateUser,
    optionalAuth
};

// ===== src/routes/api.route.js =====
const express = require('express');
// const adminRoute = require('./admin.route');
const userRoute = require('./user.route');
const { generalLimiter } = require('../middlewares/rateLimiter');

const apiRoute = express.Router();

// apiRoute.use('/admin', adminRoute);
apiRoute.use('/user', generalLimiter, userRoute);

module.exports = apiRoute;


// ===== src/routes/index.js =====
const express = require('express');
const apiRoute = require('./api.route');
const ApiError = require('../utils/apiError');
const ResponseHandler = require('../utils/responseHandler');

const appRoutes = (app) => {
  // Health check
  app.get('/api/health', (req, res) => {
    ResponseHandler.success(res, {
      uptime: process.uptime(),
      timestamp: new Date(),
      environment: process.env.NODE_ENV,
      memoryUsage: process.memoryUsage()
    }, 'Server is healthy');
  });

  // Static files
  app.use('/public', express.static('public'));

  // API routes
  app.use('/api/v1', apiRoute);

  // 404 handler
  app.use((req, res, next) => {
    next(new ApiError(404, `Route ${req.originalUrl} not found`));
  });
};

module.exports = appRoutes;
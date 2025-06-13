// ===== index.js =====
require('dotenv').config();
const mongoose = require('mongoose');
const { connectToDatabase } = require('./config/db');
const app = require('./src/app');
const scripts = require('./src/scripts');
const logger = require('./src/config/logger');

const PORT = process.env.PORT || 5001;

(async () => {
  try {
    logger.info('Initializing server...');
    await connectToDatabase();
    await scripts();

    const server = app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
    });

    server.on('error', shutdown);

    // Graceful shutdown handlers
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      shutdown(error);
    });
    process.on('unhandledRejection', (error) => {
      logger.error('Unhandled Rejection:', error);
      shutdown(error);
    });

  } catch (error) {
    shutdown(error);
  }
})();

async function shutdown(signal) {
  try {
    logger.info(`Shutting down server... Signal: ${signal}`);
    await mongoose.connection.close();
    logger.info('Database connection closed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
}
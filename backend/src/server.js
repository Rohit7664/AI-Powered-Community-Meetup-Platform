const http = require('http');
const app = require('./app');
const config = require('./config/env');
const { connectDB, disconnectDB } = require('./config/db');
const { initSocketIO } = require('./sockets/chatSocket');
const { startMatchingWorker } = require('./workers/matchingWorker');
const { seedInterestsIfEmpty } = require('./services/interestService');
const logger = require('./utils/logger');

const server = http.createServer(app);

// Initialize Socket.IO
initSocketIO(server);

// Start server
const startServer = async () => {
  try {
    // 1. Connect MongoDB
    await connectDB();

    // 2. Seed initial interests
    await seedInterestsIfEmpty();

    // 3. Start BullMQ background worker
    startMatchingWorker();

    // 4. Listen on configured port
    const PORT = config.PORT || 8080;
    server.listen(PORT, () => {
      logger.info(`===============================================`);
      logger.info(`InterestHub Backend running in ${config.NODE_ENV} mode`);
      logger.info(`Server URL: http://localhost:${PORT}`);
      logger.info(`API Base:   http://localhost:${PORT}/api/v1`);
      logger.info(`Socket.IO:  Ready for real-time chat & alerts`);
      logger.info(`===============================================`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    logger.info('HTTP server closed.');
    await disconnectDB();
    process.exit(0);
  });
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

startServer();

module.exports = server;

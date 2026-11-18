const { Worker } = require('bullmq');
const Redis = require('ioredis');
const config = require('../config/env');
const logger = require('../utils/logger');
const { runMatchingForUser } = require('../services/matchingService');

let worker = null;

const startMatchingWorker = () => {
  try {
    const connection = new Redis(config.REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      retryStrategy: () => null, // don't hang if offline
    });

    connection.on('error', () => {
      // Suppress noisy logs if Redis is offline locally
    });

    worker = new Worker(
      'user-matching-queue',
      async (job) => {
        logger.info(`[BullMQ Worker] Processing job ${job.id} for user ${job.data.userId}`);
        const result = await runMatchingForUser(job.data.userId);
        return result;
      },
      {
        connection,
        concurrency: 5,
      }
    );

    worker.on('completed', (job, returnvalue) => {
      logger.info(`[BullMQ Worker] Job ${job.id} completed. Result: ${JSON.stringify(returnvalue)}`);
    });

    worker.on('failed', (job, err) => {
      logger.error(`[BullMQ Worker] Job ${job ? job.id : 'unknown'} failed: ${err.message}`);
    });

    logger.info('[BullMQ Worker] Matching worker initialized.');
  } catch (err) {
    logger.warn(`[BullMQ Worker] Could not start worker: ${err.message}`);
  }
};

module.exports = { startMatchingWorker };

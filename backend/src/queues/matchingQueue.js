const { Queue } = require('bullmq');
const Redis = require('ioredis');
const config = require('../config/env');
const logger = require('../utils/logger');

let matchingQueue = null;
let redisClient = null;
let isRedisAvailable = false;

// Attempt Redis connection
try {
  redisClient = new Redis(config.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy: (times) => {
      if (times > 3) {
        logger.warn('[BullMQ] Redis unavailable. Falling back to in-memory async matching queue.');
        return null; // Stop retrying
      }
      return Math.min(times * 100, 1000);
    },
  });

  redisClient.on('connect', () => {
    isRedisAvailable = true;
    logger.info('[BullMQ] Redis client connected.');
  });

  redisClient.on('error', (err) => {
    isRedisAvailable = false;
    logger.warn(`[BullMQ] Redis connection warning: ${err.message}`);
  });

  matchingQueue = new Queue('user-matching-queue', {
    connection: redisClient,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: 100,
      removeOnFail: 50,
    },
  });
} catch (err) {
  logger.warn(`[BullMQ] Initialization skipped Redis: ${err.message}`);
}

/**
 * Add a matching job for a user with duplicate job prevention
 */
const addMatchingJob = async (userId) => {
  const jobId = `match_${userId.toString()}_${Date.now()}`;

  if (isRedisAvailable && matchingQueue) {
    try {
      await matchingQueue.add(
        'match-user',
        { userId: userId.toString() },
        {
          jobId,
          removeOnComplete: true,
        }
      );
      logger.info(`[BullMQ] Added matching job ${jobId} to queue.`);
      return { queued: true, type: 'bullmq', jobId };
    } catch (err) {
      logger.warn(`[BullMQ] Failed to add to Redis queue: ${err.message}. Running async fallback.`);
    }
  }

  // Resilient fallback: Run async in next event loop tick so HTTP request finishes immediately
  setImmediate(async () => {
    try {
      const { runMatchingForUser } = require('../services/matchingService');
      await runMatchingForUser(userId);
    } catch (err) {
      logger.error(`[AsyncFallback] Error processing matching for ${userId}: ${err.message}`);
    }
  });

  return { queued: true, type: 'async-fallback', jobId };
};

module.exports = {
  matchingQueue,
  addMatchingJob,
  getIsRedisAvailable: () => isRedisAvailable,
};

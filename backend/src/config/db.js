const mongoose = require('mongoose');
const config = require('./env');

let memoryMongo = null;

const connectDB = async () => {
  try {
    let uri = config.MONGO_URI;

    // Connect with Mongoose
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 4000,
    });
    console.log(`[Database] MongoDB connected successfully to ${uri}`);
  } catch (error) {
    console.warn(`[Database] Could not connect to primary MongoDB (${config.MONGO_URI}): ${error.message}`);
    
    // In dev mode, spin up MongoDB Memory Server fallback so developer can run immediately
    if (config.NODE_ENV !== 'production') {
      try {
        console.log('[Database] Starting in-memory MongoDB fallback server...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        memoryMongo = await MongoMemoryServer.create();
        const memUri = memoryMongo.getUri();
        await mongoose.connect(memUri);
        console.log(`[Database] In-memory MongoDB connected at ${memUri}`);
      } catch (memErr) {
        console.error('[Database] Failed to start in-memory MongoDB:', memErr.message);
        throw error;
      }
    } else {
      throw error;
    }
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (memoryMongo) {
      await memoryMongo.stop();
    }
  } catch (err) {
    console.error('[Database] Disconnect error:', err.message);
  }
};

module.exports = { connectDB, disconnectDB };

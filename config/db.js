const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ecommerce';
  
  const options = {
    maxPoolSize: 10, // Maintain up to 10 socket connections
    serverSelectionTimeoutMS: 15000, // Keep trying to send operations for 15 seconds before failing
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    family: 4 // Use IPv4, skip trying IPv6
  };

  try {
    const conn = await mongoose.connect(MONGO_URI, options);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error: ', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected. Attempting to reconnect...');
    });

  } catch (error) {
    if (error.message.includes('ECONNREFUSED') && process.env.NODE_ENV === 'development') {
      logger.warn(`Local MongoDB is not running (ECONNREFUSED). Falling back to mongodb-memory-server for local development...`);
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongoServer = await MongoMemoryServer.create();
        const memoryUri = mongoServer.getUri();
        
        await mongoose.connect(memoryUri, options);
        logger.info(`Fallback In-Memory MongoDB Connected at: ${memoryUri}`);
        logger.info(`⚠️ NOTE: Data saved in this session will be lost when you restart the server. To persist data, start your local MongoDB service or use MongoDB Atlas.`);
      } catch (memError) {
        logger.error(`Failed to start memory server: ${memError.message}`);
        process.exit(1);
      }
    } else {
      logger.error(`Error connecting to MongoDB: ${error.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;

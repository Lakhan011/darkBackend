const socketIO = require('socket.io');
const logger = require('../utils/logger');

let io;

exports.initSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:4200',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    logger.info(`New client connected: ${socket.id}`);

    // User joins their own room for personal notifications
    socket.on('join_user_room', (userId) => {
      socket.join(`user_${userId}`);
      logger.info(`User ${userId} joined their personal room`);
    });

    // Seller joins their store room
    socket.on('join_seller_room', (storeId) => {
      socket.join(`store_${storeId}`);
      logger.info(`Seller joined store room ${storeId}`);
    });

    // Delivery boy joins delivery room
    socket.on('join_delivery_room', () => {
      socket.join('delivery_boys');
      logger.info(`Delivery boy joined delivery room`);
    });

    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

exports.getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

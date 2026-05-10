const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { logger } = require('./utils/logger');

let io = null;

/**
 * Initialize Socket.io on an existing HTTP server.
 * @param {import('http').Server} httpServer
 * @returns {import('socket.io').Server}
 */
const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: [
        'http://localhost:5173',
        process.env.FRONTEND_ORIGIN,
      ].filter(Boolean),
      methods: ['GET', 'POST'],
    },
  });

  // JWT authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    logger.info({ socketId: socket.id, userId: socket.userId }, 'Socket.io client connected');

    socket.on('disconnect', () => {
      logger.info({ socketId: socket.id }, 'Socket.io client disconnected');
    });
  });

  return io;
};

/**
 * Get the current Socket.io server instance.
 * @returns {import('socket.io').Server}
 */
const getIO = () => {
  if (!io) {
    throw new Error('Socket.io has not been initialized. Call initSocket(httpServer) first.');
  }
  return io;
};

/**
 * Emit a real-time event to all connected clients.
 * @param {string} event - Event name
 * @param {any} payload - Event data
 */
const emitEvent = (event, payload) => {
  if (io) {
    io.emit(event, payload);
  }
};

module.exports = { initSocket, getIO, emitEvent };

const { Server } = require('socket.io');

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

  io.on('connection', (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
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

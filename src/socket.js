import { io } from 'socket.io-client';

// In development, connect directly to the backend server (port 3000) to avoid Vite proxy errors.
// In production, the socket connects to the same origin.
const socketUrl = import.meta.env.DEV ? 'http://localhost:3000' : undefined;

const socket = io(socketUrl, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 2000,
});

/**
 * Connect the socket with the current JWT token for authentication.
 */
export const connectSocket = () => {
  const token = localStorage.getItem('token');

  if (!token) return;

  socket.auth = { token };

  if (!socket.connected) {
    socket.connect();
  }
};

/**
 * Disconnect the socket (e.g. on logout).
 */
export const disconnectSocket = () => {
  socket.disconnect();
};

// Listen for auth-related events to auto-manage connection
window.addEventListener('auth-error', () => disconnectSocket());
window.addEventListener('token-refresh', (event) => {
  socket.auth = { token: event.detail?.token };
});

export default socket;

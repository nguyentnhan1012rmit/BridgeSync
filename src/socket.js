import { io } from 'socket.io-client';

// In development, Vite proxies /socket.io to the backend server (port 3000).
// In production, the socket connects to the same origin.
const socket = io({
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 2000,
});

socket.on('connect', () => {
  console.log('[Socket.io] Connected:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('[Socket.io] Disconnected:', reason);
});

export default socket;

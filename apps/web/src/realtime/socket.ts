import { io } from 'socket.io-client';

const serverUrl = import.meta.env.VITE_SERVER_URL ?? (import.meta.env.DEV ? 'http://localhost:5174' : window.location.origin);
const socketPath = import.meta.env.VITE_SOCKET_PATH ?? '/socket.io';

export const socket = io(serverUrl, {
  path: socketPath,
  transports: ['websocket'],
  autoConnect: true
});

import { io } from 'socket.io-client';

const serverUrl = import.meta.env.VITE_SERVER_URL ?? (import.meta.env.PROD ? window.location.origin : 'http://localhost:5174');

export const socket = io(serverUrl, {
  transports: ['websocket'],
  autoConnect: true
});

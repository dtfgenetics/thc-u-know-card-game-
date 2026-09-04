import { io } from 'socket.io-client';

function defaultSocketPath(): string {
  const baseUrl = import.meta.env.BASE_URL || '/';
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return import.meta.env.PROD ? `${normalizedBase}socket.io` : '/socket.io';
}

const serverUrl = import.meta.env.VITE_SERVER_URL ?? (import.meta.env.PROD ? window.location.origin : 'http://localhost:5174');
const socketPath = import.meta.env.VITE_SOCKET_PATH ?? defaultSocketPath();

export const socket = io(serverUrl, {
  path: socketPath,
  transports: ['websocket', 'polling'],
  tryAllTransports: true,
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 500,
  reconnectionDelayMax: 5_000,
  randomizationFactor: 0.4,
  timeout: 10_000
});

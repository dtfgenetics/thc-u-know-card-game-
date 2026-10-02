import { io } from 'socket.io-client';

export const THC_U_KNOW_PROTOCOL_VERSION = 1;

function defaultSocketPath(): string {
  const baseUrl = import.meta.env.BASE_URL || '/';
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return import.meta.env.PROD ? `${normalizedBase}socket.io` : '/socket.io';
}

const serverUrl = import.meta.env.VITE_SERVER_URL ?? (import.meta.env.PROD ? window.location.origin : 'http://localhost:5174');
const socketPath = import.meta.env.VITE_SOCKET_PATH ?? defaultSocketPath();

export const socket = io(serverUrl, {
  path: socketPath,
  auth: { protocolVersion: THC_U_KNOW_PROTOCOL_VERSION },
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

import { Client } from '@stomp/stompjs';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error('VITE_API_BASE_URL is not defined');
}

function createWebSocketUrl() {
  const webSocketUrl = new URL('/ws', API_BASE_URL);
  webSocketUrl.protocol = webSocketUrl.protocol === 'https:' ? 'wss:' : 'ws:';

  return webSocketUrl.toString();
}

export function createStompClient() {
  return new Client({
    brokerURL: createWebSocketUrl(),
    reconnectDelay: 5000,
    connectionTimeout: 8000,
  });
}

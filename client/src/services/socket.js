import { io } from 'socket.io-client';

const URL = import.meta.env.VITE_API_URL || '';

const socket = io(URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 10
});

export default socket;

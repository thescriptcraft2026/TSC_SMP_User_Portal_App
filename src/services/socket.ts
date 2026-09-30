import { io } from 'socket.io-client';

export const socket = io('https://tscapi.accurateweb.in', {
  transports: ['websocket'],
  autoConnect: false,
});

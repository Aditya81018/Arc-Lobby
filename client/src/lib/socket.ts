import { io } from 'socket.io-client';
import { get } from 'svelte/store';
import { userData } from '../features/user/store';

export const socket = io('http://localhost:3000/', {
  autoConnect: false,
  auth: {
    data: get(userData)
  }
});

socket.on('connect', () => {
  userData.set({ ...get(userData), id: socket.id! });
});

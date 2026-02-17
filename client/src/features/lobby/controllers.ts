import request from '$lib/request';
import { get } from 'svelte/store';
import { userData } from '../user/store';
import type { Lobby } from './store';

export async function createLobby() {
  const lobby = await request<Lobby>('/lobbies/', 'POST');
  return lobby;
}

export async function joinLobby(lobbyId: string) {
  const success = await request<boolean>(`/lobbies/${lobbyId}/join`, 'POST', {
    userId: get(userData).id
  });
  return success;
}

export async function leaveLobby(lobbyId: string) {
  const success = await request<boolean>(`/lobbies/${lobbyId}/leave`, 'POST', {
    userId: get(userData).id
  });
  return success;
}

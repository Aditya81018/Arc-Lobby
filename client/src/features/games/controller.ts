import request from '$lib/request';
import { get } from 'svelte/store';
import type { Game } from './types';
import { gamesStore } from './store';

export async function getAllGames() {
	return await request<Record<string, Game>>('/games');
}

export function getLocalGameById(id: string): Game | null {
	return get(gamesStore)[id] || null;
}

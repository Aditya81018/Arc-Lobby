import request from '$lib/request';
import type { Game } from './types';

export async function getAllGames() {
	return await request<Record<string, Game>>('/games');
}

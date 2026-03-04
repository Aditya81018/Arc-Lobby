import request from '$lib/request';
import { get } from 'svelte/store';
import { gameSessionsStore, type GameSession } from './store';

export async function createGameSession(
	gameId: string,
	lobbyId: string,
	settings: Record<string, unknown>
): Promise<GameSession> {
	const gameSession = await request<GameSession>('/game-sessions', 'POST', {
		gameId,
		lobbyId,
		settings
	});
	return gameSession;
}

export async function getGameSessionById(id: string): Promise<GameSession | null> {
	const gameSession = await request<GameSession>(`/game-sessions/${id}`);
	return gameSession;
}

export function getLocalGameSessionById(id: string): GameSession | null {
	return get(gameSessionsStore).get(id) || null;
}

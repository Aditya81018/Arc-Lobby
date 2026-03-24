import request from '$lib/request';
import { get } from 'svelte/store';
import { gameSessionsStore, type GameSession } from './store';
import { userData } from '../user/store';

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

export function getLocalGameSessionById(id: string) {
	const gameSession = get(gameSessionsStore)[id];
	return gameSession;
}

export async function joinGameSession(gameSessionId: string): Promise<GameSession> {
	const playerId = get(userData).id;
	const gameSession = await request<GameSession>(`/game-sessions/${gameSessionId}/join`, 'POST', {
		playerId
	});
	// currentGameSessionStore.set(gameSession);
	return gameSession;
}

export async function leaveGameSession(gameSessionId: string): Promise<GameSession | undefined> {
	const playerId = get(userData).id;
	const gameSession = await request<GameSession>(`/game-sessions/${gameSessionId}/leave`, 'POST', {
		playerId
	});
	return gameSession;
}

export async function rematchGameSession(gameSessionId: string, playerId: string) {
	const gameSession = await request<GameSession>(
		`/game-sessions/${gameSessionId}/rematch`,
		'POST',
		{
			playerId
		}
	);
	return gameSession;
}

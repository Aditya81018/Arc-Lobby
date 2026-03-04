import request from '$lib/request';
import type { GameSession } from './store';

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

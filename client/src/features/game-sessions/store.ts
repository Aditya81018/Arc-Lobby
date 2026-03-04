import { writable } from 'svelte/store';
import { lobbyStore } from '../lobby/store';

export interface GameSession {
	id: string;
	gameId: string;
	lobbyId: string;
	players: string[];
	settings: Record<string, unknown>;
	data: unknown;
}

export const gameSessionsStore = writable<GameSession[]>([]);

lobbyStore.subscribe((lobby) => {
	if (!lobby) {
		gameSessionsStore.set([]);
		return;
	}
});

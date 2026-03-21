import { writable } from 'svelte/store';
import { lobbyStore } from '../lobby/store';
import type { UserData } from '../user/store';

export interface GameSession {
	id: string;
	gameId: string;
	lobbyId: string;
	players: (string | undefined)[];
	winner: string | undefined;
	settings: Record<string, unknown>;
	data: unknown;
	state: 'waiting' | 'ongoing' | 'finished';
}

export const gameSessionsStore = writable<Record<string, GameSession>>({});
export const currentGameSessionStore = writable<GameSession | null>(null);
export const currentGameSessionPlayersStore = writable<(UserData | undefined)[] | null>(null);

lobbyStore.subscribe((lobby) => {
	if (!lobby) {
		gameSessionsStore.set({});
		return;
	}
});

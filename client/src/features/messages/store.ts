import { socket } from '$lib/socket';
import { get, writable } from 'svelte/store';
import { lobbyStore } from '../lobby/store';
import { gameSessionsStore } from '../game-sessions/store';
import { getGameSessionById } from '../game-sessions/controller';

export interface Message {
	id: string;
	roomId: string;
	senderId: string;
	type: 'text' | 'game-session-invite';
	content: unknown;
	timestamp: number;
}

export const lobbyMessagesStore = writable<Message[]>([]);

socket.on('new-message', async (message: Message) => {
	if (message.roomId === get(lobbyStore)!.id) {
		if (message.type === 'game-session-invite') {
			const gameSession = await getGameSessionById(message.content as string);
			if (gameSession) {
				gameSessionsStore.update((session) => ({ ...session, [gameSession.id]: gameSession }));
			}
		}
		lobbyMessagesStore.update((messages) => [...messages, message]);
	}
});
lobbyStore.subscribe((lobby) => {
	if (!lobby) {
		lobbyMessagesStore.set([]);
	}
});

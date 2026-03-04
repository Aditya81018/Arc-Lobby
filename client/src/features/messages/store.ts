import { socket } from '$lib/socket';
import { get, writable } from 'svelte/store';
import { lobbyStore } from '../lobby/store';

export interface Message {
	id: string;
	roomId: string;
	senderId: string;
	type: 'text' | 'game-session-invite';
	content: unknown;
	timestamp: number;
}

export const lobbyMessagesStore = writable<Message[]>([]);

socket.on('new-message', (message: Message) => {
	if (message.roomId === get(lobbyStore)!.id) {
		lobbyMessagesStore.update((messages) => [...messages, message]);
	}
});
lobbyStore.subscribe((lobby) => {
	if (!lobby) {
		lobbyMessagesStore.set([]);
	}
});

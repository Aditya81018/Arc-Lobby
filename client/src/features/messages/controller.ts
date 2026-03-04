import { uuid } from '$lib/helpers';
import { socket } from '$lib/socket';
import type { Message } from './store';

export function sendTextMessage(roomId: string, senderId: string, content: string) {
	const message: Message = {
		id: uuid(),
		roomId,
		senderId,
		type: 'text',
		content,
		timestamp: Date.now()
	};
	socket.emit('send-message', message);
}

export function sendGameSessionInvite(roomId: string, senderId: string, gameSessionId: string) {
	const message: Message = {
		id: uuid(),
		roomId,
		senderId,
		type: 'game-session-invite',
		content: gameSessionId,
		timestamp: Date.now()
	};
	socket.emit('send-message', message);
}

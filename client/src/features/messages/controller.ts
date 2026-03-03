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

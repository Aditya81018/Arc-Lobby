import type { GameSession } from '../../game-sessions/store';

interface SimpleGamePlayer {
	id: number; // index of the player in the session.players array
	lives: number;
	points: number;
}

interface SimpleGameData {
	target: number;
	options: [number, number, number];
	message: string;
	turnOf: number;
	playersData: SimpleGamePlayer[];
}

export interface SimpleGameSession extends GameSession {
	data: SimpleGameData;
}

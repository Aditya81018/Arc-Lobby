import type { GameSession } from '../../game-sessions/store';

export interface SimpleGamePlayer {
	id: number; // index of the player in the session.players array
	lives: number;
	points: number;
}

export interface SimpleGameData {
	target: number;
	options: [number, number, number];
	message: string;
	turnOf: number;
	playersData: SimpleGamePlayer[];
	nextTimestamp: number | undefined;
	timerId: NodeJS.Timeout | undefined;
}
export interface SimpleGameSession extends GameSession {
	data: SimpleGameData;
}

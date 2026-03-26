import type { GameSession } from '../../game-sessions/store';

export interface TicTacToePlayer {
	id: number;
	token: 'O' | 'X';
	// At what pos player placed it's token
	moves: number[];
}

export interface TicTacToeData {
	turnOf: number;
	playersData: [TicTacToePlayer, TicTacToePlayer];
	nextTimestamp: number;
}

export interface TicTacToeSession extends GameSession {
	data: TicTacToeData;
}

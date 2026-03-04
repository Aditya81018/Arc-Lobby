import { getAllGames } from '../features/games/controller';
import { gamesStore } from '../features/games/store';

export async function loadInitialDataFromServer() {
	const games = await getAllGames();
	gamesStore.set(games);
}

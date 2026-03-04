import simpleGame from "./simple-game";
import { Game } from "./types";

const GAMES: Record<string, Game> = {
  "simple-game": simpleGame,
};

export default GAMES;

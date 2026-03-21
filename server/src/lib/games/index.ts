import { GameSession } from "../../features/game-sessions";
import simpleGame from "./simple-game";
import { Game } from "./types";

const GAMES: Record<string, Game<any>> = {
  "simple-game": simpleGame,
};

export default GAMES;

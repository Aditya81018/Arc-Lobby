import { GameSession } from "../../features/game-sessions";
import simpleGame from "./simple-game";
import ticTacToe from "./tic-tac-toe";
import { Game } from "./types";

const GAMES: Record<string, Game<any>> = {
  "simple-game": simpleGame,
  "tic-tac-toe": ticTacToe,
};

export default GAMES;

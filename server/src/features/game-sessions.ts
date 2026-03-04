import { Router } from "express";
import GAMES from "../lib/games";

export interface GameSession {
  id: string;
  gameId: string;
  lobbyId: string;
  players: string[];
  settings: Record<string, unknown>;
  data: unknown;
}

const gameSessions = new Map<string, GameSession>();

export function getAllGameSessions() {
  return Object.fromEntries(gameSessions);
}

export function getGameSessionById(sessionId: string) {
  return gameSessions.get(sessionId);
}

export function createGameSession<T>(
  gameId: string,
  lobbyId: string,
  settings: Record<string, unknown>,
  data: T,
): GameSession {
  const sessionId = crypto.randomUUID();
  const newSession: GameSession = {
    id: sessionId,
    gameId,
    lobbyId,
    players: [],
    settings,
    data,
  };
  gameSessions.set(sessionId, newSession);
  return newSession;
}

export function updateGameSession(
  sessionId: string,
  updates: Partial<Pick<GameSession, "players" | "data">>,
) {
  const session = gameSessions.get(sessionId);
  if (session) {
    gameSessions.set(sessionId, { ...session, ...updates });
  }
  return gameSessions.get(sessionId);
}

export function deleteGameSession(sessionId: string) {
  return gameSessions.delete(sessionId);
}

// Router

const gameSessionsRouter = Router();

gameSessionsRouter.get("/", (req, res) => {
  res.json(getAllGameSessions());
});

gameSessionsRouter.get("/:id", (req, res) => {
  const session = getGameSessionById(req.params.id);
  if (!session) {
    res.status(404).json({ error: "Game session not found" });
    return;
  }
  res.json(session);
});

gameSessionsRouter.post("/", (req, res) => {
  const { gameId, lobbyId, settings } = req.body;
  if (!gameId || !lobbyId) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }
  const defaultData = GAMES[gameId]?.getDefaultData(settings) || {};
  const newSession = createGameSession(gameId, lobbyId, settings || {}, defaultData);
  res.status(201).json(newSession);
});

export default gameSessionsRouter;

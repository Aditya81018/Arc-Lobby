import { Router } from "express";
import GAMES from "../lib/games";
import { getUserById } from "./users";
import { Socket } from "socket.io";
import { io } from "..";

export interface GameSession {
  id: string;
  gameId: string;
  lobbyId: string;
  players: string[];
  settings: Record<string, unknown>;
  data: unknown;
  state: "waiting" | "ongoing" | "finished";
}

const gameSessions = new Map<string, GameSession>();
const userToGameSession = new Map<string, string>();

// Controllers

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
    state: "waiting",
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

export function addPlayerToSession(sessionId: string, playerId: string) {
  const session = gameSessions.get(sessionId);
  let isPlayerAdded = false;
  if (session && !session.players.includes(playerId)) {
    const game = GAMES[session.gameId];
    if (game.isJoinable(session)) {
      session.players.push(playerId);
      gameSessions.set(sessionId, session);
      userToGameSession.set(playerId, sessionId);
      isPlayerAdded = true;
    }
  }
  return isPlayerAdded;
}

export function removePlayerFromSession(sessionId: string, playerId: string) {
  const session = gameSessions.get(sessionId);
  if (session) {
    session.players = session.players.filter((id) => id !== playerId);
    gameSessions.set(sessionId, session);
    userToGameSession.delete(playerId);
    if (session.players.length === 0) {
      session.state = "finished";
      io.to(session.lobbyId).emit("game-session-update", session);
      deleteGameSession(sessionId);
    }
  }
  return session;
}

export function getGameSessionOfUser(userId: string) {
  const sessionId = userToGameSession.get(userId);
  if (!sessionId) return;

  const session = getGameSessionById(sessionId);
  return session;
}

export function getGameSessionPlayersData(sessionId: string) {
  const session = gameSessions.get(sessionId);
  if (!session) {
    return null;
  }
  const playerData = session.players.map((playerId) => getUserById(playerId));
  return playerData;
}

export function initGameSessionSockets(socket: Socket) {
  socket.on("join-game-session", (sessionId: string) => {
    const session = getGameSessionById(sessionId);
    if (session) {
      socket.join(sessionId);
    }
  });

  socket.on("leave-game-session", (sessionId: string) => {
    socket.leave(sessionId);
  });
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

gameSessionsRouter.post("/:id/join", (req, res) => {
  const { playerId } = req.body;
  const gameSessionId = req.params.id;
  if (!playerId) {
    res.status(400).json({ error: "Missing playerId" });
    return;
  }
  const success = addPlayerToSession(req.params.id, playerId);
  if (!success) {
    res.status(404).json({ error: "Failed to join session" });
    return;
  }
  const session = getGameSessionById(gameSessionId)!;
  io.to(session.id).emit("players-update", session.players);

  GAMES[session.gameId]?.onPlayerJoin(session, playerId);

  res.json(session);
});

gameSessionsRouter.post("/:id/leave", (req, res) => {
  const { playerId } = req.body;
  if (!playerId) {
    res.status(400).json({ error: "Missing playerId" });
    return;
  }
  const session = removePlayerFromSession(req.params.id, playerId);
  if (!session) {
    res.status(404).json({ error: "Game session not found" });
    return;
  }
  io.to(session.id).emit("players-update", session.players);
  res.json(session);
});

gameSessionsRouter.get("/:id/players", (req, res) => {
  const playerData = getGameSessionPlayersData(req.params.id);
  if (playerData === null) {
    res.status(404).json({ error: "Game session not found" });
    return;
  }
  res.json(playerData);
});

export default gameSessionsRouter;

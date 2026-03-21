import { Router } from "express";
import GAMES from "../lib/games";
import { getUserById } from "./users";
import { Socket } from "socket.io";
import { io } from "..";

export interface GameSession {
  id: string;
  gameId: string;
  lobbyId: string;
  players: (string | undefined)[];
  spectators: string[];
  winner: string | undefined; // Winner Player ID
  settings: Record<string, unknown>;
  data: any;
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

export function createGameSession(
  gameId: string,
  lobbyId: string,
  settings: Record<string, unknown>,
): GameSession {
  let sessionId = "";
  do {
    sessionId = crypto.randomUUID().substring(0, 6).toUpperCase();
  } while (getGameSessionById(sessionId) !== undefined);

  const newSession: GameSession = GAMES[gameId].createGameSession(sessionId, lobbyId, settings);

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
  if (!session) return;

  if (session.state === "waiting") {
    session.players = session.players.filter((id) => id !== playerId);
    userToGameSession.delete(playerId);
  }

  if (session.state === "ongoing") {
    const index = session.players.indexOf(playerId);
    session.players[index] = undefined;
  }

  GAMES[session.gameId].onPlayerLeave(session, playerId);

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
  const playerData = session.players.map((playerId) =>
    playerId ? getUserById(playerId) : undefined,
  );
  return playerData;
}

export function initGameSessionSockets(socket: Socket) {
  let removeGameSockets: (() => void) | null = null;
  socket.on("join-game-session", (sessionId: string) => {
    const session = getGameSessionById(sessionId);
    if (session) {
      socket.join(sessionId);
      session.spectators.push(socket.id);
      removeGameSockets = GAMES[session.gameId].initSockets(session, socket);
    }
  });

  socket.on("leave-game-session", (sessionId: string) => {
    socket.leave(sessionId);
    const session = getGameSessionById(sessionId);
    if (session) {
      session.spectators = session.spectators.filter((spectator) => spectator !== socket.id);
      if (session.spectators.length === 0) {
        session.state = "finished";
        io.to(session.lobbyId).emit("game-session-update", session);
        deleteGameSession(sessionId);
      }
    }
    if (removeGameSockets) removeGameSockets();
  });
}

// Router

const gameSessionsRouter = Router();

gameSessionsRouter.get("/", (req, res) => {
  res.json(getAllGameSessions());
});

gameSessionsRouter.get("/:id", (req, res) => {
  const session = getGameSessionById(req.params.id);
  res.json(session);
});

gameSessionsRouter.post("/", (req, res) => {
  const { gameId, lobbyId, settings } = req.body;
  const newSession = createGameSession(gameId, lobbyId, settings || {});
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
  const session = removePlayerFromSession(req.params.id, playerId)!;
  io.to(session.id).emit("players-update", session.players);
  res.json(session);
});

gameSessionsRouter.get("/:id/players", (req, res) => {
  const playerData = getGameSessionPlayersData(req.params.id);
  res.json(playerData);
});

export default gameSessionsRouter;

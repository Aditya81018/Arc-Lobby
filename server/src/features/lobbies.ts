import { Router } from "express";

export interface Lobby {
  id: string;
  members: string[];
}

const lobbies = new Map<string, Lobby>();

// Controllers
export function getAllLobbies() {
  return Object.fromEntries(lobbies);
}

export function getLobbyById(lobbyId: string) {
  return lobbies.get(lobbyId);
}

export function createLobby() {
  let lobbyId = "";
  do {
    lobbyId = crypto.randomUUID().substring(0, 6).toUpperCase();
  } while (getLobbyById(lobbyId) !== undefined);
  const newLobby: Lobby = { id: lobbyId, members: [] };
  lobbies.set(lobbyId, newLobby);
  return newLobby;
}

export function updateLobby(lobbyId: string, data: Partial<Lobby>) {
  const lobby = getLobbyById(lobbyId);
  if (!lobby) return;
  const updatedLobby = Object.assign(lobby, data);
  lobbies.set(lobbyId, updatedLobby);
  return updatedLobby;
}

export function deleteLobby(lobbyId: string) {
  return lobbies.delete(lobbyId);
}

export function joinLobby(lobbyId: string, userId: string) {
  const lobby = getLobbyById(lobbyId);
  if (!lobby) return false;
  if (lobby.members.includes(userId)) return false;

  updateLobby(lobbyId, { members: [...lobby?.members, userId] });
  return true;
}

export function leaveLobby(lobbyId: string, userId: string) {
  const lobby = getLobbyById(lobbyId);
  if (!lobby) return false;

  const index = lobby.members.indexOf(userId);
  if (index === -1) return false;

  lobby.members.splice(index, 1);
  if (lobby.members.length === 0) deleteLobby(lobbyId);
  return true;
}

// Routes
export const lobbiesRouter = Router();

lobbiesRouter.get("/", (_req, res) => {
  res.json(getAllLobbies());
});

lobbiesRouter.post("/", (_req, res) => {
  const newLobby = createLobby();
  res.json(newLobby);
});

lobbiesRouter.post("/:id/join", (req, res) => {
  const { id: lobbyId } = req.params;
  const { userId } = req.body;

  const success = joinLobby(lobbyId, userId);
  res.json(success);
});

lobbiesRouter.post("/:id/leave", (req, res) => {
  const { id: lobbyId } = req.params;
  const { userId } = req.body;

  const success = leaveLobby(lobbyId, userId);
  res.json(success);
});

import { Router } from "express";
import GAMES from ".";

export const gamesRouter = Router();

gamesRouter.get("/", (req, res) => {
  res.json(GAMES);
});

gamesRouter.get("/:id", (req, res) => {
  const game = GAMES[req.params.id];
  if (!game) {
    res.status(404).json({ error: "Game not found" });
    return;
  }
  res.json(game);
});

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { initSocket } from "./lib/sockets";
import { usersRouter } from "./features/users";
import cors from "cors";
import { lobbiesRouter } from "./features/lobbies";
import { gamesRouter } from "./lib/games/router";
import gameSessionsRouter from "./features/game-sessions";

export const app = express();
export const httpServer = createServer(app);
export const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

app.use(express.json());
app.use(
  cors({
    origin: "*",
  }),
);
app.use("/assets", express.static("public/assets"));

app.get("/", (_req, res) => {
  res.send("Server running 🚀");
});

// Routers
app.use("/users", usersRouter);
app.use("/lobbies", lobbiesRouter);
app.use("/games", gamesRouter);
app.use("/game-sessions", gameSessionsRouter);

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  initSocket(socket);
});

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});

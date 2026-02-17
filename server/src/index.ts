import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { initSocket } from "./lib/sockets";
import { usersRouter } from "./features/users";
import cors from "cors";
import { lobbiesRouter } from "./features/lobbies";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
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

app.get("/", (_req, res) => {
  res.send("Server running 🚀");
});

// Routers
app.use("/users", usersRouter);
app.use("/lobbies", lobbiesRouter);

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  initSocket(socket);
});

const PORT = 3000;

httpServer.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});

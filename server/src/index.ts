import express, { urlencoded } from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { initSocket } from "./lib/sockets";
import { getAllUser, userRouter } from "./features/users";
import cors from "cors";

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

app.use(userRouter);

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  initSocket(socket);
});

const PORT = 3000;

httpServer.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});

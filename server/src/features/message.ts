import { Socket } from "socket.io";
import { io } from "..";

export interface Message {
  id: string;
  roomId: string;
  senderId: string;
  type: "text" | "game-session-invite";
  content: unknown;
  timestamp: number;
}

export function sendMessage(roomId: string, message: Message) {
  io.to(roomId).emit("new-message", message);
}

export function initMessageSockets(socket: Socket) {
  socket.on("send-message", (message: Message) => {
    sendMessage(message.roomId, message);
  });
}

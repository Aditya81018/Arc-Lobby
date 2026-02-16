import { Socket } from "socket.io";
import { createUser, deleteUser, updateUser, UserData } from "../features/users";

export function initSocket(socket: Socket) {
  const id = socket.id;
  const data = socket.handshake.auth.data as UserData;

  createUser(id, data);

  socket.on("disconnect", () => {
    deleteUser(id);
    console.log("Client disconnected:", socket.id);
  });
}

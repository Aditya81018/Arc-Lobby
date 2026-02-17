import { Router } from "express";

export interface UserData {
  id: string;
  name: string;
}

const users = new Map<string, UserData>();

// Controllers
export function getAllUser() {
  return Object.fromEntries(users);
}

export function getUserById(id: string) {
  return users.get(id);
}

export function createUser(id: string, data: Omit<UserData, "id">) {
  const newUser: UserData = {
    id,
    ...data,
  };
  users.set(id, newUser);
  return newUser;
}

export function updateUser(id: string, newData: Partial<Omit<UserData, "id">>) {
  const oldData = users.get(id);
  if (!oldData) return undefined;

  const updatedData = Object.assign(oldData, newData);
  users.set(id, updatedData);
  return updatedData;
}

export function deleteUser(id: string) {
  return users.delete(id);
}

// Routes
export const usersRouter = Router();

usersRouter.get("/", (_req, res) => {
  res.json(getAllUser());
});

usersRouter.put("/:id/", (req, _res) => {
  const { id } = req.params;
  const data = req.body;
  updateUser(id, data);
});

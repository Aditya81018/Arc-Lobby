import { Socket } from "socket.io";
import { GameSession } from "../../features/game-sessions";

export interface Game {
  id: string;
  name: string;
  image: string;
  settings: GameSetting[];
  getDefaultData(settings: Record<string, any>): unknown;
  isJoinable: (session: GameSession) => boolean;
  onPlayerJoin: (session: GameSession, playerId: string) => void;

  // Will return a function to be called after player leaves, usually to remove socket listeners
  initSockets: (session: GameSession, socket: Socket) => () => void;
}

export interface BaseGameSetting<T> {
  id: string;
  name: string;
  type: "pick-one" | "pick-many" | "boolean";
  defaultValue: T;
}

export interface PickOneGameSetting<T> extends BaseGameSetting<T> {
  type: "pick-one";
  options: {
    name: string;
    value: T;
  }[];
}

export interface PickManyGameSetting<T> extends BaseGameSetting<T[]> {
  type: "pick-many";
  options: {
    name: string;
    value: T;
  }[];
}

export interface BooleanGameSetting extends BaseGameSetting<boolean> {
  type: "boolean";
}

export type GameSetting<T = unknown> =
  | PickOneGameSetting<T>
  | PickManyGameSetting<T>
  | BooleanGameSetting;

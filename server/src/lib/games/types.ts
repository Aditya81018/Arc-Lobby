import { Socket } from "socket.io";
import { GameSession } from "../../features/game-sessions";

export interface Game<TSession extends GameSession = GameSession> {
  id: string;
  name: string;
  image: string;
  settings: GameSetting[];

  createGameSession: (id: string, lobbyId: string, settings: ProcessedSettings) => TSession;
  getDefaultData(settings: ProcessedSettings): TSession["data"];
  isJoinable: (session: TSession) => boolean;
  onPlayerJoin: (session: TSession, playerId: string) => void;
  onPlayerLeave: (session: TSession, playerId: string) => void;

  // Will return a function to be called after player leaves, usually to remove socket listeners
  initSockets: (session: TSession, socket: Socket) => () => void;
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

export type ProcessedSettings = Record<string, any>;

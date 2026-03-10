import { settings } from "cluster";
import { publicLinkTo } from "../helpers";
import { Game, GameSetting } from "./types";
import { io } from "../..";

const simpleGame: Game = {
  id: "simple-game",
  name: "Simple Game",
  image: publicLinkTo("/assets/simple-game-image.avif"),
  settings: [
    {
      id: "players-count",
      name: "Number of Players",
      type: "pick-one",
      defaultValue: 2,
      options: [
        { name: "2", value: 2 },
        { name: "3", value: 3 },
        { name: "4", value: 4 },
      ],
    } as GameSetting<number>,
    {
      id: "target",
      name: "Target",
      type: "pick-one",
      defaultValue: 3,
      options: [
        { name: "1", value: 1 },
        { name: "3", value: 3 },
        { name: "5", value: 5 },
      ],
    } as GameSetting<number>,
    {
      id: "lives",
      name: "Lives",
      type: "pick-one",
      defaultValue: 1,
      options: [
        { name: "1", value: 1 },
        { name: "3", value: 3 },
        { name: "5", value: 5 },
      ],
    } as GameSetting<number>,
  ],
  getDefaultData(settings) {
    return null;
  },
  isJoinable(session) {
    const isSessionWaiting = session.state === "waiting";
    const hasSpaceForPlayers =
      session.players.length < (session.settings?.["players-count"] as number);
    return isSessionWaiting && hasSpaceForPlayers;
  },
  onPlayerJoin(session, playerId) {
    if (session.players.length === session.settings["players-count"]) {
      session.state = "ongoing";
      io.to(session.lobbyId).emit("game-session-update", session);
    }
  },
};

export default simpleGame;

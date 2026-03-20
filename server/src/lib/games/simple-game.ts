import { publicLinkTo, randInt } from "../helpers";
import { Game, GameSetting } from "./types";
import { io } from "../..";
import { getUserById } from "../../features/users";
import { getRandomValues } from "node:crypto";
import { GameSession } from "../../features/game-sessions";
import GAMES from ".";

interface SimpleGamePlayer {
  id: number; // index of the player in the session.players array
  lives: number;
  points: number;
}
interface SimpleGameData {
  target: number;
  options: [number, number, number];
  message: string;
  turnOf: number;
  playersData: SimpleGamePlayer[];
}

interface SimpleGameSession extends GameSession {
  data: SimpleGameData;
}

interface SimpleGame extends Game {
  getRandomData: () => Pick<SimpleGameData, "target" | "options">;
}

const simpleGame: SimpleGame = {
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

  getRandomData() {
    const target = randInt(1, 100);

    let options;
    do {
      options = [randInt(1, 100), randInt(1, 100), randInt(1, 100)] as [number, number, number];
    } while (options[0] === options[1] || options[1] === options[2] || options[2] === options[0]);

    return { target, options };
  },

  getDefaultData(settings): SimpleGameData {
    const playersData: SimpleGamePlayer[] = [];

    for (let i = 0; i < settings["players-count"]; i++) {
      playersData.push({
        id: i,
        lives: settings["lives"],
        points: 0,
      });
    }

    return {
      ...this.getRandomData(),
      message: "",
      turnOf: 0,
      playersData,
    };
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

  initSockets(session: SimpleGameSession, socket) {
    socket.on("option-select", onOptionSelect);
    function onOptionSelect(option: number) {
      const player = getUserById(socket.id)!;
      const playerDataID = session.players.indexOf(player.id);
      const playerData = session.data.playersData[playerDataID];

      session.data.message = `${player.name} selected ${option}`;
      session.data.turnOf = (session.data.turnOf + 1) % session.players.length;

      let closestOpt = session.data.options[0],
        farthestOpt = session.data.options[0];
      for (const option of session.data.options) {
        const target = session.data.target;
        if (Math.abs(target - option) < Math.abs(target - closestOpt)) closestOpt = option;
        if (Math.abs(target - option) > Math.abs(target - farthestOpt)) farthestOpt = option;
      }

      if (option === closestOpt) playerData.points++;
      else if (option === farthestOpt) playerData.lives--;

      const game = GAMES[session.gameId] as SimpleGame;
      const randomData = game.getRandomData();
      session.data.target = randomData.target;
      session.data.options = randomData.options;

      io.to(session.id).emit("session-data-update", session.data);
    }

    return () => {
      socket.off("option-select", onOptionSelect);
    };
  },
};

export default simpleGame;

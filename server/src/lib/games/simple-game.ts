import { publicLinkTo, randInt } from "../helpers";
import { Game, GameSetting } from "./types";
import { io } from "../..";
import { getUserById } from "../../features/users";
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
  nextTurn: () => void;
}

interface SimpleGame extends Game<SimpleGameSession> {
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

  createGameSession(id, lobbyId, settings): SimpleGameSession {
    return {
      id,
      gameId: this.id,
      lobbyId,
      players: [],
      winner: undefined,
      settings,
      data: this.getDefaultData(settings),
      state: "waiting",
      nextTurn() {
        let playerId, playerData;
        do {
          this.data.turnOf = (this.data.turnOf + 1) % this.players.length;
          playerId = this.players[this.data.turnOf];
          playerData = this.data.playersData[this.data.turnOf];
        } while (
          // while we couldn't find a player who
          !(
            playerId !== undefined && // haven't left the game and
            playerData.lives > 0 // still have lives to play with
          )
        );
      },
    };
  },

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

  onPlayerLeave(session, playerId) {
    if (session.state === "ongoing") {
      const turnOfPlayer = session.players[session.data.turnOf];
      if (turnOfPlayer === undefined) {
        session.nextTurn();
        io.to(session.id).emit("session-data-update", session.data);
      }
      const activePlayers = session.players.filter((player) => player !== undefined);
      if (activePlayers.length === 1) {
        session.state = "finished";
        session.winner = activePlayers[0];
        io.to(session.lobbyId).emit("game-session-update", session);
      }
    }
  },

  initSockets(session, socket) {
    const game = this;
    socket.on("option-select", onOptionSelect);
    function onOptionSelect(option: number) {
      const player = getUserById(socket.id)!;
      const playerDataID = session.players.indexOf(player.id);
      const playerData = session.data.playersData[playerDataID];

      session.data.message = `${player.name} selected ${option}`;
      session.nextTurn();

      let closestOpt = session.data.options[0],
        farthestOpt = session.data.options[0];
      for (const option of session.data.options) {
        const target = session.data.target;
        if (Math.abs(target - option) < Math.abs(target - closestOpt)) closestOpt = option;
        if (Math.abs(target - option) > Math.abs(target - farthestOpt)) farthestOpt = option;
      }

      if (option === closestOpt) {
        playerData.points++;
        if (playerData.points === session.settings["target"]) {
          session.winner = player.id;
          session.state = "finished";
          io.to(session.lobbyId).emit("game-session-update", session);
        }
      } else if (option === farthestOpt) {
        playerData.lives--;
        const playersStillPlaying = session.data.playersData.filter((player) => player.lives > 0);
        if (playersStillPlaying.length === 1) {
          session.winner = session.players[playersStillPlaying[0].id];
          session.state = "finished";
          io.to(session.lobbyId).emit("game-session-update", session);
        }
      }

      if (session.state === "ongoing") {
        const randomData = game.getRandomData();
        session.data.target = randomData.target;
        session.data.options = randomData.options;
      }

      io.to(session.id).emit("session-data-update", session.data);
    }

    return () => {
      socket.off("option-select", onOptionSelect);
    };
  },
};

export default simpleGame;

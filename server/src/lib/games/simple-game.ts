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
  nextTimestamp: number | undefined;
}

interface SimpleGamePrivateData {
  timerId: NodeJS.Timeout | undefined;
}

interface SimpleGameSession extends GameSession {
  data: SimpleGameData;
  nextTurn: () => void;
  onOptionSelect: (option: number) => void;
  onTimeRunOut: () => void;
}

interface SimpleGame extends Game<SimpleGameSession> {
  getRandomData: () => Pick<SimpleGameData, "target" | "options">;
}

const TURN_INTERVAL = 10 * 1000; // seconds * 1000

const privateData: Record<string, SimpleGamePrivateData> = {};

const simpleGame: SimpleGame = {
  id: "simple-game",
  name: "Simple Game",
  image: publicLinkTo("/assets/simple-game-image.avif"),
  settings: {
    "players-count": {
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
    target: {
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
    lives: {
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
  },

  createGameSession(id, lobbyId, settings): SimpleGameSession {
    privateData[id] = {
      timerId: undefined,
    };
    const newSession: SimpleGameSession = {
      id,
      gameId: this.id,
      lobbyId,
      players: [],
      winner: undefined,
      spectators: [],
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
      onOptionSelect(option: number) {
        clearTimeout(privateData[this.id].timerId);

        const player = getUserById(this.players[this.data.turnOf]!)!;
        const playerData = this.data.playersData[this.data.turnOf];
        const game = GAMES[this.gameId] as SimpleGame;

        this.data.message = `${player.name} selected ${option}`;

        let closestOpt = this.data.options[0],
          farthestOpt = this.data.options[0];
        for (const option of this.data.options) {
          const target = this.data.target;
          if (Math.abs(target - option) < Math.abs(target - closestOpt)) closestOpt = option;
          if (Math.abs(target - option) > Math.abs(target - farthestOpt)) farthestOpt = option;
        }

        if (option === closestOpt) {
          playerData.points++;
          if (playerData.points === this.settings["target"]) {
            this.winner = player.id;
            this.state = "finished";
            io.to(this.lobbyId).emit("game-session-update", this);
          }
        } else if (option === farthestOpt) {
          playerData.lives--;
          const playersStillPlaying = this.data.playersData.filter((player) => player.lives > 0);
          if (playersStillPlaying.length === 1) {
            this.winner = this.players[playersStillPlaying[0].id];
            this.state = "finished";
            io.to(this.lobbyId).emit("game-session-update", this);
          }
        }

        if (this.state === "ongoing") {
          const randomData = game.getRandomData();
          this.data.target = randomData.target;
          this.data.options = randomData.options;
          this.data.nextTimestamp = Date.now() + TURN_INTERVAL;
          privateData[this.id].timerId = setTimeout(() => this.onTimeRunOut(), TURN_INTERVAL + 250);
          this.nextTurn();
        }

        io.to(this.id).emit("session-data-update", this.data);
      },
      onTimeRunOut() {
        const player = getUserById(this.players[this.data.turnOf]!)!;
        const playerData = this.data.playersData[this.data.turnOf];
        const game = GAMES[this.gameId] as SimpleGame;

        this.data.message = `${player.name} timed out!`;

        playerData.lives--;

        const playersStillPlaying = this.data.playersData.filter((player) => player.lives > 0);
        if (playersStillPlaying.length === 1) {
          this.winner = this.players[playersStillPlaying[0].id];
          this.state = "finished";
          io.to(this.lobbyId).emit("game-session-update", this);
        }

        if (this.state === "ongoing") {
          const randomData = game.getRandomData();
          this.data.target = randomData.target;
          this.data.options = randomData.options;
          this.data.nextTimestamp = Date.now() + TURN_INTERVAL;
          privateData[this.id].timerId = setTimeout(() => this.onTimeRunOut(), TURN_INTERVAL + 250);
          this.nextTurn();
        }

        io.to(this.id).emit("session-data-update", this.data);
      },
    };
    return newSession;
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
      message: "Waiting for players...",
      turnOf: 0,
      playersData,
      nextTimestamp: undefined,
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
      session.data.message = "Game Started!";
      session.data.nextTimestamp = Date.now() + TURN_INTERVAL;
      privateData[session.id].timerId = setTimeout(
        () => session.onTimeRunOut(),
        TURN_INTERVAL + 250,
      );
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

  onSessionEnd(session: SimpleGameSession) {
    delete privateData[session.id];
  },

  initSockets(session, socket) {
    function handleOptionSelect(option: number) {
      session.onOptionSelect(option);
    }

    socket.on("option-select", handleOptionSelect);

    return () => {
      socket.off("option-select", handleOptionSelect);
    };
  },
};

export default simpleGame;

import { Socket } from "socket.io";
import { GameSession } from "../../../features/game-sessions";
import { Game, ProcessedSettings } from "../types";
import { publicLinkTo } from "../../helpers";
import { io } from "../../..";

const ANIMATION_INTERVAL = 1 * 1000; // SEC * 1000
const TURN_INTERVAL = 10 * 1000; // SEC * 1000

// Pos are like this
// 0 | 1 | 2
// 3 | 4 | 5
// 6 | 7 | 8

interface TicTacToePlayer {
  id: number;
  token: "O" | "X";
  // At what pos player placed it's token
  moves: number[];
}

interface TicTacToeData {
  turnOf: number;
  playersData: [TicTacToePlayer, TicTacToePlayer];
  nextTimestamp: number;
}

interface TicTacToeSession extends GameSession {
  data: TicTacToeData;
  onTimeRunOut: () => void;
  resetTimer: () => void;
  handlePlaceToken: (position: number) => void;
  hasPlayerWon: (moves: number[]) => boolean;
}

interface TicTacToe extends Game<TicTacToeSession> {}

interface TicTacToePrivateData {
  timerId: NodeJS.Timeout | undefined;
}

const privateData = new Map<string, TicTacToePrivateData>();

const ticTacToe: TicTacToe = {
  id: "tic-tac-toe",
  name: "Tic Tac Toe",
  image: publicLinkTo("/assets/tic-tac-toe-image.png"),
  settings: {
    "is-moving": {
      id: "is-moving",
      name: "Moving Pieces",
      type: "boolean",
      defaultValue: false,
    },
  },
  createGameSession: function (id: string, lobbyId: string, settings: ProcessedSettings) {
    privateData.set(id, { timerId: undefined });

    const newGameSession: TicTacToeSession = {
      id,
      gameId: "tic-tac-toe",
      lobbyId,
      players: [],
      spectators: [],
      winner: undefined,
      settings,
      data: this.getDefaultData(settings),
      state: "waiting",
      onTimeRunOut() {
        if (this.state !== "ongoing") return;

        this.winner = this.players[this.data.turnOf === 0 ? 1 : 0];
        this.state = "finished";
        io.to(this.lobbyId).emit("game-session-update", this);
      },

      resetTimer() {
        this.data.nextTimestamp = Date.now() + TURN_INTERVAL;
        privateData.set(this.id, {
          timerId: setTimeout(() => this.onTimeRunOut(), TURN_INTERVAL),
        });
      },

      handlePlaceToken(position) {
        // if game isn't ongoing then exit
        if (this.state !== "ongoing") return;

        // if position is already taken then exit
        if (
          this.data.playersData[0].moves.includes(position) ||
          this.data.playersData[1].moves.includes(position)
        )
          return;

        // end previous timer
        const prevTimer = privateData.get(this.id)?.timerId;
        if (prevTimer) clearTimeout(prevTimer);

        const playerData = this.data.playersData[this.data.turnOf];
        playerData.moves.push(position);

        // removing oldest tokens and keep only 3
        if (this.settings["is-moving"] && playerData.moves.length > 3) {
          playerData.moves.splice(0, 1);
        }

        // if player has won
        if (this.hasPlayerWon(playerData.moves)) {
          this.winner = this.players[playerData.id];
          this.state = "finished";
          io.to(this.lobbyId).emit("game-session-update", this);
        }
        // else if board is filled
        else if (
          this.data.playersData[0].moves.length + this.data.playersData[1].moves.length ===
          9
        ) {
          this.winner = "draw";
          this.state = "finished";
          io.to(this.lobbyId).emit("game-session-update", this);
        }

        // move forward in game if game is still ongoing
        if (this.state === "ongoing") {
          this.data.turnOf = this.data.turnOf === 0 ? 1 : 0;
          this.resetTimer();
        }

        io.to(this.id).emit("session-data-update", this.data);
      },

      hasPlayerWon(moves) {
        const WIN_COMBOS = ["012", "345", "678", "036", "147", "258", "048", "246"];
        const movesStr = moves.join();
        for (const combo of WIN_COMBOS) {
          if (
            movesStr.includes(combo[0]) &&
            movesStr.includes(combo[1]) &&
            movesStr.includes(combo[2])
          )
            return true;
        }
        return false;
      },
    };

    return newGameSession;
  },
  getDefaultData: function (settings: ProcessedSettings): TicTacToeData {
    const data: TicTacToeData = {
      turnOf: 0,
      playersData: [
        {
          id: 0,
          token: "O",
          moves: [],
        },
        {
          id: 1,
          token: "X",
          moves: [],
        },
      ],
      nextTimestamp: 0,
    };

    return data;
  },
  isJoinable: function (session: GameSession): boolean {
    return session.state === "waiting";
  },
  onPlayerJoin: function (session, playerId: string): void {
    if (session.players.length === 2) {
      session.state = "ongoing";
      session.resetTimer();
      io.to(session.lobbyId).emit("game-session-update", session);
    }
  },
  onPlayerLeave: function (session: GameSession, playerId: string): void {
    if (session.state !== "ongoing") return;

    session.winner = session.players.find((player) => player !== undefined);
    session.state = "finished";
    io.to(session.lobbyId).emit("game-session-update", session);
  },
  onSessionEnd: function (session: GameSession): void {
    privateData.delete(session.id);
  },
  initSockets: function (session, socket: Socket): () => void {
    const onPlaceToken = (position: number) => session.handlePlaceToken(position);
    socket.on("place-token", onPlaceToken);
    return () => {
      socket.off("place-token", onPlaceToken);
    };
  },
};

export default ticTacToe;

import { publicLinkTo } from "../helpers";
import { Game, GameSetting } from "./types";

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
};

export default simpleGame;

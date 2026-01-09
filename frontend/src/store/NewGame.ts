import { action, makeAutoObservable } from "mobx";
import { RootStore } from "./RootStore";
import checkValidNickname from "../helpers/checkValidNickname";

class NewGame {
  store: RootStore;

  constructor(store: RootStore) {
    this.store = store;
    makeAutoObservable(this);
  }

  @action
  createNewGame = async (time: number, nickname: string) => {
    const board = this.store.board.board;
    if (!checkValidNickname(nickname)) throw new Error("Enter a valid nickname");
    try {
      const response = await fetch("http://localhost:3030/games", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          boardState: board,
          whitePlayerId: nickname,
          whiteTimeLeft: time,
          blackTimeLeft: time,
        }),
      });
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error(String(error));
      }
    }
  };
}
export default NewGame;

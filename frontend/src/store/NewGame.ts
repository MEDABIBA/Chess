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
      const data = await response.json();
      if (!response.ok) {
        console.log(
          data.message ? JSON.stringify(data.message) : `Server error: ${response.status}`,
        );
        throw new Error(
          data.message ? JSON.stringify(data.message) : `Server error: ${response.status}`,
        );
      }
      console.log("Id created game: ", data.id);
      return data.id;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(error.message);
        throw new Error(error.message);
      } else {
        console.log(error);
        throw new Error(String(error));
      }
    }
  };
}
export default NewGame;

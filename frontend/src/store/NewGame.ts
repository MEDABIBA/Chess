import { action, makeAutoObservable } from "mobx";
import { RootStore } from "./RootStore";

class NewGame {
  store: RootStore;

  constructor(store: RootStore) {
    this.store = store;
    makeAutoObservable(this);
  }

  @action
  createNewGame = async (time: number) => {
    const nickname = this.store.getNickname();
    if (!nickname) throw new Error("User not logged in");
    const board = this.store.games.currentGame.board;
    try {
      this.store.socket?.createGame({
        boardState: board,
        whitePlayerId: nickname,
        initialTime: time * 60,
      });
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

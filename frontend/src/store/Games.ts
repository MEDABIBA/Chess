import { makeAutoObservable, reaction } from "mobx";
import { RootStore } from "./RootStore";
import { GameInterface } from "../types/types";

class Games {
  gamesList: GameInterface[] | null = null;

  constructor(appStore: RootStore) {
    makeAutoObservable(this);
    reaction(
      () => appStore?.socket?.isConnected,
      (connected) => {
        if (connected) {
          appStore.socket?.getAllGames();
        }
      },
    );
  }

  addGame(game: GameInterface) {
    this.gamesList?.push(game);
  }
  setAllGames(games: GameInterface[]) {
    this.gamesList = games;
  }
  getAllGames() {
    return this.gamesList;
  }
}
export default Games;

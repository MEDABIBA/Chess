import { makeAutoObservable, reaction } from "mobx";
import { RootStore } from "./RootStore";
import { GameInterface } from "../types/types";
import Game from "./Game";

class Games {
  private appStore: RootStore;
  gamesList: GameInterface[] | null = null;
  currentGame: Game;

  constructor(appStore: RootStore) {
    makeAutoObservable(this);
    this.appStore = appStore;
    this.currentGame = new Game(this.appStore);
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

  setCurrentGame(id: number) {
    const game = this.gamesList?.find((el) => el.id === id);
    if (game && game !== undefined) {
      this.currentGame = new Game(this.appStore, game);
    }
  }

  isParticipant(game: GameInterface) {
    const user = this.appStore.getNickname();
    return game.whitePlayer?.username === user || game.blackPlayer?.username === user;
  }

  joinGame(game: GameInterface) {
    const username = this.appStore.getNickname();
    this.appStore.socket?.joinGame({ id: game.id, username });
    this.appStore.navigate(`game/${game.id}`);
  }
  joinGameByCode(code: string) {
    const username = this.appStore.getNickname();
    this.appStore.socket?.joinGameByCode({ username, code });
  }

  updateGame(game: GameInterface) {
    if (!this.gamesList) return;
    const index = this.gamesList?.findIndex((el) => el.id === game.id);
    if (index !== -1) {
      this.gamesList[index] = game;
    }
  }
}
export default Games;

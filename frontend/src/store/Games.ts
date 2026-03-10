import { makeAutoObservable, reaction } from "mobx";
import { RootStore } from "./RootStore";
import { GameInterface } from "../types/types";
import Game from "../models/Game";

class Games {
  private appStore: RootStore;
  gamesList: Game[] = [];
  currentGame: Game | null = null;

  constructor(appStore: RootStore) {
    makeAutoObservable(this);
    this.appStore = appStore;
    // this.currentGame = new Game(this.appStore);
    reaction(
      () => appStore?.socket?.isConnected,
      (connected) => {
        if (connected) {
          appStore.socket?.getAllGames();
        }
      },
    );
    reaction(
      () =>
        [this.currentGame?.id, this.appStore.socket, this.appStore.socket?.isConnected] as const,
      ([id, socket, isConnected]) => {
        if (!id || !socket || !isConnected) return;
        socket.getGame({ id: Number(id) });
      },
    );
  }

  addGame(game: GameInterface) {
    console.log("addGame", game);
    this.gamesList?.push(new Game(this.appStore, game));
  }

  setAllGames(games: GameInterface[]) {
    this.gamesList = [];
    games.forEach((game) => {
      this.gamesList.push(new Game(this.appStore, game));
    });
  }

  getAllGames() {
    return this.gamesList;
  }

  setCurrentGame(id: number) {
    const game = this.gamesList?.find((el) => el.id === id);
    if (game && game !== undefined) {
      this.currentGame = game;
    }
  }

  isParticipant(game: Game) {
    const user = this.appStore.getNickname();
    return game.whitePlayerNickname === user || game.blackPlayerNickname === user;
  }

  joinGame(game: Game) {
    const username = this.appStore.getNickname();
    if (!username) return;
    this.appStore.socket?.joinGame({ id: game.id, username });
    this.appStore.games.setCurrentGame(game.id);
    this.appStore.navigate(`game/${game.id}`);
  }
  joinGameByCode(code: string) {
    const username = this.appStore.getNickname();
    if (!username) return;
    this.appStore.socket?.joinGameByCode({ username, code });
  }

  updateGame(dto: GameInterface) {
    if (!this.gamesList) return;
    const game = this.gamesList?.find((el) => el.id === dto.id);
    if (!game) return;
    game.setBoard(dto);
  }
}
export default Games;

import { makeAutoObservable } from "mobx";
import BoardStore from "./BoardStore";
import ChessMoveValidator from "./ChessMoveValidator";

export class RootStore {
  boardStore: BoardStore;
  chessMoveValidator: ChessMoveValidator;
  constructor() {
    makeAutoObservable(this);
    this.chessMoveValidator = new ChessMoveValidator(this);
    this.boardStore = new BoardStore(this);
  }
}

export const store = new RootStore();

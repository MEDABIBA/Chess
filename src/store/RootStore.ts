import { makeAutoObservable } from "mobx";
import Board from "./Board";
import ChessMoveValidator from "./ChessMoveValidator";
import Timer from "./Timer";

export class RootStore {
  board: Board;
  chessMoveValidator: ChessMoveValidator;
  timer: Timer;
  constructor() {
    makeAutoObservable(this);
    this.chessMoveValidator = new ChessMoveValidator(this);
    this.board = new Board(this);
    this.timer = new Timer(this);
  }
}

export const store = new RootStore();

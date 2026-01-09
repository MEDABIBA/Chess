import { makeAutoObservable } from "mobx";
import Board from "./Board";
import ChessMoveValidator from "./ChessMoveValidator";
import Timer from "./Timer";
import NewGame from "./NewGame";

export class RootStore {
  board: Board;
  chessMoveValidator: ChessMoveValidator;
  timer: Timer;
  newGame: NewGame;

  constructor() {
    makeAutoObservable(this);
    this.chessMoveValidator = new ChessMoveValidator(this);
    this.board = new Board(this);
    this.timer = new Timer(this);
    this.newGame = new NewGame(this);
  }
}

export const store = new RootStore();

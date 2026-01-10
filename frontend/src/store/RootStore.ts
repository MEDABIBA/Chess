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
  nickname: string | null = null;

  constructor() {
    makeAutoObservable(this);
    this.chessMoveValidator = new ChessMoveValidator(this);
    this.board = new Board(this);
    this.timer = new Timer(this);
    this.newGame = new NewGame(this);

    this.getNickname();
  }

  getNickname() {
    this.nickname = localStorage.getItem("nickname");
    console.log("Nickname is: ", this.nickname);
  }
  setNickname(nickname: string) {
    localStorage.setItem("nickname", nickname);
    console.log("Nickname was changed to: ", this.nickname);
  }
}

export const store = new RootStore();

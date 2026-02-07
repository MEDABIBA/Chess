import { makeAutoObservable, observable } from "mobx";
import Board from "./Board";
import ChessMoveValidator from "./ChessMoveValidator";
import Timer from "./Timer";
import NewGame from "./NewGame";
import { NavigateFunction } from "react-router-dom";

export class RootStore {
  board: Board;
  chessMoveValidator: ChessMoveValidator;
  timer: Timer;
  newGame: NewGame;
  nickname: string | null = null;

  @observable navigate!: NavigateFunction;

  constructor() {
    makeAutoObservable(this);
    this.chessMoveValidator = new ChessMoveValidator(this);
    this.board = new Board(this);
    this.timer = new Timer(this);
    this.newGame = new NewGame(this);

    this.getNickname();
  }

  initNavigate(navigate: NavigateFunction) {
    this.navigate = navigate;
  }

  getNickname() {
    // Take it from access token
    console.log("Nickname is: ", this.nickname);
  }

  async handleAuthSubmit(auth: "login" | "registration", username: string, password: string) {
    const res = await fetch(`http://localhost:3030/auth/${auth}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.log(res.status, "Error processed");
      throw new Error(data.message || "Request failed");
    }
    localStorage.setItem("accessToken", data.accessToken);
    this.navigate("/home");
    console.log("user created!");
  }
}

export const store = new RootStore();

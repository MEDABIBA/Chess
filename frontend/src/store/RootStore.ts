import { makeAutoObservable, observable } from "mobx";
import Board from "./Board";
import ChessMoveValidator from "./ChessMoveValidator";
import Timer from "./Timer";
import NewGame from "./NewGame";
import { NavigateFunction } from "react-router-dom";
import { socket } from "../services/ws.service";
import tokenService from "../services/auth.service";

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

    // this.init();
  }

  async initWs() {
    try {
      await socket.connect();

      this.getNickname();
    } catch (error) {
      console.error("Initialization failed:", error);
      this.navigate("registration-form");
    }
  }

  initNavigate(navigate: NavigateFunction) {
    console.log("init navigate", navigate);
    this.navigate = navigate;
  }

  getNickname() {
    // Take it from access token
    console.log("Nickname is: ", this.nickname);
  }

  handleAuthSubmit = async (auth: "login" | "registration", username: string, password: string) => {
    try {
      const res = await fetch(`http://localhost:3030/auth/${auth}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Request failed");
      }
      tokenService.setAccessToken(data.accessToken);
      console.log("user created!");
      this.navigate("home");
    } catch (error) {
      if (error instanceof Error) {
        console.log("Error processed");
        throw new Error(error.message || "Request failed");
      }
    }
  };
}

export const store = new RootStore();

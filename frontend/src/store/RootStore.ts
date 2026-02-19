import { makeAutoObservable, observable } from "mobx";
import Game from "./Game";
import ChessMoveValidator from "./ChessMoveValidator";
import Timer from "./Timer";
import NewGame from "./NewGame";
import { NavigateFunction } from "react-router-dom";
import { socket } from "../services/ws.service";
import tokenService from "../services/auth.service";
import { jwtDecode } from "jwt-decode";
import { MyJwtPayload } from "../types/types";
import Games from "./Games";

export class RootStore {
  games: Games;
  game: Game;
  chessMoveValidator: ChessMoveValidator;
  timer: Timer;
  newGame: NewGame;
  socket: typeof socket | null;

  @observable navigate!: NavigateFunction;

  constructor() {
    makeAutoObservable(this);
    this.chessMoveValidator = new ChessMoveValidator(this);
    this.games = new Games(this);
    this.game = new Game(this);
    this.timer = new Timer(this);
    this.newGame = new NewGame(this);
    this.socket = socket;

    // this.init();
  }

  async initWs() {
    try {
      if (!this.socket) {
        console.error("Socket unucialized!");
        return;
      }
      this.socket.setStore(this); // ← передаём через метод, не импорт
      await this.socket.connect();
    } catch (error) {
      console.error("Initialization failed:", error);
      this.navigate("registration-form");
    }
  }

  initNavigate(navigate: NavigateFunction) {
    this.navigate = navigate;
  }

  getNickname() {
    if (!this.socket?.accessToken) {
      console.error("There is no accessToken to exteract nickname!");
      return null;
    }
    const decoded: MyJwtPayload = jwtDecode(this.socket.accessToken);
    return decoded.username;
  }

  isAuthorized() {
    return tokenService.isAuthenticated();
  }
  handleAuthSubmit = async (auth: "login" | "registration", username: string, password: string) => {
    try {
      if (!this.socket) {
        console.error("Socket unucialized!");
        return;
      }
      const res = await fetch(`http://localhost:3030/auth/${auth}`, {
        method: "POST",
        credentials: "include",
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
      this.socket.accessToken = data.accessToken;
      console.log("user created!");
      this.navigate("home");
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error processed");
        throw new Error(error.message || "Request failed");
      }
    }
  };
}

export const store = new RootStore();

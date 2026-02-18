import { io, Socket } from "socket.io-client";
import apiService from "./api.service";
import tokenService from "./auth.service";
import { RootStore } from "../store/RootStore";
import { GameInterface } from "../types/types";
import { makeAutoObservable } from "mobx";

class WebSocketService {
  store: RootStore | null = null;
  socket: Socket | null = null;
  isConnected: boolean = false;
  accessToken: string | null = null;
  constructor() {
    makeAutoObservable(this);
    this.accessToken = tokenService.getAccessToken();
  }

  public setStore(store: RootStore) {
    this.store = store;
  }

  public async connect() {
    if (this.socket?.connected) {
      return this.socket;
    }
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket = null;
    }

    if (!this.accessToken) {
      console.log("Token unregistered");
      throw new Error("Invalid access token");
    }
    this.socket = io("http://localhost:3030", {
      auth: {
        token: this.accessToken,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      timeout: 5000,
    });

    this.handleEvents();

    return this.socket;
  }

  private handleEvents() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      this.isConnected = true;
      console.log("WebSocket connected");
    });

    this.socket?.on("game-created", (game: GameInterface) => {
      console.log("game-created, game id: ", game.id);
      this.store?.games.addGame(game);
    });
    this.socket?.on("game-created-you", (res: { id: number }) => {
      console.log("game-created-you", res);
      this.store?.navigate(`game/${res.id}`);
    });
    this.socket?.on("guest-joined", (res: any) => {
      console.log(res);
    });
    this.socket?.on("get-games", (games: GameInterface[]) => {
      this.store?.games.setAllGames(games);
      console.log("get-games", games);
    });
    this.socket?.on("game-state", (res: GameInterface) => {
      this.store?.game.setBoard(res);
      console.log(res);
    });
    this.socket?.on("state", (res: any) => {
      // makeMove logic
      console.log(res);
    });

    this.socket.on("error", async (err) => {
      this.isConnected = false;
      console.log("error", err);
      if (err.message.includes("Unauthorized")) {
        const token = await this.refreshAccessToken();
        console.log("refreshed");
        if (token && this.socket) {
          this.socket.auth = { token };
        }
      }
    });

    this.socket.on("disconnect", (reason: Socket.DisconnectReason) => {
      this.isConnected = false;
      console.log("WebSocket disconnected:", reason);
    });
  }

  public createGame(data: any) {
    if (!this.socket) throw new Error("Socket not initialized");
    if (!this.socket?.connected) return;
    this.socket.emit("create-game", data);
  }
  public joinGame(data: any) {
    if (!this.socket) throw new Error("Socket not initialized");
    if (!this.socket?.connected) return;
    this.socket.emit("join-game", data);
  }
  public getAllGames() {
    if (!this.socket) throw new Error("Socket not initialized");
    if (!this.socket?.connected) return;
    this.socket?.emit("get-games");
  }
  public getGame(data: { id: number }) {
    if (!this.socket) throw new Error("Socket not initialized");
    if (!this.socket?.connected) return;
    this.socket?.emit("get-game", data);
  }
  public makeMove(data: any) {
    if (!this.socket) throw new Error("Socket not initialized");
    if (!this.socket?.connected) return;
    this.socket.emit("make-move", data);
  }

  startHeartbeat = () => {};

  public async refreshAccessToken() {
    const token = await apiService.refreshAccessToken();

    tokenService.setAccessToken(token);
    this.accessToken = token;
    return token;
  }
}
export const socket = new WebSocketService();

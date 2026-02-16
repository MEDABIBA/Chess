import { io, Socket } from "socket.io-client";
import apiService from "./api.service";
import tokenService from "./auth.service";

class WebSocketService {
  socket: Socket | null = null;
  accessToken: string | null = null;
  constructor() {
    this.accessToken = tokenService.getAccessToken();
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
      query: {
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
      console.log("WebSocket connected");
    });

    this.socket?.on("game-created", (res: any) => {
      console.log(res);
    });
    this.socket?.on("guest-joined", (res: any) => {
      console.log(res);
    });
    this.socket?.on("game-state", (res: any) => {
      // on get-game emit
      console.log(res);
    });
    this.socket?.on("state", (res: any) => {
      // makeMove logic
      console.log(res);
    });

    this.socket.on("error", async (err) => {
      console.log("error", err);
      if (err.message.includes("Unauthorized")) {
        const token = await this.refreshAccessToken();
        console.log("refreshed");
        if (token && this.socket) {
          this.socket.connect();
        }
      }
    });

    this.socket.on("disconnect", (reason: Socket.DisconnectReason) => {
      console.log("WebSocket disconnected:", reason);
    });
  }

  startHeartbeat = () => {};

  public isConnected() {
    return this.socket?.connected ?? false;
  }

  public async refreshAccessToken() {
    const token = await apiService.refreshAccessToken();

    tokenService.setAccessToken(token);
    return token;
  }
}
export const socket = new WebSocketService();

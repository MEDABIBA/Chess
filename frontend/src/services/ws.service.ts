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
    if (this.socket) {
      return this.socket;
    }
    if (!this.accessToken) {
      console.log("Token unregistered");
      throw new Error("Invalid access token");
    }
    this.socket = io("https://localhost:3030", {
      query: {
        token: this.accessToken,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });
    this.socket.on("connect_error", async (err: Error) => {
      if (err.message.includes("Invalid or expired access token")) {
        const token = await this.refreshAccessToken();
        if (token && this.socket) {
          this.socket.io.opts.query = { token };
          this.socket.connect();
        }
      }
    });
    this.socket.on("connect", () => {
      console.log("WebSocket connected");
    });

    this.socket.on("disconnect", (reason: Socket.DisconnectReason) => {
      console.log("WebSocket disconnected:", reason);
    });

    return this.socket;
  }
  public isConnected() {
    return this.socket?.connected ?? false;
  }

  public async refreshAccessToken() {
    const token = await apiService.refreshToken();

    tokenService.setAccessToken(token);
    return token;
  }
}
export const socket = new WebSocketService();

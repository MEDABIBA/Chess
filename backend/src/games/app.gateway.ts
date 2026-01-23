import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { AppService } from "./app.service";

import { CreateGameDto } from "./dto/createGame.dto";
import { JoinGameDto } from "./dto/joinGame.dto";
import { MakeMoveDto } from "./dto/makeMove.dto";
import { Server, Socket } from "socket.io";

@WebSocketGateway({ cors: true })
export class GameGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly appService: AppService) {}

  @SubscribeMessage("create-game")
  async createGame(
    @MessageBody() createGameOptions: CreateGameDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const game = await this.appService.createGame(createGameOptions);

      client.join(`game/${game.id}`);
      client.emit("game-created");
    } catch (err) {
      client.emit("error", { message: err.message });
    }
  }

  @SubscribeMessage("join-game")
  async joinGame(@MessageBody() dto: JoinGameDto, @ConnectedSocket() client: Socket) {
    try {
      const game = await this.appService.joinGame(dto.id, dto);

      client.join(`game/${dto.id}`);
      this.server.to(`game/${dto.id}`).emit("guest-joined", game);
    } catch (err) {
      client.emit("error", { message: err.message });
    }
  }

  @SubscribeMessage("get-game")
  async getGame(@MessageBody() dto: { id: number }, @ConnectedSocket() client: Socket) {
    try {
      const game = await this.appService.getGame(dto.id);
      client.emit("game-state", game);
    } catch (err) {
      client.emit("error", { message: err.message });
    }
  }
  @SubscribeMessage("make-move")
  async makeMove(
    @MessageBody() dto: { id: number; moveData: MakeMoveDto },
    @ConnectedSocket() client: Socket, // ДОБАВЬ это
  ) {
    try {
      const fen = await this.appService.makeMove(dto.id, dto.moveData);

      this.server.to(`game/${dto.id}`).emit("state", fen);
    } catch (err) {
      client.emit("error", { message: err.message });
    }
  }
}

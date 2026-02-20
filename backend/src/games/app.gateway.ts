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
import { fenToBoard } from "src/helpers";
import { UseGuards } from "@nestjs/common";
import { WsJwtGuard } from "src/auth/ws-gwt.guard";
import { joinGameByCodeDto } from "./dto/joinGameByCode";

@WebSocketGateway({ cors: true })
@UseGuards(WsJwtGuard)
export class GameGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly appService: AppService) {}

  @SubscribeMessage("create-game")
  async createGame(
    @MessageBody() createGameOptions: CreateGameDto,
    @ConnectedSocket() client: Socket,
  ) {
    console.log("=== CREATE GAME CALLED ===");
    try {
      const userId: number = client.data.user.userId;
      const game = await this.appService.createGame({
        ...createGameOptions,
        whitePlayerId: String(userId),
      });
      const gameWithNicknames = await this.appService.getGame(game.id);
      client.join(`game/${game.id}`);
      this.server.emit("game-created", gameWithNicknames);
      client.emit("game-created-you", { id: game.id });
    } catch (err) {
      client.emit("error", { message: err.message });
    }
  }

  @SubscribeMessage("join-room")
  joinRoom(@MessageBody() data: { gameId: number }, @ConnectedSocket() client: Socket) {
    const { gameId } = data;
    console.log("user joined");
    client.join(`game/${gameId}`);
  }

  @SubscribeMessage("leave-room")
  leaveRoom(@MessageBody() data: { gameId: number }, @ConnectedSocket() client: Socket) {
    const { gameId } = data;
    client.leave(`game/${gameId}`);
  }

  @SubscribeMessage("join-game")
  async joinGame(@MessageBody() dto: JoinGameDto, @ConnectedSocket() client: Socket) {
    try {
      console.log("=== JOIN GAME CALLED ===");
      const game = await this.appService.joinGame(dto);
      const boardState = fenToBoard(game.fen);

      client.join(`game/${game.id}`);
      this.server.emit("guest-joined", { ...game, boardState });
    } catch (err) {
      client.emit("error", { message: err.message });
    }
  }
  @SubscribeMessage("join-game-code")
  async joinGameByCode(@MessageBody() dto: joinGameByCodeDto, @ConnectedSocket() client: Socket) {
    try {
      console.log("=== JOIN GAME By CODE CALLED ===");
      const game = await this.appService.joinGameByCode(dto);
      const boardState = fenToBoard(game.fen);

      client.join(`game/${game.id}`);
      client.emit("game-joined-by-code-you", { id: game.id });
      this.server.emit("guest-joined", { ...game, boardState });
    } catch (err) {
      client.emit("error", { message: err.message });
    }
  }

  @SubscribeMessage("get-games")
  async getGames(@ConnectedSocket() client: Socket) {
    try {
      const games = await this.appService.getGames();
      const gamesWithBoard = games.map((game) => ({
        ...game,
        boardState: fenToBoard(game.fen),
      }));
      client.emit("get-games", gamesWithBoard);
    } catch (err) {
      client.emit("error", { message: err.message });
    }
  }

  @SubscribeMessage("get-game")
  async getGame(@MessageBody() dto: { id: number }, @ConnectedSocket() client: Socket) {
    try {
      const game = await this.appService.getGame(dto.id);
      const boardState = fenToBoard(game.fen);

      client.emit("game-state", { ...game, boardState });
    } catch (err) {
      client.emit("error", { message: err.message });
    }
  }

  @SubscribeMessage("make-move")
  async makeMove(
    @MessageBody() dto: { id: number; moveData: MakeMoveDto },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { from, to } = dto.moveData;
      const game = await this.appService.makeMove(dto.id, dto.moveData);
      const boardState = fenToBoard(game.fen);
      const piece = boardState.find(
        (el) => el.position.col === to.col && el.position.row === to.row,
      )?.piece;
      this.server.to(`game/${dto.id}`).emit("state", { success: true, from, to, piece });
    } catch (err) {
      client.emit("error", { message: err.message });
    }
  }
}

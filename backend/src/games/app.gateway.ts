import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { AppService } from './app.service';

import { CreateGameDto } from './dto/createGame.dto';
import { JoinGameDto } from './dto/joinGame.dto';
import { MakeMoveDto } from './dto/makeMove.dto';
import { Server, Socket } from 'socket.io';
import { fenToBoard } from 'src/helpers';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from 'src/auth/ws-gwt.guard';
import { joinGameByCodeDto } from './dto/joinGameByCode.dto';
import { DrawOfferDto } from './dto/drawOffer.dto';
import { DrawResponseDto } from './dto/drawResponse.dto';
import remaningTimeForPlayer from 'src/helpers/remainingTimeForPlayer';
import { Prisma } from '@prisma/client';

@WebSocketGateway({ cors: true })
@UseGuards(WsJwtGuard)
export class GameGateway {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly appService: AppService) {}

  @SubscribeMessage('create-game')
  async createGame(
    @MessageBody() createGameOptions: CreateGameDto,
    @ConnectedSocket() client: Socket,
  ) {
    console.log('=== CREATE GAME CALLED ===');
    try {
      const existingGame = await this.appService.checkIfHasExistingGame(
        createGameOptions.creatorUserName,
      );
      if (existingGame) {
        throw new Error('You already have existing game!');
      }
      const game = await this.appService.createGame({
        ...createGameOptions,
      });
      if (createGameOptions.isBotGame) {
        const botColor = game.whitePlayerId ? 'black' : 'white';
        this.appService.inviteBotToGame(
          game.id,
          botColor,
          createGameOptions.depth,
        );
      }

      const gameWithNicknames = await this.appService.getGame(game.id);
      const boardState = fenToBoard(gameWithNicknames.fen);
      client.join(`game/${game.id}`);
      this.server.emit('game-created', { ...gameWithNicknames, boardState });
      client.emit('game-created-you', { id: game.id });
    } catch (err) {
      if (err instanceof Error) {
        client.emit('game-created-you', { error: err.message });
      } else {
        client.emit('game-created-you', { error: err });
      }
    }
  }

  @SubscribeMessage('remove-game')
  async removeGame(
    @MessageBody() data: { gameId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const { gameId } = data;
    try {
      const userId = await client.data.user.userId;
      const removedGame = await this.appService.removeGame({ gameId, userId });
      this.server
        .to(`game/${gameId}`)
        .emit('game-removed-lobby', { gameId: removedGame.id });
      this.server.emit('game-removed', { gameId: removedGame.id });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2025') {
          client.emit('game-removed-lobby', {
            message: `Game ${gameId} not found`,
          });
        } else {
          client.emit('game-removed-lobby', { error: err.message });
        }
      } else if (err instanceof Error) {
        client.emit('game-removed-lobby', { error: err.message });
      } else {
        client.emit('game-removed-lobby', { error: String(err) });
      }
    }
  }

  @SubscribeMessage('join-room')
  joinRoom(
    @MessageBody() data: { gameId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const { gameId } = data;
    console.log('user joined');
    client.join(`game/${gameId}`);
  }

  @SubscribeMessage('leave-room')
  leaveRoom(
    @MessageBody() data: { gameId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const { gameId } = data;
    client.leave(`game/${gameId}`);
  }

  @SubscribeMessage('join-game')
  async joinGame(
    @MessageBody() dto: JoinGameDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      console.log('=== JOIN GAME CALLED ===');
      const game = await this.appService.joinGame(dto);
      const boardState = fenToBoard(game.fen);

      client.join(`game/${game.id}`);
      this.server.emit('guest-joined', { ...game, boardState });
    } catch (err) {
      if (err instanceof Error) {
        client.emit('guest-joined', { error: err.message });
      } else {
        client.emit('guest-joined', { error: err });
      }
    }
  }
  @SubscribeMessage('join-game-code')
  async joinGameByCode(
    @MessageBody() dto: joinGameByCodeDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      console.log('=== JOIN GAME By CODE CALLED ===');
      const game = await this.appService.joinGameByCode(dto);
      const boardState = fenToBoard(game.fen);

      client.join(`game/${game.id}`);
      client.emit('game-joined-by-code-you', { id: game.id });
      this.server.emit('guest-joined', { ...game, boardState });
    } catch (err) {
      if (err instanceof Error) {
        client.emit('guest-joined', { error: err.message });
      } else {
        client.emit('guest-joined', { error: err });
      }
    }
  }

  @SubscribeMessage('get-games')
  async getGames(@ConnectedSocket() client: Socket) {
    try {
      const games = await this.appService.getGames();
      const gamesWithBoard = games.map((game) => ({
        ...game,
        boardState: fenToBoard(game.fen),
      }));
      client.emit('get-games', gamesWithBoard);
    } catch (err) {
      if (err instanceof Error) {
        client.emit('get-games', { error: err.message });
      } else {
        client.emit('get-games', { error: err });
      }
    }
  }

  @SubscribeMessage('get-game')
  async getGame(
    @MessageBody() dto: { id: number },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const game = await this.appService.getGame(dto.id);
      const boardState = fenToBoard(game.fen);
      game.whiteTimeLeft = remaningTimeForPlayer(game, 'white');
      game.blackTimeLeft = remaningTimeForPlayer(game, 'black');
      client.emit('game-state', { ...game, boardState });
    } catch (err) {
      if (err instanceof Error) {
        client.emit('game-state', { error: err.message });
      } else {
        client.emit('game-state', { error: err });
      }
    }
  }

  @SubscribeMessage('make-move')
  async makeMove(
    @MessageBody() dto: { id: number; moveData: MakeMoveDto },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const userId = await client.data.user.userId;
      if (!this.appService.checkIsCurrentPlayer(dto.id, userId)) {
        throw new Error('You are not allowed to make move!');
      }
      const { from, to } = dto.moveData;
      const isTimeoutWinner = await this.appService.checkIfTimeoutWin(dto.id);
      if (isTimeoutWinner !== null) {
        return await this.appService.setTimeoutWin(
          dto.id,
          isTimeoutWinner,
          this.server,
        );
      }
      const res = await this.appService.makeMove(
        dto.id,
        dto.moveData,
        this.server,
      );
      const boardState = fenToBoard(res.fen);
      const piece = boardState.find(
        (el) => el.position.col === to.col && el.position.row === to.row,
      )?.piece;
      this.server.emit('update-game-status', {
        id: res.id,
        gameStatus: res.gameStatus,
        winner: res.winner,
      });
      this.server.to(`game/${dto.id}`).emit('state', {
        success: true,
        from,
        to,
        piece,
        whiteTimeLeft: Math.round(res.whiteTimeLeft),
        blackTimeLeft: Math.round(res.blackTimeLeft),
      });
    } catch (err) {
      if (err instanceof Error) {
        client.emit('state', { error: err.message });
      } else {
        client.emit('state', { error: err });
      }
    }
  }

  @SubscribeMessage('add-extra-time')
  async addExtraTime(
    @MessageBody() dto: { gameId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const { gameId } = dto;
    const userId: number = client.data.user.userId;
    try {
      const res = await this.appService.addExtraTime(
        gameId,
        userId,
        this.server,
      );

      this.server.to(`game/${gameId}`).emit('add-extra-time', {
        fromUserId: userId,
        whiteTimeLeft: remaningTimeForPlayer(res, 'white'),
        blackTimeLeft: remaningTimeForPlayer(res, 'black'),
      });
    } catch (err) {
      if (err instanceof Error) {
        client.emit('add-extra-time', { error: err.message });
      } else {
        client.emit('add-extra-time', { error: err });
      }
    }
  }

  @SubscribeMessage('draw-offer')
  async drawOffer(
    @MessageBody() dto: DrawOfferDto,
    @ConnectedSocket() client: Socket,
  ) {
    const { gameId } = dto;
    try {
      const userId: number = client.data.user.userId;
      const res = await this.appService.handleDrawOffer(gameId, userId);
      this.server
        .to(`game/${gameId}`)
        .emit('draw-offer', { drawOfferedBy: res.drawOfferedBy });
    } catch (err) {
      if (err instanceof Error) {
        client.emit('draw-offer', { error: err.message });
      } else {
        client.emit('draw-offer', { error: err });
      }
    }
  }

  @SubscribeMessage('draw-response')
  async drawResponse(
    @MessageBody() dto: DrawResponseDto,
    @ConnectedSocket() client: Socket,
  ) {
    const { gameId, response } = dto;
    try {
      const userId: number = client.data.user.userId;
      const game = await this.appService.handleDrawResponse(
        gameId,
        userId,
        response,
      );
      const boardState = fenToBoard(game.fen);
      this.server
        .to(`game/${gameId}`)
        .emit('draw-response', { ...game, boardState });
    } catch (err) {
      if (err instanceof Error) {
        client.emit('draw-response', { error: err.message });
      } else {
        client.emit('draw-response', { error: err });
      }
    }
  }

  @SubscribeMessage('resign')
  async resign(
    @MessageBody() dto: { id: number },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const user = client.data.user;
      const game = await this.appService.resign(dto.id, user.userId);
      this.server.emit('update-game-status', {
        id: game.id,
        gameStatus: game.gameStatus,
        winner: game.winner,
      });
    } catch (err) {
      if (err instanceof Error) {
        client.emit('update-game-status', { error: err.message });
      } else {
        client.emit('update-game-status', { error: err });
      }
    }
  }
}

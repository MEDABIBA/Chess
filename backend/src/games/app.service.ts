import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateGameDto } from './dto/createGame.dto';
import { JoinGameDto } from './dto/joinGame.dto';
import { MakeMoveDto } from './dto/makeMove.dto';
import { boardToFen } from 'src/helpers';
import { Chess } from 'chess.js';
import { validateMove } from 'src/helpers/validateMove';
import { generateInviteCode } from 'src/helpers/generateInviteCode';
import { joinGameByCodeDto } from './dto/joinGameByCode.dto';
import { Server } from 'socket.io';
import { removeGameDto } from './dto/removeGame.dto';
import { Game } from '@prisma/client';

@Injectable()
export class AppService {
  gameTimers = new Map<number, NodeJS.Timeout>();

  constructor(private prisma: PrismaService) {}

  scheduleTimeout(
    gameId: number,
    timeLeftMs: number,
    timeoutWinner: string,
    server: Server,
  ) {
    clearTimeout(this.gameTimers.get(gameId));
    this.gameTimers.delete(gameId);

    const timeout = setTimeout(async () => {
      this.setTimeoutWin(gameId, timeoutWinner, server);
    }, timeLeftMs);
    this.gameTimers.set(gameId, timeout);
  }

  async setTimeoutWin(gameId: number, timeoutWinner: string, server: Server) {
    const game = await this.prisma.game.update({
      where: { id: gameId },
      data: { winner: timeoutWinner, gameStatus: 'timeout' },
    });
    server
      .to(`game/${gameId}`)
      .emit('timeout', { winner: game.winner, gameStatus: game.gameStatus });
  }

  async checkIsCurrentPlayer(id: number, clientId: number) {
    const game = await this.prisma.game.findUnique({ where: { id: id } });
    if (!game) throw new Error('Cannot find game');
    if (game.currentPlayer === 'white') {
      return game.whitePlayerId === clientId;
    } else if (game.currentPlayer === 'black') {
      return game.blackPlayerId === clientId;
    }
    return false;
  }

  async checkIfTimeoutWin(id: number): Promise<string | null> {
    const game = await this.prisma.game.findUnique({
      where: { id },
      include: { whitePlayer: true, blackPlayer: true },
    });
    if (!game) throw new Error('Game not found');

    let timeLeft: number;
    let turnStartedAt: Date | null;
    let timeoutWinner: string;

    if (game.currentPlayer === 'white' && game.blackPlayer) {
      timeLeft = Math.round(game.whiteTimeLeft);
      turnStartedAt = game.whiteTurnStarterAt;
      timeoutWinner = game.blackPlayer.username;
    } else if (game.currentPlayer === 'black' && game.whitePlayer) {
      timeLeft = Math.round(game.blackTimeLeft);
      turnStartedAt = game.blackTurnStarterAt;
      timeoutWinner = game.whitePlayer.username;
    } else {
      throw new Error(`Invalid player color ${game.currentPlayer}`);
    }

    if (turnStartedAt) {
      const elapsed = (Date.now() - turnStartedAt.getTime()) / 1000;
      timeLeft -= elapsed;
    }

    return timeLeft <= 0 ? timeoutWinner : null;
  }
  async checkIfHasExistingGame(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username: username },
    });
    if (!user) throw new Error('user didnt exist');
    return await this.prisma.game.findFirst({
      where: {
        gameCreatorId: user.id,
        gameStatus: { in: ['waiting', 'playing'] },
      },
    });
  }
  async createGame(dto: CreateGameDto) {
    const {
      boardState,
      creatorUserName,
      selectedColor,
      initialTime,
      additionalTime,
    } = dto;
    if (!initialTime || additionalTime < 0 || additionalTime > 15)
      // set additional time limit to 15 sec
      throw new Error('Time is setted incorrect!');
    const fen = boardToFen(
      boardState.map((square) => ({
        color: square.color,
        position: square.position,
        piece: square.piece ? square.piece : null,
      })),
      'white',
    );
    const creator = await this.prisma.user.findUnique({
      where: { username: creatorUserName },
    });
    if (!creator) throw new Error('user didnt exist');
    const inviteCode = generateInviteCode();
    return this.prisma.game.create({
      data: {
        fen: fen,
        currentPlayer: 'white',
        gameCreatorId: creator.id,
        whitePlayerId: selectedColor === 'white' ? creator.id : undefined,
        blackPlayerId: selectedColor === 'black' ? creator.id : undefined,
        initialTime,
        additionalTime,
        whiteTimeLeft: initialTime,
        blackTimeLeft: initialTime,
        inviteCode,
      },
    });
  }

  async removeGame(dto: removeGameDto) {
    const { gameId, userId } = dto;
    const game = await this.prisma.game.findUnique({ where: { id: gameId } });
    if (!game) throw new Error(`Cannot find game with id ${gameId}`);
    if (game.gameStatus !== 'waiting')
      throw new Error(
        "You can remove game only if its hasn't been started yet!",
      );
    if (game.whitePlayerId !== userId && game.blackPlayerId !== userId)
      throw new Error('Only participants can delete the game!');
    return await this.prisma.game.delete({ where: { id: gameId } });
  }

  async joinGame(dto: JoinGameDto) {
    const { id, username } = dto;
    const user = await this.prisma.user.findUnique({
      where: { username: username },
    });
    if (!user) {
      throw new Error('User not found in database');
    }
    const game = await this.prisma.game.findUnique({
      where: { id: id },
    });
    if (!game) {
      console.log('No game with that code was found');
      throw new Error('No game with that code was found');
    }
    if (game.whitePlayerId && game.blackPlayerId) {
      throw new Error('Game is already full');
    }
    if (game.whitePlayerId === user.id || game.blackPlayerId === user.id) {
      throw new Error('You cannot join your own game');
    }
    if (game.gameCreatorId == game.whitePlayerId) {
      return await this.prisma.game.update({
        where: { id: id },
        data: { blackPlayerId: Number(user.id) },
        include: { whitePlayer: true, blackPlayer: true },
      });
    } else {
      return await this.prisma.game.update({
        where: { id: id },
        data: { whitePlayerId: Number(user.id) },
        include: { whitePlayer: true, blackPlayer: true },
      });
    }
  }

  async joinGameByCode(dto: joinGameByCodeDto) {
    const { username, code } = dto;
    const user = await this.prisma.user.findUnique({
      where: { username: username },
    });
    if (!user) {
      throw new Error('User not found in database');
    }
    const game = await this.prisma.game.findUnique({
      where: { inviteCode: code },
    });
    if (!game) {
      console.log('No game with that code was found');
      throw new Error('No game with that code was found');
    }
    if (game.whitePlayerId && game.blackPlayerId) {
      throw new Error('Game is already full');
    }
    if (game.whitePlayerId === user.id || game.blackPlayerId === user.id) {
      throw new Error('You cannot join your own game');
    }
    if (game.gameCreatorId == game.whitePlayerId) {
      return await this.prisma.game.update({
        where: { id: game.id },
        data: { blackPlayerId: Number(user.id) },
        include: { whitePlayer: true, blackPlayer: true },
      });
    } else {
      return await this.prisma.game.update({
        where: { id: game.id },
        data: { whitePlayerId: Number(user.id) },
        include: { whitePlayer: true, blackPlayer: true },
      });
    }
  }

  async getGames() {
    const games = await this.prisma.game.findMany({
      include: {
        whitePlayer: { select: { username: true } },
        blackPlayer: { select: { username: true } },
      },
    });
    return games;
  }

  async getGame(id: number) {
    const game = await this.prisma.game.findUnique({
      where: { id },
      include: {
        whitePlayer: { select: { username: true } },
        blackPlayer: { select: { username: true } },
      },
    });

    if (game) {
      return game;
    } else {
      console.log('game not found');
      throw new NotFoundException('game not found');
    }
  }

  async makeMove(id: number, dto: MakeMoveDto, server: Server) {
    const { from, to, highlightLastMove, promotionPiece } = dto;
    let nextTimeLeft: number | null = null;
    let nextTimeoutWinner: string = '';
    let isActiveGame: boolean = false;

    const result = await this.prisma.$transaction(async (prisma) => {
      const game = await prisma.game.findUnique({
        where: {
          id: id,
        },
        include: {
          blackPlayer: true,
          whitePlayer: true,
        },
      });
      if (!game) {
        console.log('game not found');
        throw new Error('game not found');
      }
      let turnStartedAt: Date | null = null;
      let timeLeft: number;
      const fen = new Chess(game.fen);
      const res = validateMove(fen, from, to, promotionPiece);
      console.log('makeMove res: ', res.valid);
      if (!res.valid) {
        console.log('Invalid move');
        throw new Error('Invalid move');
      }
      if (res.valid) {
        if (game.gameStatus !== 'playing') {
          game.gameStatus = 'playing';
        }
        if (res.isStalemate) {
          game.gameStatus = 'stalemate';
        }
        if (res.isCheckmate) {
          game.winner =
            game.currentPlayer === 'white'
              ? game.whitePlayer!.username
              : game.blackPlayer!.username;
          if (!game.winner) throw new Error('Winner was not found');
          game.gameStatus = 'checkmate';
        }
      }
      if (game.currentPlayer === 'white') {
        let timeSpend = 0;
        turnStartedAt = game.whiteTurnStarterAt;
        if (turnStartedAt) {
          timeSpend = (Date.now() - turnStartedAt.getTime()) / 1000;
        }
        timeLeft = game.whiteTimeLeft - timeSpend + game.additionalTime;
        nextTimeLeft = game.blackTimeLeft;
        game.blackTurnStarterAt = new Date();
      } else if (game.currentPlayer === 'black') {
        let timeSpend = 0;
        turnStartedAt = game.blackTurnStarterAt;
        if (turnStartedAt) {
          timeSpend = (Date.now() - turnStartedAt.getTime()) / 1000;
        }
        timeLeft = game.blackTimeLeft - timeSpend + game.additionalTime;
        nextTimeLeft = game.whiteTimeLeft;
        game.whiteTurnStarterAt = new Date();
      } else {
        throw new Error(`Invalid player color ${game.currentPlayer}`);
      }

      nextTimeoutWinner =
        game.currentPlayer === 'white'
          ? game.whitePlayer!.username
          : game.blackPlayer!.username;
      isActiveGame = game.gameStatus === 'playing';

      return await prisma.game.update({
        where: { id: id },
        data: {
          fen: res.newFen,
          currentPlayer: game.currentPlayer === 'white' ? 'black' : 'white',
          whiteTimeLeft:
            game.currentPlayer === 'white'
              ? Math.max(timeLeft, 0)
              : game.whiteTimeLeft,
          whiteTurnStarterAt:
            game.currentPlayer === 'white' ? null : game.whiteTurnStarterAt,
          blackTimeLeft:
            game.currentPlayer === 'black'
              ? Math.max(timeLeft, 0)
              : game.blackTimeLeft,
          blackTurnStarterAt:
            game.currentPlayer === 'black' ? null : game.blackTurnStarterAt,
          fromX: highlightLastMove.from.col,
          fromY: highlightLastMove.from.row,
          toX: highlightLastMove.to.col,
          toY: highlightLastMove.to.row,
          gameStatus: game.gameStatus,
          winner: game.winner,
        },
      });
    });
    if (nextTimeLeft !== null && nextTimeoutWinner && isActiveGame)
      this.scheduleTimeout(id, nextTimeLeft * 1000, nextTimeoutWinner, server);
    else {
      clearTimeout(this.gameTimers.get(id));
      this.gameTimers.delete(id);
    }
    return result;
  }

  async addExtraTime(
    gameId: number,
    fromUserId: number,
    server: Server,
  ): Promise<Game> {
    const game = await this.prisma.game.findUnique({
      where: { id: gameId },
      include: { whitePlayer: true, blackPlayer: true },
    });
    if (!game) throw new Error('Game not found!');
    console.log(game.blackTimeLeft);
    const nextTimeoutWinner =
      game.currentPlayer === 'black'
        ? game.blackPlayer!.username
        : game.whitePlayer!.username;
    if (game?.gameStatus !== 'playing') {
      throw new Error('Game is not active!');
    } //
    if (game.blackTimeLeft <= 0 || game.whiteTimeLeft <= 0) {
      throw new Error("Time's up!");
    }
    if (game.whitePlayerId === fromUserId) {
      const updated = await this.prisma.game.update({
        where: { id: gameId },
        data: { blackTimeLeft: { increment: 15 } },
      });
      const nextTimeLeft =
        updated.currentPlayer === 'black'
          ? updated.whiteTimeLeft
          : updated.blackTimeLeft;
      this.scheduleTimeout(
        gameId,
        nextTimeLeft * 1000,
        nextTimeoutWinner,
        server,
      );
      return updated;
    } else if (game.blackPlayerId === fromUserId) {
      const updated = await this.prisma.game.update({
        where: { id: gameId },
        data: { whiteTimeLeft: { increment: 15 } },
      });
      const nextTimeLeft =
        updated.currentPlayer === 'black'
          ? updated.whiteTimeLeft
          : updated.blackTimeLeft;
      this.scheduleTimeout(
        gameId,
        nextTimeLeft * 1000,
        nextTimeoutWinner,
        server,
      );
      return updated;
    } else {
      throw new Error('Only participants in this game can add extra time!');
    }
  }

  async handleDrawOffer(gameId: number, offeredById: number): Promise<Game> {
    const game = await this.prisma.game.findUnique({ where: { id: gameId } });
    if (!game) throw new Error('Game not found!');
    if (game.drawOfferedBy !== null) throw new Error('Draw already offered');
    if (game.gameStatus !== 'playing') throw new Error('Game is not active');
    if (
      game?.whitePlayerId !== offeredById &&
      game?.blackPlayerId !== offeredById
    )
      throw new Error('Only a participant this game can propose a draw!');
    return await this.prisma.game.update({
      where: { id: gameId },
      data: { drawOfferedBy: offeredById },
    });
  }

  async handleDrawResponse(
    gameId: number,
    responsedBy: number,
    response: boolean,
  ): Promise<Game> {
    const game = await this.prisma.game.findUnique({ where: { id: gameId } });
    if (!game) throw new Error('Game not found!');
    if (game.gameStatus !== 'playing') throw new Error('Game is not active');
    if (game.drawOfferedBy === null) throw new Error('No pending draw offer');
    if (responsedBy === game.drawOfferedBy)
      throw new Error('Cannot respond to your own draw offer');
    if (
      responsedBy !== game.whitePlayerId &&
      responsedBy !== game.blackPlayerId
    )
      throw new Error('Only a participant this game can accept a draw!');
    if (response) {
      clearTimeout(this.gameTimers.get(gameId));
      this.gameTimers.delete(gameId);
      return await this.prisma.game.update({
        where: { id: gameId },
        data: { gameStatus: 'draw' },
        include: {
          whitePlayer: { select: { username: true } },
          blackPlayer: { select: { username: true } },
        },
      });
    } else {
      return await this.prisma.game.update({
        where: { id: gameId },
        data: { drawOfferedBy: null },
        include: {
          whitePlayer: { select: { username: true } },
          blackPlayer: { select: { username: true } },
        },
      });
    }
  }

  async resign(id: number, loserId: number) {
    const game = await this.prisma.game.findUnique({ where: { id } });
    if (game?.whitePlayerId !== loserId && game?.blackPlayerId !== loserId) {
      throw new Error('Only participants in this game can give up!');
    }
    if (game.gameStatus !== 'playing') {
      throw new Error('Game is already finished!');
    }
    const winnerId =
      loserId === game?.whitePlayerId
        ? game.blackPlayerId
        : loserId === game?.blackPlayerId
          ? game.whitePlayerId
          : null;
    if (!winnerId) throw new Error(`Winner id was not found`);
    const winner = await this.prisma.user.findUnique({
      where: { id: winnerId },
    });
    if (!winner) throw new Error('Winner was not found');
    return await this.prisma.game.update({
      where: { id },
      data: {
        winner: winner?.username,
        gameStatus: 'resign',
      },
    });
  }
}

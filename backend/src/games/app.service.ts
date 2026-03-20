import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateGameDto } from './dto/createGame.dto';
import { JoinGameDto } from './dto/joinGame.dto';
import { MakeMoveDto } from './dto/makeMove.dto';
import { boardToFen } from 'src/helpers';
import { Chess } from 'chess.js';
import { validateMove } from 'src/helpers/validateMove';
import { generateInviteCode } from 'src/helpers/generateInviteCode';
import { joinGameByCodeDto } from './dto/joinGameByCode';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  async createGame(dto: CreateGameDto) {
    const { boardState, whitePlayerUsername, initialTime } = dto;
    const fen = boardToFen(
      boardState.map((square) => ({
        color: square.color,
        position: square.position,
        piece: square.piece ? square.piece : null,
      })),
      'white',
    );
    const user = await this.prisma.user.findUnique({
      where: { username: whitePlayerUsername },
    });
    if (!user) throw new Error('user didnt exist');
    const inviteCode = generateInviteCode();
    return this.prisma.game.create({
      data: {
        fen: fen,
        currentPlayer: 'white',
        whitePlayerId: user?.id,
        initialTime,
        whiteTimeLeft: initialTime,
        blackTimeLeft: initialTime,
        inviteCode,
      },
    });
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
      console.log('Game with code not founded');
      throw new Error('Game with code not founded ');
    }
    if (game.blackPlayerId) {
      throw new Error('Game is already full');
    }
    if (game.whitePlayerId === user.id) {
      throw new Error('You cannot join your own game');
    }
    return await this.prisma.game.update({
      where: { id: id },
      data: { blackPlayerId: Number(user.id) },
      include: { whitePlayer: true, blackPlayer: true },
    });
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
      console.log('Game with code not founded');
      throw new Error('Game with code not founded ');
    }
    if (game.blackPlayerId) {
      throw new Error('Game is already full');
    }
    if (game.whitePlayerId === user.id) {
      throw new Error('You cannot join your own game');
    }
    return await this.prisma.game.update({
      where: { id: game.id },
      data: { blackPlayerId: Number(user.id) },
      include: { whitePlayer: true, blackPlayer: true },
    });
  }

  async getGames() {
    const games = await this.prisma.game.findMany({
      include: {
        whitePlayer: { select: { username: true } },
        blackPlayer: { select: { username: true } },
      },
    });
    if (!games.length) {
      console.log('Games not found');
      throw new NotFoundException('Games not found');
    }
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

  async makeMove(id: number, dto: MakeMoveDto) {
    const { from, to, highlightLastMove } = dto;
    return this.prisma.$transaction(async (prisma) => {
      const game = await prisma.game.findUnique({
        where: {
          id: id,
        },
      });
      if (!game) {
        console.log('game not found');
        throw new Error('game not found');
      }
      let turnStartedAt: Date | null = null;
      let timeLeft;
      const opponentTurnStartAt = new Date();
      const fen = new Chess(game.fen);
      const res = validateMove(fen, from, to);
      console.log('makeMove res: ', res.valid);
      if (!res.valid) {
        console.log('Invalid move');
        throw new Error('Invalid move');
      }
      if (res.valid) {
        if (game.gameStatus !== 'playing') {
          game.gameStatus = 'playing';
        }
        if (res.isCheck) {
          game.gameStatus = 'check';
        }
        if (res.isCheckmate) {
          game.gameStatus = 'checkmate';
        }
      }
      if (game.currentPlayer === 'white') {
        turnStartedAt = game.whiteTurnStarterAt;
        timeLeft = game.whiteTimeLeft;
        game.blackTurnStarterAt = new Date();
      } else if (game.currentPlayer === 'black') {
        turnStartedAt = game.blackTurnStarterAt;
        timeLeft = game.blackTimeLeft;
        game.whiteTurnStarterAt = new Date();
      } else {
        throw new Error(`Invalid player color ${game.currentPlayer}`);
      }
      if (turnStartedAt !== null) {
        const timeSpend = (Date.now() - turnStartedAt.getTime()) / 1000;
        timeLeft -= timeSpend;
      }

      return await prisma.game.update({
        where: { id: id },
        data: {
          fen: res.newFen,
          currentPlayer: game.currentPlayer === 'white' ? 'black' : 'white',
          whiteTimeLeft:
            game.currentPlayer === 'white' ? timeLeft : game.whiteTimeLeft,
          whiteTurnStarterAt:
            game.currentPlayer === 'white' ? null : opponentTurnStartAt,
          blackTimeLeft:
            game.currentPlayer === 'black' ? timeLeft : game.blackTimeLeft,
          blackTurnStarterAt:
            game.currentPlayer === 'black' ? null : opponentTurnStartAt,
          fromX: highlightLastMove.from.col,
          fromY: highlightLastMove.from.row,
          toX: highlightLastMove.to.col,
          toY: highlightLastMove.to.row,
          gameStatus: game.gameStatus,
        },
      });
    });
  }
}

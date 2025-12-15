import { Injectable } from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";
import { CreateGameDto } from "./dto/createGame.dto";
import { JoinGameDto } from "./dto/joinGame.dto";
import { MakeMoveDto } from "./dto/makeMove.dto";
import { SquareData } from "types/board";
import { Prisma } from "generated/prisma/browser";

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  async createGame(dto: CreateGameDto) {
    const { boardState, whitePlayerId, whiteTimeLeft, blackTimeLeft } = dto;
    return this.prisma.game.create({
      data: {
        boardState: boardState,
        currentPlayer: "white",
        whitePlayerId: whitePlayerId,
        whiteTimeLeft: whiteTimeLeft,
        blackTimeLeft: blackTimeLeft,
      },
    });
  }

  async joinGame(id: number, dto: JoinGameDto) {
    const { blackPlayerId } = dto;
    return await this.prisma.game.update({
      where: { id: id },
      data: { blackPlayerId: blackPlayerId },
    });
  }

  async getGame(id: number) {
    return await this.prisma.game.findUnique({
      where: { id: id },
    });
  }

  async makeMove(id: number, dto: MakeMoveDto) {
    const { from, to, whiteTimeLeft, blackTimeLeft } = dto;
    return this.prisma.$transaction(async (prisma) => {
      const game = await prisma.game.findUnique({
        where: {
          id: id,
        },
      });
      if (!game) throw new Error("game not found");
      const raw = game.boardState as unknown;
      if (!Array.isArray(raw)) throw new Error("invalid board state");
      const squares = raw as SquareData[];
      const prevSquare = squares.find(
        (el) => el.position.row === from.row && el.position.col === from.col
      );
      const square = squares.find((el) => el.position.row === to.row && el.position.col === to.col);
      if (!prevSquare || !square) throw new Error("invalid move positions");
      const piece = prevSquare.piece;
      if (!piece) throw new Error(`no piece at col ${from.col}-row ${from.row} position`);
      piece.position = to;
      prevSquare.piece = null;
      square.piece = piece;
      return await prisma.game.update({
        where: { id: id },
        data: {
          boardState: squares as unknown as Prisma.InputJsonValue,
          currentPlayer: game.currentPlayer === "white" ? "black" : "white",
          whiteTimeLeft,
          blackTimeLeft,
        },
      });
    });
  }
}

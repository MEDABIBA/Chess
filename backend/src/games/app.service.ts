import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";
import { CreateGameDto } from "./dto/createGame.dto";
import { JoinGameDto } from "./dto/joinGame.dto";
import { MakeMoveDto } from "./dto/makeMove.dto";
import { boardToFen } from "src/helpers";
import { Chess } from "chess.js";
import { validateMove } from "src/helpers/validateMove";

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  async createGame(dto: CreateGameDto) {
    const { boardState, whitePlayerId, whiteTimeLeft, blackTimeLeft } = dto;
    const fen = boardToFen(
      boardState.map((square) => ({
        color: square.color,
        position: square.position,
        piece: square.piece ? square.piece : null,
      })),
      "white",
    );
    return this.prisma.game.create({
      data: {
        fen: fen,
        currentPlayer: "white",
        whitePlayerId: Number(whitePlayerId),
        whiteTimeLeft: whiteTimeLeft,
        blackTimeLeft: blackTimeLeft,
      },
    });
  }

  async joinGame(id: number, dto: JoinGameDto) {
    const { blackPlayerId } = dto;
    return await this.prisma.game.update({
      where: { id: id },
      data: { blackPlayerId: Number(blackPlayerId) },
    });
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
      console.log("game not found");
      throw new NotFoundException("game not found");
    }
  }

  async makeMove(id: number, dto: MakeMoveDto) {
    const { from, to, whiteTimeLeft, blackTimeLeft } = dto;
    return this.prisma.$transaction(async (prisma) => {
      const game = await prisma.game.findUnique({
        where: {
          id: id,
        },
      });
      if (!game) {
        console.log("game not found");
        throw new Error("game not found");
      }
      const fen = new Chess(game.fen);
      const res = validateMove(fen, from, to);

      if (!res.valid) {
        console.log("Invalid move");
        throw new Error("Invalid move");
      }

      return await prisma.game.update({
        where: { id: id },
        data: {
          fen: res.newFen,
          currentPlayer: game.currentPlayer === "white" ? "black" : "white",
          whiteTimeLeft,
          blackTimeLeft,
        },
      });
    });
  }
}

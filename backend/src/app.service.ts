import { Injectable } from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";
import { CreateGameDto } from "./dto/createGame.dto";
import { JoinGameDto } from "./dto/joinGame.dto";
import { MakeMoveDto } from "./dto/makeMove.dto";

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
    return "joinGame logic";
  }

  async getGame(id: number) {
    return "getGame logic";
  }

  async makeMove(id: number, dto: MakeMoveDto) {
    const { from, to } = dto;
    return "makeMove logic";
  }
}

import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post } from "@nestjs/common";
import { AppService } from "./app.service";
import { CreateGameDto } from "./dto/createGame.dto";
import { JoinGameDto } from "./dto/joinGame.dto";
import { MakeMoveDto } from "./dto/makeMove.dto";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post("games")
  async createGame(
    @Body()
    createGameOptions: CreateGameDto
  ) {
    return await this.appService.createGame(createGameOptions);
  }

  @Patch("games/:id/join")
  async joinGame(@Param("id", ParseIntPipe) id: number, @Body() joinGameOptions: JoinGameDto) {
    return await this.appService.joinGame(id, joinGameOptions);
  }

  @Get("games/:id")
  async getGame(@Param("id", ParseIntPipe) id: number) {
    return await this.appService.getGame(id);
  }
  @Post("games/:id/move")
  async makeMove(@Param("id", ParseIntPipe) id: number, @Body() moveData: MakeMoveDto) {
    return await this.appService.makeMove(id, moveData);
  }
}

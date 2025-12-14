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
    await this.appService.createGame(createGameOptions);
  }

  @Patch("games/:id/join")
  joinGame(@Param("id", ParseIntPipe) id: number, @Body() joinGameOptions: JoinGameDto) {
    return this.appService.joinGame(id, joinGameOptions);
  }

  @Get("games/:id")
  getGame(@Param("id", ParseIntPipe) id: number) {
    return this.appService.getGame(id);
  }
  @Post("games/:id/move")
  makeMove(@Param("id", ParseIntPipe) id: number, @Body() moveData: MakeMoveDto) {
    return this.appService.makeMove(id, moveData);
  }
}

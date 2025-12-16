import { IsEnum, IsInt, IsObject, IsString, Min } from "class-validator";

export class CreateGameDto {
  @IsObject()
  boardState: object;

  @IsEnum(["white", "black"])
  currentPlayer: "white" | "black";

  @IsString()
  whitePlayerId: string;

  @IsInt()
  @Min(0)
  whiteTimeLeft: number;

  @IsInt()
  @Min(0)
  blackTimeLeft: number;
}

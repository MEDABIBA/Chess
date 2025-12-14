import { IsInt, IsObject, IsString, Min } from "class-validator";

export class CreateGameDto {
  @IsObject()
  boardState: object;

  currentPLayer: "white" | "black";

  @IsString()
  whitePlayerId: string;

  @IsInt()
  @Min(0)
  whiteTimeLeft: number;
  blackTimeLeft: number;
}

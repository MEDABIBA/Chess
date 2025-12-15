import { IsInt, IsString } from "class-validator";
import { Position } from "types/board";

export class MakeMoveDto {
  @IsString()
  from: Position;
  to: Position;

  @IsInt()
  whiteTimeLeft: number;
  blackTimeLeft: number;
}

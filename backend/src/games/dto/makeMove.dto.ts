import { IsInt, IsString } from "class-validator";

class PositionDto {
  @IsInt()
  row: number;

  @IsInt()
  col: number;
}

export class MakeMoveDto {
  @IsString()
  from: PositionDto;
  to: PositionDto;
  highlightLastMove: { from: PositionDto; to: PositionDto };

  @IsInt()
  whiteTimeLeft: number;
  blackTimeLeft: number;
}

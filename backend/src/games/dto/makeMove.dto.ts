import { IsInt, IsString } from 'class-validator';
import { PieceType } from 'src/types/board';

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
  promotionPiece?: PieceType;
}

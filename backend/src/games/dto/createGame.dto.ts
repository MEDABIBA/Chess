import { Type } from "class-transformer";
import {
  IsArray,
  isArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from "class-validator";

class PositionDto {
  @IsNumber()
  row: number;

  @IsNumber()
  col: number;
}

class PieceDto {
  @IsEnum(["pawn", "rook", "knight", "bishop", "queen", "king"])
  pieceType: "pawn" | "rook" | "knight" | "bishop" | "queen" | "king";

  @IsEnum(["white", "black"])
  color: "white" | "black";

  @ValidateNested()
  @Type(() => PositionDto)
  position: PositionDto;

  @IsBoolean()
  hasMoved: boolean;
}

class SquareDto {
  @IsEnum(["white", "black"])
  color: "white" | "black";

  @ValidateNested()
  @Type(() => PositionDto)
  position: PositionDto;

  @Type(() => PieceDto)
  @IsOptional() // потому что piece может быть null
  piece?: PieceDto | null;
}

export class CreateGameDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SquareDto)
  boardState: SquareDto[][];

  // @IsEnum(["white", "black"])
  // currentPlayer: "white" | "black";

  @IsString()
  whitePlayerId: string;

  @IsInt()
  @Min(0)
  whiteTimeLeft: number;

  @IsInt()
  @Min(0)
  blackTimeLeft: number;
}

import Piece from "../models/Piece";

export interface Position {
  row: number;
  col: number;
}

export type Color = "white" | "black";

export enum PieceType {
  PAWN = "pawn",
  ROOK = "rook",
  KNIGHT = "knight",
  BISHOP = "bishop",
  QUEEN = "queen",
  KING = "king",
}

export const PropotionPieceType: PieceType[] = [
  PieceType.QUEEN,
  PieceType.BISHOP,
  PieceType.KNIGHT,
  PieceType.ROOK,
];

export type SquareData = {
  color: Color;
  position: Position;
  piece: Piece | null;
};

export type Color = "white" | "black";
export enum PieceType {
  PAWN = "pawn",
  ROOK = "rook",
  KNIGHT = "knight",
  BISHOP = "bishop",
  QUEEN = "queen",
  KING = "king",
}
export interface Position {
  row: number;
  col: number;
}
export interface Piece {
  pieceType: PieceType;
  color: Color;
  position: Position;
  hasMoved: boolean;
}

export interface SquareData {
  color: Color;
  position: Position;
  piece: Piece | null;
}

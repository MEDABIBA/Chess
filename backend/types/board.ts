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
export type Piece = {
  pieceType: PieceType;
  color: Color;
  position: Position;
  hasMoved: boolean;
};

export type SquareData = {
  color: Color;
  position: Position;
  piece: Piece | null;
};

export type Color = 'white' | 'black';
export type PieceType =
  | 'pawn'
  | 'rook'
  | 'knight'
  | 'bishop'
  | 'queen'
  | 'king';
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

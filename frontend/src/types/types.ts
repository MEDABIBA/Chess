import Piece from "../models/Piece";

export type GameStatus = "playing" | "check" | "checkmate" | "timeout";

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

export interface GameInterface {
  blackPlayerId: string | null;
  blackTimeLeft: number;
  boardState: SquareData[][];
  createdAt: string;
  currentPlayer: "white" | "black";
  gameStatus: GameStatus;
  highlightLastMove: { from: Position; to: Position } | null;
  id: number;
  lastDoubleStepPawn: null | { color: Color; position: Position };
  updatedAt: string;
  whitePlayerId: string;
  whiteTimeLeft: number;
  winner: string | number;
}

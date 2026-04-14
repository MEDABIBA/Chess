import { JwtPayload } from 'jwt-decode';
import Piece from '../models/Piece';

export interface MyJwtPayload extends JwtPayload {
  username: string;
}

export type GameStatus =
  | 'playing'
  | 'checkmate'
  | 'timeout'
  | 'waiting'
  | 'resign'
  | 'draw'
  | 'stalemate';

export interface Position {
  row: number;
  col: number;
}

export type Color = 'white' | 'black';

export enum PieceType {
  PAWN = 'pawn',
  ROOK = 'rook',
  KNIGHT = 'knight',
  BISHOP = 'bishop',
  QUEEN = 'queen',
  KING = 'king',
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

type Nicknames = {
  whitePlayer: {
    username: string;
  };
  blackPlayer: {
    username: string;
  } | null;
};

interface Game {
  whitePlayerId: string | null;
  blackPlayerId: string | null;
  blackTimeLeft: number;
  boardState: SquareData[][];
  createdAt: Date;
  currentPlayer: 'white' | 'black';
  gameStatus: GameStatus;
  inviteCode: string;
  initialTime: number;
  additionalTime: number;
  fromX: number | null;
  fromY: number | null;

  toX: number | null;
  toY: number | null;
  id: number;
  lastDoubleStepPawn: null | { color: Color; position: Position };
  updatedAt: string;
  whitePlayerUsername: string;
  whiteTimeLeft: number;
  drawOfferedBy: number;
  winner: string;
}

export type GameInterface = Nicknames & Game;

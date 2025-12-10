import Piece from "../models/Piece";
import { Position } from "../types/types";

export const simulateValidMove = (
  piece: Piece,
  from: Position,
  to: Position,
  getPiece: (from: Position) => Piece | null | undefined,
  setPiece: (to: Position, piece: Piece | null) => void,
  isKingUnderAttack: () => boolean
) => {
  const originalToPiece = getPiece(to);
  const originalPosition = piece.position;

  piece.position = to;
  setPiece(to, piece);
  setPiece(from, null);

  const stillUnderAttack = isKingUnderAttack();

  piece.position = originalPosition;
  setPiece(from, piece);
  setPiece(to, originalToPiece ?? null);

  return !stillUnderAttack;
};

import { Chess } from 'chess.js';
import { PieceType, Position } from '../types/board';

const formatter = (pos: Position) => {
  const row = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  return `${row[pos.col - 1]}${pos.row}`;
};

enum formattedPiece {
  rook = 'r',
  knight = 'n',
  bishop = 'b',
  queen = 'q',
}

export const validateMove = (
  chess: Chess,
  from: Position,
  to: Position,
  promotionPiece?: PieceType,
):
  | { valid: false }
  | {
      valid: true;
      newFen: string;
      isStalemate: boolean;
      isCheckmate: boolean;
    } => {
  try {
    const promotion = promotionPiece
      ? formattedPiece[promotionPiece as keyof typeof formattedPiece]
      : undefined;
    const move = chess.move({
      from: formatter(from),
      to: formatter(to),
      promotion: promotion?.slice(0, 1),
    });

    if (!move) {
      return { valid: false };
    }
    return {
      valid: true,
      newFen: chess.fen(),
      isStalemate: chess.isStalemate(),
      isCheckmate: chess.isCheckmate(),
    };
  } catch {
    return { valid: false };
  }
};

import { Chess } from "chess.js";
import { Position } from "types/board";

const formatter = (pos: Position) => {
  const row = ["a", "b", "c", "d", "e", "f", "g", "h"];
  return `${row[pos.col - 1]}${pos.row}`;
};

export const validateMove = (
  chess: Chess,
  from: Position,
  to: Position,
): { valid: false } | { valid: true; newFen: string } => {
  try {
    const move = chess.move({ from: formatter(from), to: formatter(to) });

    if (!move) {
      return { valid: false };
    }
    return { valid: true, newFen: chess.fen() };
  } catch {
    return { valid: false };
  }
};

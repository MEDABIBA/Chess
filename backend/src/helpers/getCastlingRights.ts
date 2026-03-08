import { SquareData } from "../types/board";

export function getCastlingRights(board: SquareData[]): string {
  let rights = "";

  const whiteKing = board.find((s) => s.position.row === 1 && s.position.col === 5)?.piece;
  const blackKing = board.find((s) => s.position.row === 8 && s.position.col === 5)?.piece;

  if (whiteKing && !whiteKing.hasMoved) {
    const kRook = board.find((s) => s.position.row === 1 && s.position.col === 8)?.piece;
    const qRook = board.find((s) => s.position.row === 1 && s.position.col === 1)?.piece;
    if (kRook && !kRook.hasMoved) rights += "K";
    if (qRook && !qRook.hasMoved) rights += "Q";
  }

  if (blackKing && !blackKing.hasMoved) {
    const kRook = board.find((s) => s.position.row === 8 && s.position.col === 8)?.piece;
    const qRook = board.find((s) => s.position.row === 8 && s.position.col === 1)?.piece;
    if (kRook && !kRook.hasMoved) rights += "k";
    if (qRook && !qRook.hasMoved) rights += "q";
  }

  return rights || "-";
}

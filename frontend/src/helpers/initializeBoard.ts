import Piece from "../models/Piece";
import { Color, PieceType, Position } from "../types/types";

const createInitialPiece = (position: Position, color: Color): Piece | null => {
  const col = position.col;
  const pieceType =
    col === 1 || col === 8
      ? PieceType.ROOK
      : col === 2 || col === 7
        ? PieceType.KNIGHT
        : col === 3 || col === 6
          ? PieceType.BISHOP
          : col === 4
            ? PieceType.QUEEN
            : col === 5
              ? PieceType.KING
              : null;
  if (pieceType === null) {
    return null;
  }
  if (position.row === 2) {
    return new Piece(PieceType.PAWN, position, "white");
  }
  if (position.row === 1) {
    return new Piece(pieceType, position, "white");
  }
  if (position.row === 7) {
    return new Piece(PieceType.PAWN, position, "black");
  }
  if (position.row === 8) {
    return new Piece(pieceType, position, "black");
  }
  return null;
};

export const initializeBoard = () => {
  const board = [];
  for (let row = 8; row > 0; row--) {
    for (let col = 1; col < 9; col++) {
      const color = (row + col) % 2 === 0 ? "black" : "white";
      const position = {
        row,
        col,
      };
      board.push({
        color,
        position,
        piece: createInitialPiece(position, color),
      });
    }
  }
  return board;
};

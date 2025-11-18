import { Color, PieceType, Position } from "../types/types";
import pawnWhite from "../assets/figures/pawn-white.png";
import pawnBlack from "../assets/figures/pawn-black.png";
import rookWhite from "../assets/figures/rook-white.png";
import rookBlack from "../assets/figures/rook-black.png";
import knightWhite from "../assets/figures/knight-white.png";
import knightBlack from "../assets/figures/knight-black.png";
import bishopWhite from "../assets/figures/bishop-white.png";
import bishopBlack from "../assets/figures/bishop-black.png";
import queenWhite from "../assets/figures/queen-white.png";
import queenBlack from "../assets/figures/queen-black.png";
import kingWhite from "../assets/figures/king-white.png";
import kingBlack from "../assets/figures/king-black.png";

class Piece {
  pieceType: PieceType;
  color: Color;
  position: Position;
  hasMoved: boolean;

  constructor(pieceType: PieceType, position: Position, color: Color) {
    this.color = color;
    this.pieceType = pieceType;
    this.position = position;
    this.hasMoved = false;
  }

  getPiece() {
    const pieces: Record<string, string> = {
      "pawn-white": pawnWhite,
      "pawn-black": pawnBlack,
      "rook-white": rookWhite,
      "rook-black": rookBlack,
      "knight-white": knightWhite,
      "knight-black": knightBlack,
      "bishop-white": bishopWhite,
      "bishop-black": bishopBlack,
      "queen-white": queenWhite,
      "queen-black": queenBlack,
      "king-white": kingWhite,
      "king-black": kingBlack,
    };
    return pieces[`${this.pieceType}-${this.color}`];
  }
}

export default Piece;

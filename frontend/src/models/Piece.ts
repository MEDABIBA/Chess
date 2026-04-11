import { Color, PieceType, Position } from '../types/types';
import pawnWhite from '../assets/figures/pawn-white.svg';
import pawnBlack from '../assets/figures/pawn-black.svg';
import rookWhite from '../assets/figures/rook-white.svg';
import rookBlack from '../assets/figures/rook-black.svg';
import knightWhite from '../assets/figures/knight-white.svg';
import knightBlack from '../assets/figures/knight-black.svg';
import bishopWhite from '../assets/figures/bishop-white.svg';
import bishopBlack from '../assets/figures/bishop-black.svg';
import queenWhite from '../assets/figures/queen-white.svg';
import queenBlack from '../assets/figures/queen-black.svg';
import kingWhite from '../assets/figures/king-white.svg';
import kingBlack from '../assets/figures/king-black.svg';

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
      'pawn-white': pawnWhite,
      'pawn-black': pawnBlack,
      'rook-white': rookWhite,
      'rook-black': rookBlack,
      'knight-white': knightWhite,
      'knight-black': knightBlack,
      'bishop-white': bishopWhite,
      'bishop-black': bishopBlack,
      'queen-white': queenWhite,
      'queen-black': queenBlack,
      'king-white': kingWhite,
      'king-black': kingBlack,
    };
    return pieces[`${this.pieceType}-${this.color}`];
  }
}

export default Piece;

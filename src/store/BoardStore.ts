import { action, makeAutoObservable } from "mobx";
import { Color, PieceType, Position, SquareData } from "../types/types";
import Piece from "../models/Piece";

class BoardStore {
  board: SquareData[] = [];
  currentPlayer: Color = "white";
  gameStatus: "playing" | "check" | "checkmate" = "playing";

  constructor() {
    makeAutoObservable(this);
    this.initializeBoard();
  }

  @action
  initializeBoard = () => {
    for (let row = 8; row > 0; row--) {
      for (let col = 1; col < 9; col++) {
        const color = (row + col) % 2 === 0 ? "black" : "white";
        const position = {
          row,
          col,
        };
        this.board.push({
          color,
          position,
          piece: this.createInitialPiece(position, color),
        });
      }
    }
  };

  @action
  createInitialPiece = (position: Position, color: Color): Piece | null => {
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

  @action
  getPiece = (from: Position) => {
    return this.board.find(
      (el) => el.position.col === from.col && el.position.row === from.row
    )?.piece;
  };

  @action
  setPiece = (to: Position, piece: Piece | null) => {
    const boardSetPiece = this.board.find(
      (el) => el.position.col === to.col && el.position.row === to.row
    );
    if (!boardSetPiece && boardSetPiece == null) return;
    boardSetPiece.piece = piece;
  };

  @action
  movePiece = (from: Position, to: Position): void => {
    const piece = this.getPiece(from);

    if (!piece) {
      console.warn("No piece at this position");
      return;
    }
    if (!this.isValidMove(piece, from, to)) {
      console.warn("Invalid move");
      return;
    }

    this.currentPlayer = this.currentPlayer === "black" ? "white" : "black";
    piece.position = to;
    this.setPiece(to, piece);
    this.setPiece(from, null);
  };

  private isPathClear = (from: Position, to: Position) => {
    const start = Math.min(from.col, to.col) + 1;
    const end = Math.max(from.col, to.col);
    for (let r = start; r < end; r++) {
      if (this.getPiece({ row: from.row, col: r })) return false;
    }
  };
  private isValidPawnMove = (figure: Piece, from: Position, to: Position) => {
    const dir = figure.color === "white" ? 1 : -1;
    const startingPos = figure.color === "white" ? 2 : 7;
    if (from.col === to.col) {
      if (to.row === from.row + dir) {
        return !this.getPiece(to);
      } else if (from.row === startingPos && to.row === from.row + 2 * dir) {
        const middlePos = { row: from.row + dir, col: from.col };
        return !this.getPiece(middlePos) && !this.getPiece(to);
      }
    } else if (
      to.row === from.row + dir &&
      (from.col === to.col + 1 || from.col === to.col - 1)
    ) {
      return (
        !!this.getPiece(to)?.color && this.getPiece(to)?.color !== figure.color
      );
    }
  };
  private isValidRookMove = (from: Position, to: Position) => {
    if (from.row === to.row) {
      this.isPathClear(from, to);
      return true;
    } else if (from.col === to.col) {
      this.isPathClear(from, to);
      return true;
    }
  };
  private isValidKnightMove = (from: Position, to: Position) => {
    const rowDiff = Math.abs(from.row - to.row);
    const colDiff = Math.abs(from.col - to.col);
    return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
  };

  @action
  isValidMove = (figure: Piece, from: Position, to: Position) => {
    if (figure.color !== this.currentPlayer) return false;
    if (figure.color === this.getPiece(to)?.color) return false;
    if (from.col === to.col && from.row === to.row) return false;

    switch (figure.pieceType) {
      case "pawn":
        return this.isValidPawnMove(figure, from, to);
      case "rook":
        return this.isValidRookMove(from, to);
      case "knight":
        return this.isValidKnightMove(from, to);
      case "bishop":
        return false;
      case "queen":
        return false;
      case "king":
        return false;
      default:
        return false;
    }
  };
}
export default BoardStore;

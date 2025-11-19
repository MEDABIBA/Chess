import { action, makeAutoObservable } from "mobx";
import Piece from "../models/Piece";
import { Position, Color } from "../types/types";
import { RootStore } from "./RootStore";

class ChessMoveValidator {
  private store: RootStore;

  constructor(store: RootStore) {
    this.store = store;
    makeAutoObservable(this);
  }

  @action
  isValidMove = (figure: Piece, from: Position, to: Position) => {
    if (figure.color !== this.store.boardStore.currentPlayer) return false;
    if (figure.color === this.store.boardStore.getPiece(to)?.color)
      return false;
    if (from.col === to.col && from.row === to.row) return false;

    switch (figure.pieceType) {
      case "pawn":
        return this.isValidPawnMove(figure, from, to);
      case "rook":
        return this.isValidRookMove(from, to);
      case "knight":
        return this.isValidKnightMove(from, to);
      case "bishop":
        return this.isValidBishopMove(from, to);
      case "queen":
        return this.isValidQueenMove(from, to);
      case "king":
        return this.isValidKingMove(from, to);
      default:
        return false;
    }
  };

  private isAttackedField = (position: Position, byColor: Color) => {
    for (const square of this.store.boardStore.board) {
      if (square.piece === null || square.piece.color === byColor) continue;
      const piece = square.piece;
      if (this.canPieceAttack(piece, piece?.position, position)) {
        return true;
      }
    }
    return false;
  };

  isPathClear = (from: Position, to: Position) => {
    // row vertical ||
    if (from.row === to.row) {
      const start = Math.min(from.col, to.col) + 1;
      const end = Math.max(from.col, to.col);
      for (let r = start; r < end; r++) {
        if (this.store.boardStore.getPiece({ row: from.row, col: r }))
          return false;
      }
      return true;
      // col horizontal --
    } else if (from.col === to.col) {
      const start = Math.min(from.row, to.row) + 1;
      const end = Math.max(from.row, to.row);
      for (let r = start; r < end; r++) {
        if (this.store.boardStore.getPiece({ row: r, col: from.col }))
          return false;
      }
      return true;
    }
    // diagonal
    else if (Math.abs(from.row - to.row) === Math.abs(from.col - to.col)) {
      const steps = Math.abs(from.row - to.row);
      const rowDir = from.row < to.row ? 1 : -1;
      const colDir = from.col < to.col ? 1 : -1;
      for (let i = 1; i < steps; i++) {
        if (
          this.store.boardStore.getPiece({
            row: from.row + i * rowDir,
            col: from.col + i * colDir,
          })
        ) {
          return false;
        }
      }
      return true;
    }
    return true;
  };

  private isValidPawnMove = (figure: Piece, from: Position, to: Position) => {
    const dir = figure.color === "white" ? 1 : -1;
    const startingPos = figure.color === "white" ? 2 : 7;
    if (from.col === to.col) {
      if (to.row === from.row + dir) {
        return !this.store.boardStore.getPiece(to);
      } else if (from.row === startingPos && to.row === from.row + 2 * dir) {
        const middlePos = { row: from.row + dir, col: from.col };
        return (
          !this.store.boardStore.getPiece(middlePos) &&
          !this.store.boardStore.getPiece(to)
        );
      }
    } else if (
      to.row === from.row + dir &&
      (from.col === to.col + 1 || from.col === to.col - 1)
    ) {
      return (
        !!this.store.boardStore.getPiece(to)?.color &&
        this.store.boardStore.getPiece(to)?.color !== figure.color
      );
    }
  };

  private isValidRookMove = (from: Position, to: Position) => {
    return from.row === to.row || from.col === to.col
      ? this.isPathClear(from, to)
      : false;
  };

  private isValidKnightMove = (from: Position, to: Position) => {
    const rowDiff = Math.abs(from.row - to.row);
    const colDiff = Math.abs(from.col - to.col);
    return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
  };

  private isValidBishopMove = (from: Position, to: Position) => {
    const rowDiff = Math.abs(from.row - to.row);
    const colDiff = Math.abs(from.col - to.col);
    return this.isPathClear(from, to) && rowDiff === colDiff;
  };

  private isValidQueenMove = (from: Position, to: Position) => {
    const rowDiff = Math.abs(from.row - to.row);
    const colDiff = Math.abs(from.col - to.col);
    return (
      this.isPathClear(from, to) &&
      (rowDiff === colDiff || from.row === to.row || from.col === to.col)
    );
  };

  private isValidKingMove = (from: Position, to: Position) => {
    const rowDiff = Math.abs(from.row - to.row);
    const colDiff = Math.abs(from.col - to.col);
    return (
      rowDiff <= 1 &&
      colDiff <= 1 &&
      !this.isAttackedField(to, this.store.boardStore.currentPlayer)
    );
  };

  private canPieceAttack = (piece: Piece, from: Position, to: Position) => {
    if (from.col === to.col && from.row === to.row) return false;

    switch (piece.pieceType) {
      case "pawn":
        return this.canPawnAttack(piece, from, to);
      case "rook":
        return this.isValidRookMove(from, to);
      case "knight":
        return this.isValidKnightMove(from, to);
      case "bishop":
        return this.isValidBishopMove(from, to);
      case "queen":
        return this.isValidQueenMove(from, to);
      case "king":
        return this.canKingAttack(from, to);
      default:
        return false;
    }
  };

  private canPawnAttack = (pawn: Piece, from: Position, to: Position) => {
    const direction = pawn.color === "white" ? 1 : -1;
    const rowDiff = to.row - from.row;
    const colDiff = Math.abs(to.col - from.col);

    return rowDiff === direction && colDiff === 1;
  };

  private canKingAttack = (from: Position, to: Position) => {
    const rowDiff = Math.abs(to.row - from.row);
    const colDiff = Math.abs(to.col - from.col);
    return rowDiff <= 1 && colDiff <= 1;
  };
}

export default ChessMoveValidator;

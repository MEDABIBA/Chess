import { action, makeAutoObservable } from "mobx";
import Piece from "../models/Piece";
import { Position, Color, SquareData } from "../types/types";
import { RootStore } from "./RootStore";
import { simulateValidMove } from "../helpers/simulateMove";

class ChessMoveValidator {
  private store: RootStore;

  constructor(store: RootStore) {
    this.store = store;
    makeAutoObservable(this);
  }

  @action
  isValidMove = (piece: Piece, from: Position, to: Position) => {
    if (piece.color !== this.store.board.currentPlayer) return false;
    if (piece.color === this.store.board.getPiece(to)?.color) return false;
    if (from.col === to.col && from.row === to.row) return false;

    let valid = false;
    switch (piece.pieceType) {
      case "pawn":
        valid = this.isValidPawnMove(piece, from, to);
        break;
      case "rook":
        valid = this.isValidRookMove(from, to);
        break;
      case "knight":
        valid = this.isValidKnightMove(from, to);
        break;
      case "bishop":
        valid = this.isValidBishopMove(from, to);
        break;
      case "queen":
        valid = this.isValidQueenMove(from, to);
        break;
      case "king":
        valid = this.isValidKingMove(piece, from, to);
        break;
      default:
        return false;
    }
    if (valid) {
      return simulateValidMove(
        piece,
        from,
        to,
        this.store.board.getPiece,
        this.store.board.setPiece,
        this.isKingUnderAttack
      );
    }
  };

  private isAttackedField = (position: Position, byColor: Color) => {
    for (const square of this.store.board.board) {
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
        if (this.store.board.getPiece({ row: from.row, col: r })) return false;
      }
      return true;
      // col horizontal --
    } else if (from.col === to.col) {
      const start = Math.min(from.row, to.row) + 1;
      const end = Math.max(from.row, to.row);
      for (let r = start; r < end; r++) {
        if (this.store.board.getPiece({ row: r, col: from.col })) return false;
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
          this.store.board.getPiece({
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
    const attackedPiece = this.store.board.getPiece(to);
    const isEnPassant = this.store.board.getPiece({ row: to.row - dir, col: to.col });
    const lastDoubleStepPawn = this.store.board.lastDoubleStepPawn;
    if (from.col === to.col) {
      if (to.row === from.row + dir) {
        return !attackedPiece;
      } else if (from.row === startingPos && to.row === from.row + 2 * dir) {
        const middlePos = { row: from.row + dir, col: from.col };
        return !this.store.board.getPiece(middlePos) && !attackedPiece;
      } else return false;
    } else if (to.row === from.row + dir && (from.col === to.col + 1 || from.col === to.col - 1)) {
      if (!!attackedPiece?.color && attackedPiece?.color !== figure.color) {
        return true;
      } else if (
        lastDoubleStepPawn &&
        isEnPassant?.position.col === lastDoubleStepPawn.position.col &&
        isEnPassant?.position.row === lastDoubleStepPawn.position.row &&
        isEnPassant?.color !== figure.color
      ) {
        return true;
      }
      return false;
    } else return false;
  };

  private isValidRookMove = (from: Position, to: Position) => {
    return from.row === to.row || from.col === to.col ? this.isPathClear(from, to) : false;
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

  private isValidKingMove = (piece: Piece, from: Position, to: Position) => {
    const side = from.col < to.col ? "right" : "left";
    if (this.isCastlingAvailable(side, piece, from, to)) return true;
    const rowDiff = Math.abs(from.row - to.row);
    const colDiff = Math.abs(from.col - to.col);
    const originalToPiece = this.store.board.getPiece(to);
    const originalPosition = piece.position;
    piece.position = to;
    this.store.board.setPiece(to, piece);
    this.store.board.setPiece(from, null);

    const stillUnderAttack = this.isAttackedField(to, this.store.board.currentPlayer);

    this.store.board.setPiece(from, piece);
    this.store.board.setPiece(to, originalToPiece ?? null);
    piece.position = originalPosition;
    return rowDiff <= 1 && colDiff <= 1 && !stillUnderAttack;
  };

  isCastlingAvailable = (side: "right" | "left", piece: Piece, from: Position, to: Position) => {
    const diff = Math.abs(from.col - to.col);
    const rookColPos = side === "left" ? 1 : 8;
    const rook = this.store.board.board.find(
      (el) => el.position.col === rookColPos && el.position.row === from.row
    )?.piece;
    if (
      from.row !== to.row ||
      piece.hasMoved ||
      !rook ||
      rook.hasMoved ||
      diff !== 2 ||
      !this.isPathClear(from, { row: to.row, col: rookColPos })
    )
      return false;
    if (side === "right" && rook.hasMoved ? false : true) {
      for (let i = from.col; i < to.col + 1; i++) {
        if (this.isAttackedField({ row: from.row, col: i }, piece.color)) {
          return false;
        } else continue;
      }
    } else if (side === "left" && rook.hasMoved ? false : true) {
      for (let i = from.col; i < to.col + 1; i++) {
        if (this.isAttackedField({ row: from.row, col: i }, piece.color)) {
          return false;
        } else continue;
      }
    } else return false;
    return true;
  };

  executeCastling = async (
    side: "left" | "right",
    king: Piece,
    from: Position,
    to: Position
  ): Promise<void> => {
    const rookFromCol = side === "left" ? 1 : 8;
    const rookToCol = side === "left" ? to.col + 1 : to.col - 1;
    const rook = this.store.board.getPiece({ row: from.row, col: rookFromCol });
    if (!rook) return;
    this.store.board.animateMove = {
      from: { row: from.row, col: rookFromCol },
      to: { row: to.row, col: rookToCol },
    };
    setTimeout(() => {
      rook.position = { row: to.row, col: rookToCol };
      this.store.board.setPiece({ row: to.row, col: rookToCol }, rook);
      this.store.board.setPiece({ row: from.row, col: rookFromCol }, null);
    }, 200);
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

  isKingUnderAttack = (currColPlayer: Color = this.store.board.currentPlayer) => {
    const king: SquareData | undefined = this.store.board.board.find(
      (e: any) => e.piece?.pieceType === "king" && e.piece?.color === currColPlayer
    );
    if (!king) return false;
    return this.isAttackedField(king.position, currColPlayer);
  };

  isCheckmate = (currColPlayer: Color) => {
    const allPieces = this.store.board.getAllPieces(currColPlayer);
    for (let i = 0; i < allPieces.length; i++) {
      const piece = allPieces[i];
      if (piece === undefined) continue;
      for (let i = 1; i <= 8; i++) {
        for (let j = 1; j <= 8; j++) {
          if (this.canMakeMove(piece, piece?.position, { row: i, col: j })) {
            return false;
          }
        }
      }
    }
    return true;
  };

  private canMakeMove = (piece: Piece, from: Position, to: Position) => {
    if (piece.color !== this.store.board.currentPlayer) return false;
    if (piece.color === this.store.board.getPiece(to)?.color) return false;
    if (from.col === to.col && from.row === to.row) return false;
    let valid = false;

    switch (piece.pieceType) {
      case "pawn":
        valid = this.isValidPawnMove(piece, from, to);
        break;
      case "rook":
        valid = this.isValidRookMove(from, to);
        break;
      case "knight":
        valid = this.isValidKnightMove(from, to);
        break;
      case "bishop":
        valid = this.isValidBishopMove(from, to);
        break;
      case "queen":
        valid = this.isValidQueenMove(from, to);
        break;
      case "king":
        valid = this.isValidKingMove(piece, from, to);
        break;
      default:
        return false;
    }
    if (!valid) return false;

    return simulateValidMove(
      piece,
      from,
      to,
      this.store.board.getPiece,
      this.store.board.setPiece,
      this.isKingUnderAttack
    );
  };
}

export default ChessMoveValidator;

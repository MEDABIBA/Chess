import { action, computed, makeAutoObservable } from "mobx";
import { Color, PieceType, Position, SquareData } from "../types/types";
import Piece from "../models/Piece";
import { RootStore } from "./RootStore";
import { simulateValidMove } from "../helpers/simulateMove";

class Board {
  store: RootStore;
  board: SquareData[] = [];
  currentPlayer: Color = "white";
  gameStatus: "playing" | "check" | "checkmate" = "playing";
  activePiece: Piece | null = null;
  highlightLastMoves: { from: Position; to: Position } | {} = {};
  availableMoves: Position[] = [];
  grab: Position | null = null;
  animateMove: { from: Position; to: Position } | null = null;

  constructor(store: RootStore) {
    this.store = store;
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
    return this.board.find((el) => el.position.col === from.col && el.position.row === from.row)
      ?.piece;
  };

  @action
  setPiece = (to: Position, piece: Piece | null) => {
    const boardSetPiece = this.board.find(
      (el) => el.position.col === to.col && el.position.row === to.row
    );
    if (!boardSetPiece) return;
    boardSetPiece.piece = piece;
  };

  @action
  getActivePiece = () => {
    return this.activePiece;
  };

  @action
  setActivePiece = (piece: Piece | null) => {
    this.activePiece = piece;
  };

  @action
  getGrab = () => {
    return this.grab;
  };

  @action
  setGrab = (position: Position | null) => {
    if (position !== this.grab) {
      this.grab = position;
    }
  };

  @action
  makeMove = (from: Position, to: Position, animation = false): void => {
    const piece = this.getPiece(from);
    if (!piece) {
      console.warn("No piece at this position");
      return;
    }
    if (!this.store.chessMoveValidator.isValidMove(piece, from, to)) {
      console.warn("Invalid move");
      return;
    }
    if (piece.pieceType !== "king" && this.store.chessMoveValidator.isKingUnderAttack()) {
      if (
        !simulateValidMove(
          piece,
          from,
          to,
          this.getPiece,
          this.setPiece,
          this.store.chessMoveValidator.isKingUnderAttack
        )
      ) {
        return;
      }
    }

    if (piece.color === "white") {
      const timer = this.store.timer;
      timer.deactiveTimer();
      timer.activateTimer("p2");
    } else if (piece.color === "black") {
      const timer = this.store.timer;
      timer.deactiveTimer();
      timer.activateTimer("p1");
    }
    this.highlightLastMoves = { from, to };

    if (animation) {
      this.animateMove = { from, to };
      setTimeout(() => {
        piece.position = to;
        this.setPiece(to, piece);
        this.setPiece(from, null);

        this.setActivePiece(null);
        this.availableMoves = [];
        this.currentPlayer = this.currentPlayer === "black" ? "white" : "black";
        this.animateMove = null;
      }, 200);
    } else {
      piece.position = to;
      this.setPiece(to, piece);
      this.setPiece(from, null);

      this.setActivePiece(null);
      this.availableMoves = [];
      this.currentPlayer = this.currentPlayer === "black" ? "white" : "black";
    }
  };

  @computed
  get availableMovesSet(): Set<string> {
    return new Set(this.availableMoves.map((pos) => `${pos.row}-${pos.col}`));
  }

  setAvailableMoves = (args: [Piece, Position] | null) => {
    this.availableMoves = [];
    if (!args) return;
    const [piece, position] = args;
    this.board.forEach((el) => {
      if (
        (this.store.chessMoveValidator.isValidMove(piece, position, el.position) &&
          !this.store.chessMoveValidator.isKingUnderAttack()) ||
        (this.store.chessMoveValidator.isKingUnderAttack() &&
          simulateValidMove(
            piece,
            position,
            el.position,
            this.getPiece,
            this.setPiece,
            this.store.chessMoveValidator.isKingUnderAttack
          ) &&
          this.store.chessMoveValidator.isValidMove(piece, position, el.position))
      ) {
        this.availableMoves.push(el.position);
      }
    });
  };
}
export default Board;

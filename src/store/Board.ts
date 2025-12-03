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
  modalActive: boolean = false;

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
  getAllPieces = (currCol: Color) => {
    const res: Piece[] = [];
    for (let i = 0; i < this.board.length; i++) {
      const piece = this.board[i]?.piece;
      if (!piece || piece === null || piece === undefined) continue;
      if (piece.color === currCol) {
        res.push(piece);
      }
    }
    return res;
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
  makeMove = async (from: Position, to: Position, animation = false): Promise<void> => {
    const piece = this.getPiece(from);
    const side = from.col < to.col ? "right" : "left";
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
    } else if (
      piece.pieceType === "king" &&
      (await this.store.chessMoveValidator.isCastlingAvailable(side, piece, from, to))
    ) {
      this.store.chessMoveValidator.executeCastling(side, piece, from, to);
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
    if (animation) {
      this.animateMove = { from, to };
      await setTimeout(() => {
        piece.position = to;
        this.setPiece(to, piece);
        this.setPiece(from, null);

        piece.hasMoved = true;
        this.setActivePiece(null);
        this.availableMoves = [];
        this.currentPlayer = this.currentPlayer === "black" ? "white" : "black";
        this.animateMove = null;
        if (this.store.chessMoveValidator.isCheckmate(this.currentPlayer)) {
          this.store.timer.deactiveTimer();
          this.gameStatus = "checkmate";
          this.setModalActive(true);
        }
      }, 200);
    } else {
      piece.position = to;
      this.setPiece(to, piece);
      this.setPiece(from, null);

      piece.hasMoved = true;
      this.setActivePiece(null);
      this.availableMoves = [];
      this.currentPlayer = this.currentPlayer === "black" ? "white" : "black";
      if (this.store.chessMoveValidator.isCheckmate(this.currentPlayer)) {
        this.store.timer.deactiveTimer();
        this.gameStatus = "checkmate";
        this.setModalActive(true);
      }
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

  @action
  getModalActive = () => {
    return this.modalActive;
  };

  @action
  setModalActive = (value: boolean) => {
    this.modalActive = value;
  };

  reloadGame = () => {
    this.board = [];
    this.initializeBoard();
    this.currentPlayer = "white";
    this.gameStatus = "playing";
    this.activePiece = null;
    this.highlightLastMoves = {};
    this.availableMoves = [];
    this.grab = null;
    this.animateMove = null;
    this.store.timer.resetTimer(1800);
  };
}
export default Board;

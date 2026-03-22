import { action, computed, makeAutoObservable } from 'mobx';
import {
  Color,
  GameInterface,
  GameStatus,
  Position,
  SquareData,
} from '../types/types';
import Piece from './Piece';
import { RootStore } from '../store/RootStore';
import { simulateValidMove } from '../helpers/simulateMove';
import soundMove from '../assets/sounds/move.mp3';
import { initializeBoard } from '../helpers/initializeBoard';

class Game {
  private store: RootStore;
  id: number;
  board: SquareData[] = [];
  whitePlayerNickname: string | null = null;
  blackPlayerNickname: string | null = null;
  currentPlayer: Color = 'white';
  gameStatus: GameStatus = 'waiting';
  inviteCode: string | null = null;
  activePiece: Piece | null = null;
  initialTime: number;
  highlightLastMove: { from: Position; to: Position } | null = null;
  availableMoves: Position[] = [];
  grab: Position | null = null;
  animateMove: { from: Position; to: Position } | null = null;
  modalActive: boolean = false;
  lastDoubleStepPawn: null | { color: Color; position: Position } = null;
  pendingPromotion: { piece: Piece; position: Position; color: Color } | null =
    null;
  createdAt: Date;

  constructor(store: RootStore, game: GameInterface) {
    this.store = store;
    makeAutoObservable(this);

    this.board = game.boardState.flat();
    this.id = game.id;
    this.hydratePieceClassesFromServer(this.board);
    this.store.timer.setFirstPlayerTime(game.whiteTimeLeft);
    this.store.timer.setSecondPlayerTime(game.blackTimeLeft);
    this.currentPlayer = game.currentPlayer;
    this.gameStatus = game.gameStatus;
    this.inviteCode = game.inviteCode;
    if (game.fromX && game.fromY && game.toX && game.toY) {
      this.highlightLastMove = {
        from: { col: game.fromX, row: game.fromY },
        to: { col: game.toX, row: game.toY },
      };
    }
    this.initialTime = game.initialTime;
    this.lastDoubleStepPawn =
      game.lastDoubleStepPawn || this.lastDoubleStepPawn;
    this.whitePlayerNickname = game.whitePlayer.username;
    this.blackPlayerNickname = game?.blackPlayer?.username ?? null;
    this.createdAt = game.createdAt;
  }

  @action
  async setBoard(game: GameInterface) {
    this.board = game.boardState.flat();
    this.id = game.id;
    this.hydratePieceClassesFromServer(this.board);
    this.store.timer.setFirstPlayerTime(game.whiteTimeLeft);
    this.store.timer.setSecondPlayerTime(game.blackTimeLeft);
    this.currentPlayer = game.currentPlayer;
    this.gameStatus = game.gameStatus;
    this.inviteCode = game.inviteCode;
    if (game.fromX && game.fromY && game.toX && game.toY) {
      this.highlightLastMove = {
        from: { col: game.fromX, row: game.fromY },
        to: { col: game.toX, row: game.toY },
      };
    }
    this.lastDoubleStepPawn = game.lastDoubleStepPawn || null;
    this.whitePlayerNickname = game.whitePlayer.username;
    this.blackPlayerNickname =
      game?.blackPlayer?.username ?? this.blackPlayerNickname;
    this.createdAt = game.createdAt;
  }

  @action
  hydratePieceClassesFromServer(board: SquareData[]) {
    board.forEach((el) => {
      if (!el.piece?.pieceType) return;
      el.piece = new Piece(
        el.piece?.pieceType,
        el.piece?.position,
        el.piece?.color,
      );
    });
  }

  @action
  getPiece = (from: Position) => {
    return this.board.find(
      (el) => el.position.col === from.col && el.position.row === from.row,
    )?.piece;
  };

  @action
  setPiece = (to: Position, piece: Piece | null) => {
    const boardSetPiece = this.board.find(
      (el) => el.position.col === to.col && el.position.row === to.row,
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
  isParticipant() {
    const username = this.store.getNickname();
    return (
      this.whitePlayerNickname === username ||
      this.blackPlayerNickname === username
    );
  }

  @action
  isFinished() {
    return this.gameStatus === 'checkmate' || this.gameStatus === 'timeout';
  }

  @action
  get yourColor(): 'white' | 'black' | null {
    const username = this.store.getNickname();
    if (this.whitePlayerNickname === username) return 'white';
    if (this.blackPlayerNickname === username) return 'black';
    return null;
  }

  @action
  moveAvailableForPiece(piece: Piece): boolean {
    if (piece.color !== this.currentPlayer) return false;
    if (this.currentPlayer !== this.yourColor) return false;
    return true;
  }

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
  makeMove = async (
    from: Position,
    to: Position,
    animation = false,
  ): Promise<void> => {
    const piece = this.getPiece(from);
    const side = from.col < to.col ? 'right' : 'left';
    if (!piece) {
      console.warn('No piece at this position');
      return;
    }
    if (!this.isValidMove(piece, from, to, side)) {
      console.warn('Invalid move');
      return;
    }
    if (this.isPromotion(piece, to)) {
      this.setPendingPromotion({
        piece: piece,
        position: to,
        color: piece.color,
      });
      return;
    }

    const MakeMoveDto = {
      from,
      to,
      highlightLastMove: { from, to },
      whiteTimeLeft: this.store.timer.p1 || this.initialTime,
      blackTimeLeft: this.store.timer.p2 || this.initialTime,
    };
    if (animation) {
      this.animateMove = { from, to };
    }
    this.store.socket?.makeMove({ id: this.id, moveData: MakeMoveDto });
  };

  @computed
  get availableMovesSet(): Set<string> {
    return new Set(this.availableMoves.map((pos) => `${pos.row}-${pos.col}`));
  }

  setAvailableMoves = (args: [Piece, Position] | null) => {
    this.availableMoves = [];
    if (!args) return;
    if (this.gameStatus === 'checkmate' || this.gameStatus === 'timeout')
      return;
    const [piece, position] = args;
    this.board.forEach((el) => {
      if (
        (this.store.chessMoveValidator.isValidMove(
          piece,
          position,
          el.position,
        ) &&
          !this.store.chessMoveValidator.isKingUnderAttack(piece.color)) ||
        (this.store.chessMoveValidator.isKingUnderAttack(piece.color) &&
          simulateValidMove(
            piece,
            position,
            el.position,
            this.getPiece,
            this.setPiece,
            this.store.chessMoveValidator.isKingUnderAttack,
          ) &&
          this.store.chessMoveValidator.isValidMove(
            piece,
            position,
            el.position,
          ))
      ) {
        this.availableMoves.push(el.position);
      }
    });
  };

  updateTimer = (color: Color) => {
    if (color === 'white') {
      const timer = this.store.timer;
      timer.deactiveTimer();
      timer.activateTimer('black');
    } else if (color === 'black') {
      const timer = this.store.timer;
      timer.deactiveTimer();
      timer.activateTimer('white');
    }
  };

  isValidMove = (
    piece: Piece,
    from: Position,
    to: Position,
    side: 'right' | 'left',
  ) => {
    if (!this.store.chessMoveValidator.isValidMove(piece, from, to)) {
      return false;
    }
    if (this.gameStatus === 'checkmate' || this.gameStatus === 'timeout')
      return false;
    if (
      piece.pieceType !== 'king' &&
      this.store.chessMoveValidator.isKingUnderAttack(piece.color)
    ) {
      if (
        !simulateValidMove(
          piece,
          from,
          to,
          this.getPiece,
          this.setPiece,
          this.store.chessMoveValidator.isKingUnderAttack,
        )
      ) {
        return false;
      }
    } else if (
      piece.pieceType === 'king' &&
      this.store.chessMoveValidator.isCastlingAvailable(side, piece, from, to)
    ) {
      this.store.chessMoveValidator.executeCastling(side, piece, from, to);
      return false;
    }
    return true;
  };

  finalizeMove = async (piece: Piece, from: Position, to: Position) => {
    piece.position = to;
    if (
      piece.pieceType === 'pawn' &&
      from.col !== to.col &&
      !this.getPiece(to) &&
      this.lastDoubleStepPawn
    ) {
      this.setPiece(this.lastDoubleStepPawn.position, null);
    }
    this.setPiece(to, piece);
    this.setPiece(from, null);
    new Audio(soundMove).play();

    piece.hasMoved = true;
    this.setActivePiece(null);
    this.availableMoves = [];
    this.highlightLastMove = { from, to };
    this.currentPlayer = this.currentPlayer === 'black' ? 'white' : 'black';
    this.animateMove = null;
    this.lastDoubleStepPawn = null;
    if (piece.pieceType === 'pawn' && Math.abs(from.row - to.row) === 2) {
      this.lastDoubleStepPawn = { color: piece.color, position: to };
    }
    if (this.store.chessMoveValidator.isCheckmate(this.currentPlayer)) {
      this.store.timer.deactiveTimer();
      this.gameStatus = 'checkmate';
      this.setModalActive(true);
    }
  };

  isPromotion = (piece: Piece, to: Position) => {
    return this.store.chessMoveValidator.isLastRow(piece, to);
  };

  @action
  promotePiece = (oldPiece: Piece, piece: Piece) => {
    const square = this.board.find(
      (el) =>
        el.position.col === piece.position.col &&
        el.position.row === piece.position.row,
    );
    if (square) {
      square.piece = piece;
      this.updateTimer(piece.color);
      new Audio(soundMove).play();

      this.setPendingPromotion(null);
      this.setActivePiece(null);
      this.availableMoves = [];
      this.currentPlayer = this.currentPlayer === 'black' ? 'white' : 'black';
      this.setPiece(oldPiece.position, null);
      if (this.store.chessMoveValidator.isCheckmate(this.currentPlayer)) {
        this.store.timer.deactiveTimer();
        this.gameStatus = 'checkmate';
        this.setModalActive(true);
      }
    }
  };

  @computed
  get pendingPromotionValue() {
    return this.pendingPromotion;
  }

  @action
  setPendingPromotion = (
    value: { piece: Piece; position: Position; color: Color } | null,
  ) => {
    this.pendingPromotion = value;
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
    initializeBoard();
    this.currentPlayer = 'white';
    this.gameStatus = 'playing';
    this.activePiece = null;
    this.highlightLastMove = null;
    this.availableMoves = [];
    this.grab = null;
    this.animateMove = null;
    this.store.timer.resetTimer(1800);
  };
}
export default Game;

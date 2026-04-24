import { action, computed, makeAutoObservable } from 'mobx';
import {
  Color,
  GameInterface,
  GameStatus,
  PieceType,
  Position,
  SquareData,
} from '../types/types';
import Piece from './Piece';
import { RootStore } from '../store/RootStore';
import { simulateValidMove } from '../helpers/simulateMove';
import movePiece from '../assets/sounds/move.mp3';
import capture from '../assets/sounds/capture.mp3';
import castle from '../assets/sounds/castle.mp3';
import check from '../assets/sounds/check.mp3';
import endGame from '../assets/sounds/end-game.mp3';
import promote from '../assets/sounds/promote.mp3';

class Game {
  private store: RootStore;
  id: number;
  board: SquareData[] = [];
  gameCreatorId: number;
  whitePlayerId: number;
  blackPlayerId: number;
  whitePlayerNickname: string | null = null;
  blackPlayerNickname: string | null = null;
  currentPlayer: Color = 'white';
  winner: string | null = null;
  gameStatus: GameStatus = 'waiting';
  inviteCode: string | null = null;
  activePiece: Piece | null = null;
  initialTime: number;
  additionalTime: number;
  highlightLastMove: { from: Position; to: Position } | null = null;
  availableMoves: Position[] = [];
  grab: Position | null = null;
  animateMove: { from: Position; to: Position } | null = null;
  isAnimateMove: boolean = false;
  modalActive: boolean;
  lastDoubleStepPawn: null | { color: Color; position: Position } = null;
  drawOfferedBy: number | null = null;
  pendingPromotionPieceValue: {
    piece: Piece | null;
    from: Position;
    to: Position;
    color: Color;
  } | null = null;
  pendingPremove: {
    from: Position;
    to: Position;
    promotionPiece?: PieceType;
  } | null = null;
  createdAt: Date;
  annotations: {
    circles: Array<Position>;
    arrows: Array<{ from: Position; to: Position }>;
    clearAnnoations: () => void;
  } = {
    circles: [],
    arrows: [],
    clearAnnoations: () => {
      this.annotations.arrows = [];
      this.annotations.circles = [];
    },
  };
  constructor(store: RootStore, game: GameInterface) {
    this.store = store;
    makeAutoObservable(this);
    this.board = game.boardState.flat();
    this.id = game.id;
    this.hydratePieceClassesFromServer(this.board);
    this.currentPlayer = game.currentPlayer;
    this.winner = game.winner;
    this.gameStatus = game.gameStatus;
    this.drawOfferedBy = game.drawOfferedBy;
    this.inviteCode = game.inviteCode;
    if (game.fromX && game.fromY && game.toX && game.toY) {
      this.highlightLastMove = {
        from: { col: game.fromX, row: game.fromY },
        to: { col: game.toX, row: game.toY },
      };
    }
    this.initialTime = game.initialTime;
    this.additionalTime = game.additionalTime;
    this.lastDoubleStepPawn =
      game.lastDoubleStepPawn || this.lastDoubleStepPawn;
    this.gameCreatorId = Number(game.gameCreatorId);
    this.whitePlayerId = Number(game.whitePlayerId);
    this.blackPlayerId = Number(game.blackPlayerId);
    this.whitePlayerNickname = game.whitePlayer.username;
    this.blackPlayerNickname = game?.blackPlayer?.username ?? null;
    this.store.timer.setTimes(game.whiteTimeLeft, game.blackTimeLeft);
    this.createdAt = game.createdAt;

    this.modalActive = this.isFinished() ? true : false;
  }

  @action
  async setBoard(game: GameInterface) {
    this.board = game.boardState.flat();
    this.id = game.id;
    this.hydratePieceClassesFromServer(this.board);
    this.currentPlayer = game.currentPlayer;
    this.gameStatus = game.gameStatus;
    this.drawOfferedBy = game.drawOfferedBy;
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
    this.store.timer.setTimes(game.whiteTimeLeft, game.blackTimeLeft);
  }

  get playerId() {
    return this.store.getNickname() === this.whitePlayerNickname
      ? this.whitePlayerId
      : this.blackPlayerId;
  }

  setWinner(winner: string) {
    this.winner = winner;
    console.log(this.winner);
  }

  setStatus(status: GameStatus) {
    this.gameStatus = status;
  }

  addExtraTimeToOpponent() {
    this.store.socket.addExtraTime({ gameId: this.id });
  }

  setDrawOfferedBy(userId: number) {
    this.drawOfferedBy = userId;
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
    const res = this.board.find(
      (el) => el.position.col === from.col && el.position.row === from.row,
    );
    if (!res) return null;
    return res.piece;
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
    return (
      this.gameStatus === 'checkmate' ||
      this.gameStatus === 'stalemate' ||
      this.gameStatus === 'timeout' ||
      this.gameStatus === 'draw' ||
      this.gameStatus === 'resign'
    );
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

    const MakeMoveDto = {
      from,
      to,
      highlightLastMove: { from, to },
      promotionPiece:
        this.pendingPremove?.promotionPiece ??
        this.pendingPromotionPiece?.piece?.pieceType,
    };
    console.log(MakeMoveDto);
    if (animation) {
      this.isAnimateMove = true;
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
    if (this.isFinished()) return;
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

  setAvailablePremoves = (args: [Piece, Position] | null) => {
    this.availableMoves = [];
    if (!args) return;
    if (this.isFinished()) return;
    const [piece, position] = args;
    if (piece.color !== this.yourColor) return false;
    this.board.forEach((el) => {
      if (
        this.store.chessMoveValidator.isValidPremove(
          piece,
          position,
          el.position,
        )
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
      console.warn('isValidMove fall', from, to, piece.pieceType);
      return false;
    }
    if (this.isFinished()) return false;
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
        console.warn('simulating move fall');
        return false;
      }
    } else if (
      piece.pieceType === 'king' &&
      this.store.chessMoveValidator.isCastlingAvailable(side, piece, from, to)
    ) {
      return true;
    }
    return true;
  };

  finalizeMove = async (piece: Piece, from: Position, to: Position) => {
    const movedPiece = this.getPiece(from);
    const capturedPiece = this.getPiece(to);
    piece.position = to;
    if (
      piece.pieceType === 'pawn' &&
      from.col !== to.col &&
      !capturedPiece &&
      this.lastDoubleStepPawn
    ) {
      this.setPiece(this.lastDoubleStepPawn.position, null);
    }
    this.setPiece(to, piece);
    this.setPiece(from, null);

    piece.hasMoved = true;
    this.setActivePiece(null);
    this.setAvailableMoves(null);
    this.highlightLastMove = { from, to };
    this.currentPlayer = this.currentPlayer === 'black' ? 'white' : 'black';
    this.isAnimateMove = false;
    this.animateMove = null;
    this.lastDoubleStepPawn = null;
    if (piece.pieceType === 'pawn' && Math.abs(from.row - to.row) === 2) {
      this.lastDoubleStepPawn = { color: piece.color, position: to };
    }
    if (piece.pieceType === PieceType.KING && Math.abs(from.col - to.col) > 1) {
      this.store.chessMoveValidator.executeCastling(from, to);
      new Audio(castle).play();
      return;
    }
    if (this.store.chessMoveValidator.isCheckmate(this.currentPlayer)) {
      this.endGameSound();
      this.setModalActive(true);
      return;
    }
    if (movedPiece && this.isPromotion(movedPiece, to)) {
      new Audio(promote).play();
      return;
    }
    if (capturedPiece) {
      new Audio(capture).play();
      return;
    }
    if (
      this.store.chessMoveValidator.isKingUnderAttack('white') ||
      this.store.chessMoveValidator.isKingUnderAttack('black')
    ) {
      new Audio(check).play();
      return;
    }
    new Audio(movePiece).play();
  };

  finalizePremove() {
    setTimeout(() => {
      if (!this.pendingPremove) return;
      const piece = this.getPiece(this.pendingPremove.from);
      if (!piece) return;
      this.makeMove(piece.position, this.pendingPremove.to);
      this.setPendingPremove(null);
    }, 200);
  }

  isPromotion = (piece: Piece, to: Position) => {
    return this.store.chessMoveValidator.isLastRow(piece, to);
  };

  @computed
  get pendingPromotionPiece() {
    return this.pendingPromotionPieceValue;
  }

  @action
  setPendingPromotionPiece(
    value: {
      piece: Piece | null;
      from: Position;
      to: Position;
      color: Color;
    } | null,
  ) {
    this.pendingPromotionPieceValue = value;
  }

  @action
  getModalActive = () => {
    return this.modalActive;
  };

  @action
  setModalActive = (value: boolean) => {
    this.modalActive = value;
  };

  @action
  setPendingPremove(
    value: { from: Position; to: Position; promotionPiece?: PieceType } | null,
  ) {
    if (
      value &&
      (this.pendingPromotionPiece ||
        this.availableMoves.some(
          (pos) => pos.row === value.to.row && pos.col === value.to.col,
        ))
    ) {
      this.pendingPremove = value;
    } else {
      this.pendingPremove = null;
    }
  }

  endGameSound() {
    new Audio(endGame).play();
  }
}
export default Game;

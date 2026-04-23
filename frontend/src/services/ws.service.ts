import { io, Socket } from 'socket.io-client';
import apiService from './api.service';
import tokenService from './auth.service';
import { RootStore } from '../store/RootStore';
import { GameInterface, GameStatus, Position } from '../types/types';
import { makeAutoObservable, runInAction } from 'mobx';
import Piece from '../models/Piece';
import {
  ICreateGame,
  IDrawOffer,
  IExtraTime,
  IGetGame,
  IJoinGame,
  IJoinGameByCode,
  IJoinRoom,
  ILeaveRoom,
  IMakeMove,
  IRemoveGame,
  ITimeout,
} from '../types/api.types';
import notify from '../components/ui/notify';
import onSocket from '../helpers/onSocket';

import gameStart from '../assets/sounds/game-start.mp3';
import endGame from '../assets/sounds/end-game.mp3';

class WebSocketService {
  store: RootStore;
  socket: Socket | null = null;
  isConnected: boolean = false;
  accessToken: string | null = null;
  pendingEvent: { event: string; data?: unknown } | null = null;

  constructor(store: RootStore) {
    makeAutoObservable(this);
    this.store = store;
    this.accessToken = tokenService.getAccessToken();
  }

  public async connect() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket = null;
    }

    if (!this.accessToken) {
      console.log('Token unregistered');
      notify('Invalid access token', 'error');
    }
    this.socket = io('http://localhost:3030', {
      auth: {
        token: this.accessToken,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 5000,
    });

    this.handleEvents();

    return this.socket;
  }

  private handleEvents() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      runInAction(() => {
        this.isConnected = true;
      });
      if (this.pendingEvent) {
        // notify('Reconnected!', 'success');
        this.socket?.emit(this.pendingEvent.event, this.pendingEvent.data);
        this.pendingEvent = null;
      }
    });

    onSocket<GameInterface>(this.socket, 'game-created', (data) => {
      console.log('game-created, game id: ', data.id);
      this.store?.games.addGame(data);
    });
    onSocket<{ id: number }>(this.socket, 'game-created-you', (data) => {
      notify('game created successfully!', 'success');
      new Audio(gameStart).play();
      this.store?.navigate(`game/${data.id}`);
    });
    onSocket<{ gameId: number }>(this.socket, 'game-removed', (data) => {
      const { gameId } = data;
      console.log('game-removed', gameId);
      this.store.games.removeGame(gameId);
    });
    onSocket<{ gameId: number }>(this.socket, 'game-removed-lobby', (data) => {
      const { gameId } = data;
      notify(`game with id ${gameId} removed!`, 'success');
      this.store?.navigate(`home`);
    });
    onSocket<GameInterface>(this.socket, 'guest-joined', (data) => {
      if (data.blackPlayer === this.store.getNickname()) {
        notify('Joined game successfully!', 'success');
      }
      console.log('guest-joined', data);
      this.store?.games.updateGame(data);
    });
    onSocket<{ id: number }>(this.socket, 'game-joined-by-code-you', (data) => {
      notify(`You successfully joined the game by code`, 'success');
      this.store?.navigate(`game/${data.id}`);
      new Audio(gameStart).play();
    });
    onSocket<GameInterface[]>(this.socket, 'get-games', (data) => {
      this.store?.games.setAllGames(data);
      console.log('get-games', data);
    });

    onSocket<GameInterface>(this.socket, 'game-state', (data) => {
      this.store?.games?.currentGame?.setBoard(data);
      console.log('game-state', data);
    });
    onSocket<ITimeout>(this.socket, 'timeout', (data) => {
      this.store?.games?.currentGame?.setWinner(data.winner);
      this.store?.games?.currentGame?.setStatus(data.gameStatus);
      this.store?.games?.currentGame?.setModalActive(true);
      console.log('timeout', data);
    });
    onSocket<IExtraTime>(this.socket, 'add-extra-time', (data) => {
      const { fromUserId, blackTimeLeft, whiteTimeLeft } = data;
      const currGame = this.store.games.currentGame;
      this.store.timer.setTimes(whiteTimeLeft, blackTimeLeft);
      notify(
        `Player ${currGame?.whitePlayerId === fromUserId ? currGame?.blackPlayerNickname : currGame?.whitePlayerNickname} was gifted an extra time `,
        'success',
      );
      console.log('add-extra-time', data);
    });
    onSocket<IDrawOffer>(this.socket, 'draw-offer', (data) => {
      const { drawOfferedBy } = data;
      this.store.games.currentGame?.setDrawOfferedBy(drawOfferedBy);
      console.log('draw-offer', data);
    });
    onSocket<GameInterface>(this.socket, 'draw-response', (data) => {
      this.store?.games?.currentGame?.setBoard(data);
      if (data.gameStatus === 'draw') {
        this.store?.games?.currentGame?.setModalActive(true);
        new Audio(endGame).play();
      }
      console.log('draw-response', data);
    });
    onSocket<{ id: number; gameStatus: GameStatus; winner: string }>(
      this.socket,
      'update-game-status',
      (data) => {
        const game = this.store?.games.gamesList.find(
          (el) => el.id === data.id,
        );
        if (!game) return;
        game.setStatus(data.gameStatus);
        game.setWinner(data.winner);
        if (game.gameStatus === 'resign') {
          game.endGameSound();
          game.setModalActive(true);
          if (game.isParticipant() && game.winner !== this.store.getNickname())
            return;
          notify('Opponent resigned!', 'default');
        }
        console.log('update-game-status', data);
      },
    );
    onSocket<{
      success: boolean;
      piece: Piece;
      from: Position;
      to: Position;
      whiteTimeLeft: number;
      blackTimeLeft: number;
    }>(this.socket, 'state', (data) => {
      console.log('state called');
      if (!data.success) return;
      const { piece, from, to, whiteTimeLeft, blackTimeLeft } = data;
      if (
        !this.store?.games.currentGame ||
        this.store?.games.currentGame === null
      )
        return;
      console.log(piece);
      const hydratedPiece = new Piece(
        piece.pieceType,
        piece.position,
        piece.color,
      );
      this.store.timer.setTimes(whiteTimeLeft, blackTimeLeft);
      if (
        this.store?.games?.currentGame.yourColor !==
          this.store?.games?.currentGame.currentPlayer ||
        this.store.games.currentGame.isAnimateMove === true
      ) {
        this.store.games.currentGame.animateMove = { from, to };
        setTimeout(() => {
          this.store?.games?.currentGame?.finalizeMove(hydratedPiece, from, to);
          if (this.store?.games?.currentGame?.animateMove) {
            this.store.games.currentGame.animateMove = null;
            this.store.games.currentGame.isAnimateMove = false;
          } // Animate move for opponent and for us if we have animated move
          this.store.games.currentGame?.finalizePremove();
        }, 200);
        this.store?.games?.currentGame.updateTimer(hydratedPiece.color);
      } else {
        this.store?.games?.currentGame.finalizeMove(hydratedPiece, from, to);
        this.store.games.currentGame.finalizePremove();
      }
      this.store.games.currentGame.annotations.clearAnnoations();

      console.log(data);
    });

    this.socket.on('error', async (err) => {
      runInAction(() => {
        this.isConnected = false;
        this.accessToken = null;
      });
      if (err.message.includes('Unauthorized')) {
        const token = await this.refreshAccessToken();
        console.log('refreshed');
        if (token && this.socket) {
          this.socket.auth = { token };
          console.log('reconnecting..');
          this.connect();
        }
        return;
      }
      if (err.message.includes('user didnt exist')) {
        localStorage.clear();
        this.store?.navigate('registration-form');
      }
      notify(err.message as string, 'error');
    });

    this.socket.on('disconnect', () => {
      runInAction(() => {
        this.isConnected = false;
      });
      notify('Connection lost! Reconnecting...', 'error');
    });
  }

  public createGame(data: ICreateGame) {
    this.pendingEvent = { event: 'create-game', data };
    if (!this.socket?.connected) return;
    this.socket.emit('create-game', data);
  }
  public removeGame(data: IRemoveGame) {
    this.pendingEvent = { event: 'remove-game', data };
    if (!this.socket?.connected) return;
    this.socket.emit('remove-game', data);
  }
  public joinRoom(data: IJoinRoom) {
    console.log('joinRoom func');
    this.pendingEvent = { event: 'join-room', data };
    if (!this.socket?.connected) return;
    this.socket.emit('join-room', data);
  }
  public leaveRoom(data: ILeaveRoom) {
    this.pendingEvent = { event: 'leave-room', data };
    if (!this.socket?.connected) return;
    this.socket.emit('leave-room', data);
  }
  public joinGame(data: IJoinGame) {
    this.pendingEvent = { event: 'join-game', data };
    if (!this.socket?.connected) return;
    this.socket.emit('join-game', data);
  }
  public joinGameByCode(data: IJoinGameByCode) {
    this.pendingEvent = { event: 'join-game-code', data };
    if (!this.socket?.connected) return;
    this.socket.emit('join-game-code', data);
  }
  public getAllGames() {
    if (!this.socket?.connected) return;
    this.socket?.emit('get-games');
  }
  public getGame(data: IGetGame) {
    if (!this.socket?.connected) return;
    this.socket?.emit('get-game', data);
  }
  public makeMove(data: IMakeMove) {
    this.pendingEvent = { event: 'make-move', data };
    if (!this.socket?.connected) return;
    console.log('called makeMove');
    this.socket.emit('make-move', data);
  }
  public addExtraTime(data: { gameId: number }) {
    this.pendingEvent = { event: 'add-extra-time', data };
    if (!this.socket?.connected) return;
    console.log('called add extra time');
    this.socket?.emit('add-extra-time', data);
  }

  public drawOffer(data: { gameId: number }) {
    this.pendingEvent = { event: 'draw-offer', data };
    if (!this.socket?.connected) return;
    console.log('called draw offer');
    this.socket?.emit('draw-offer', data);
  }
  public drawResponse(data: { gameId: number; response: boolean }) {
    this.pendingEvent = { event: 'draw-response', data };
    if (!this.socket?.connected) return;
    console.log('called draw response');
    this.socket?.emit('draw-response', data);
  }
  public resign(data: { id: number }) {
    this.pendingEvent = { event: 'resign', data };
    if (!this.socket?.connected) return;
    console.log('called resign');
    this.socket?.emit('resign', data);
  }

  startHeartbeat = () => {};

  public async refreshAccessToken() {
    try {
      const token = await apiService.refreshAccessToken();

      tokenService.setAccessToken(token);
      console.log('Token changed');
      runInAction(() => (this.accessToken = token));
      return token;
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes('Invalid token')) {
          console.error('Refresh token not found');
          localStorage.clear();
          this.store?.navigate('registration-form');
        }
      }
    }
  }
}
export default WebSocketService;

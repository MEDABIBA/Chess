import { io, Socket } from 'socket.io-client';
import apiService from './api.service';
import tokenService from './auth.service';
import { RootStore } from '../store/RootStore';
import { GameInterface, GameStatus, Position } from '../types/types';
import { makeAutoObservable, runInAction } from 'mobx';
import Piece from '../models/Piece';
import {
  ICreateGame,
  IGetGame,
  IJoinGame,
  IJoinGameByCode,
  IJoinRoom,
  ILeaveRoom,
  IMakeMove,
} from '../types/api.types';

class WebSocketService {
  store: RootStore;
  socket: Socket | null = null;
  isConnected: boolean = false;
  accessToken: string | null = null;
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
      throw new Error('Invalid access token');
    }
    this.socket = io('http://localhost:3030', {
      auth: {
        token: this.accessToken,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
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
      console.log('WebSocket connected');
    });

    this.socket?.on('game-created', (game: GameInterface) => {
      console.log('game-created, game id: ', game.id);
      this.store?.games.addGame(game);
    });
    this.socket?.on('game-created-you', (res: { id: number }) => {
      console.log('game-created-you', res);
      this.store?.navigate(`game/${res.id}`);
    });
    this.socket?.on('guest-joined', (game: GameInterface) => {
      console.log('guest-joined', game);
      this.store?.games.updateGame(game);
    });
    this.socket?.on('game-joined-by-code-you', (res: { id: number }) => {
      console.log('game-created-you', res);
      this.store?.navigate(`game/${res.id}`);
    });
    this.socket?.on('get-games', (games: GameInterface[]) => {
      this.store?.games.setAllGames(games);
      console.log('get-games', games);
    });
    this.socket?.on('game-state', (res: GameInterface) => {
      this.store?.games?.currentGame?.setBoard(res);
      console.log('game-state', res);
    });
    this.socket?.on(
      'update-game-status',
      (res: { id: number; gameStatus: GameStatus }) => {
        const game = this.store?.games.gamesList.find((el) => el.id === res.id);
        if (!game) return;
        game.gameStatus = res.gameStatus;
        console.log('update-game-status', res);
      },
    );
    this.socket?.on(
      'state',
      (res: {
        success: boolean;
        piece: Piece;
        from: Position;
        to: Position;
      }) => {
        console.log('state called');
        if (!res.success) return;
        const { piece, from, to } = res;
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
        if (
          this.store?.games?.currentGame.yourColor !==
            this.store?.games?.currentGame.currentPlayer ||
          this.store.games.currentGame.animateMove !== null
        ) {
          this.store.games.currentGame.animateMove = { from, to };
          setTimeout(() => {
            this.store?.games?.currentGame?.finalizeMove(
              hydratedPiece,
              from,
              to,
            );
            if (this.store?.games?.currentGame?.animateMove) {
              this.store.games.currentGame.animateMove = null;
            } // Animate move for opponent and for us if we have animated move
          }, 200);
          this.store?.games?.currentGame?.updateTimer(hydratedPiece.color);
        } else {
          this.store?.games?.currentGame?.finalizeMove(hydratedPiece, from, to);
        }

        console.log(res);
      },
    );

    this.socket.on('error', async (err) => {
      runInAction(() => {
        this.isConnected = false;
      });
      console.log('error', err);
      if (err.message.includes('Unauthorized')) {
        this.accessToken = null;
        const token = await this.refreshAccessToken();
        console.log('refreshed');
        if (token && this.socket) {
          this.socket.auth = { token };
          console.log('reconnecting..');
          this.connect();
        }
      }
    });

    this.socket.on('disconnect', (reason: Socket.DisconnectReason) => {
      runInAction(() => {
        this.isConnected = false;
      });
      console.log('WebSocket disconnected:', reason);
    });
  }

  public createGame(data: ICreateGame) {
    if (!this.socket) throw new Error('Socket not initialized');
    if (!this.socket?.connected) return;
    this.socket.emit('create-game', data);
  }
  public joinRoom(data: IJoinRoom) {
    console.log('joinRoom func');
    if (!this.socket) throw new Error('Socket not initialized');
    if (!this.socket?.connected) return;
    this.socket.emit('join-room', data);
  }
  public leaveRoom(data: ILeaveRoom) {
    if (!this.socket) throw new Error('Socket not initialized');
    if (!this.socket?.connected) return;
    this.socket.emit('leave-room', data);
  }
  public joinGame(data: IJoinGame) {
    if (!this.socket) throw new Error('Socket not initialized');
    if (!this.socket?.connected) return;
    this.socket.emit('join-game', data);
  }
  public joinGameByCode(data: IJoinGameByCode) {
    if (!this.socket) throw new Error('Socket not initialized');
    if (!this.socket?.connected) return;
    this.socket.emit('join-game-code', data);
  }
  public getAllGames() {
    if (!this.socket) throw new Error('Socket not initialized');
    if (!this.socket?.connected) return;
    this.socket?.emit('get-games');
  }
  public getGame(data: IGetGame) {
    if (!this.socket) throw new Error('Socket not initialized');
    if (!this.socket?.connected) return;
    this.socket?.emit('get-game', data);
  }
  public makeMove(data: IMakeMove) {
    if (!this.socket) throw new Error('Socket not initialized');
    if (!this.socket?.connected) return;
    console.log('called makeMove');
    this.socket.emit('make-move', data);
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

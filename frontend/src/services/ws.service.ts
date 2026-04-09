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
      if (this.pendingEvent) {
        this.socket?.emit(this.pendingEvent.event, this.pendingEvent.data);
        this.pendingEvent = null;
      }
      console.log('WebSocket connected');
    });

    this.socket?.on('game-created', (game: GameInterface) => {
      console.log('game-created, game id: ', game.id);
      this.store?.games.addGame(game);
    });
    this.socket?.on('game-created-you', (res: { id: number }) => {
      notify('game created successfully!', 'success');
      this.store?.navigate(`game/${res.id}`);
    });
    this.socket.on('game-removed', (res: { gameId: number }) => {
      const { gameId } = res;
      console.log('game-removed', gameId);
      this.store.games.removeGame(gameId);
    });
    this.socket.on('game-removed-lobby', (res: { gameId: number }) => {
      const { gameId } = res;
      notify(`game with id ${gameId} removed!`, 'success');
      this.store?.navigate(`home`);
    });
    this.socket?.on('guest-joined', (game: GameInterface) => {
      if (game.blackPlayer === this.store.getNickname()) {
        notify('Joined game successfully!', 'success');
      }
      console.log('guest-joined', game);
      this.store?.games.updateGame(game);
    });
    this.socket?.on('game-joined-by-code-you', (res: { id: number }) => {
      notify(`You successfully joined the game by code`, 'success');
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
    this.socket?.on('timeout', (res: ITimeout) => {
      this.store?.games?.currentGame?.setWinner(res.winner);
      this.store?.games?.currentGame?.setStatus(res.gameStatus);
      console.log('timeout', res);
    });
    this.socket?.on('draw-offer', (res: IDrawOffer) => {
      const { drawOfferedBy } = res;
      this.store.games.currentGame?.setDrawOfferedBy(drawOfferedBy);
      console.log('draw-offer', res);
    });
    this.socket?.on(
      'draw-response',
      (res: GameInterface | { error: string }) => {
        if ('error' in res) {
          notify(res.error, 'error');
        } else {
          this.store?.games?.currentGame?.setBoard(res);
          console.log('draw-response', res);
        }
      },
    );
    this.socket?.on(
      'update-game-status',
      (res: { id: number; gameStatus: GameStatus; winner: string }) => {
        const game = this.store?.games.gamesList.find((el) => el.id === res.id);
        if (!game) return;
        game.gameStatus = res.gameStatus;
        game.winner = res.winner;
        if (game.gameStatus === 'resign') {
          game.setModalActive(true);
        }
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
        whiteTimeLeft: number;
        blackTimeLeft: number;
      }) => {
        console.log('state called');
        if (!res.success) return;
        const { piece, from, to, whiteTimeLeft, blackTimeLeft } = res;
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
        this.store.timer.setFirstPlayerTime(whiteTimeLeft);
        this.store.timer.setSecondPlayerTime(blackTimeLeft);
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
            this.store.games.currentGame?.finalizePremove();
          }, 200);
          this.store?.games?.currentGame?.updateTimer(hydratedPiece.color);
        } else {
          this.store?.games?.currentGame?.finalizeMove(hydratedPiece, from, to);
          this.store.games.currentGame?.finalizePremove();
        }
        console.log(res);
      },
    );

    this.socket.on('error', async (err) => {
      runInAction(() => {
        this.isConnected = false;
        this.accessToken = null;
      });
      console.log('error', err);
      if (err.message.includes('Unauthorized')) {
        const token = await this.refreshAccessToken();
        console.log('refreshed');
        if (token && this.socket) {
          this.socket.auth = { token };
          console.log('reconnecting..');
          this.connect();
        }
      }
      if (err.message.includes('user didnt exist')) {
        localStorage.clear();
        this.store?.navigate('registration-form');
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
    this.pendingEvent = { event: 'create-game', data };
    this.socket.emit('create-game', data);
  }
  public removeGame(data: IRemoveGame) {
    if (!this.socket) throw new Error('Socket not initialized');
    if (!this.socket?.connected) return;
    this.pendingEvent = { event: 'remove-game', data };
    this.socket.emit('remove-game', data);
  }
  public joinRoom(data: IJoinRoom) {
    console.log('joinRoom func');
    if (!this.socket) throw new Error('Socket not initialized');
    if (!this.socket?.connected) return;
    this.pendingEvent = { event: 'join-room', data };
    this.socket.emit('join-room', data);
  }
  public leaveRoom(data: ILeaveRoom) {
    if (!this.socket) throw new Error('Socket not initialized');
    if (!this.socket?.connected) return;
    this.pendingEvent = { event: 'leave-room', data };
    this.socket.emit('leave-room', data);
  }
  public joinGame(data: IJoinGame) {
    if (!this.socket) throw new Error('Socket not initialized');
    if (!this.socket?.connected) return;
    this.pendingEvent = { event: 'join-game', data };
    this.socket.emit('join-game', data);
  }
  public joinGameByCode(data: IJoinGameByCode) {
    if (!this.socket) throw new Error('Socket not initialized');
    if (!this.socket?.connected) return;
    this.pendingEvent = { event: 'join-game-code', data };
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
    this.pendingEvent = { event: 'make-move', data };
    this.socket.emit('make-move', data);
  }
  public drawOffer(data: { gameId: number }) {
    if (!this.socket) throw new Error('Socket not initialized');
    if (!this.socket?.connected) return;
    console.log('called draw offer');
    this.pendingEvent = { event: 'draw-offer', data };
    this.socket?.emit('draw-offer', data);
  }
  public drawResponse(data: { gameId: number; response: boolean }) {
    if (!this.socket) throw new Error('Socket not initialized');
    if (!this.socket?.connected) return;
    console.log('called draw response');
    this.pendingEvent = { event: 'draw-response', data };
    this.socket?.emit('draw-response', data);
  }
  public resign(data: { id: number }) {
    if (!this.socket) throw new Error('Socket not initialized');
    if (!this.socket?.connected) return;
    console.log('called resign');
    this.pendingEvent = { event: 'resign', data };
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

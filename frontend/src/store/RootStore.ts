import { makeAutoObservable, observable } from 'mobx';
import ChessMoveValidator from './ChessMoveValidator';
import Timer from './Timer';
import NewGame from './NewGame';
import { NavigateFunction } from 'react-router-dom';
import tokenService from '../services/auth.service';
import { jwtDecode } from 'jwt-decode';
import { MyJwtPayload } from '../types/types';
import Games from './Games';
import WebSocketService from '../services/ws.service';
import notify from '../components/ui/notify';

export class RootStore {
  games: Games;
  chessMoveValidator: ChessMoveValidator;
  timer: Timer;
  newGame: NewGame;
  socket: WebSocketService;

  @observable navigate!: NavigateFunction;

  constructor() {
    makeAutoObservable(this);
    this.chessMoveValidator = new ChessMoveValidator(this);
    this.games = new Games(this);
    this.timer = new Timer(this);
    this.newGame = new NewGame(this);
    this.socket = new WebSocketService(this);
  }

  async initWs() {
    try {
      if (!this.socket) {
        console.error('Socket unucialized!');
        return;
      }
      await this.socket.connect();
    } catch (error) {
      if (error instanceof Error && error.message === 'Invalid access token') {
        return;
      }
      console.error('Initialization failed:', error);
      this.navigate('registration-form');
    }
  }

  initNavigate(navigate: NavigateFunction) {
    this.navigate = navigate;
  }

  get canNavigate() {
    const game = this.games.currentGame;
    if (!this.isAuthorized()) return false;
    if (!game) return true;
    if (
      this.games.currentGame?.isParticipant() &&
      this.games.currentGame.gameStatus !== 'playing'
    )
      return true;
    return false;
  }

  getNickname() {
    if (!this.socket?.accessToken) {
      return null;
    }
    const decoded: MyJwtPayload = jwtDecode(this.socket.accessToken);
    return decoded.username;
  }

  isAuthorized() {
    return tokenService.isAuthenticated();
  }
  handleAuthSubmit = async (
    auth: 'login' | 'registration',
    username: string,
    password: string,
  ) => {
    try {
      if (!this.socket) {
        console.error('Socket unucialized!');
        return;
      }
      const res = await fetch(`http://localhost:3030/auth/${auth}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Request failed');
      }
      tokenService.setAccessToken(data.accessToken);
      this.socket.accessToken = data.accessToken;
      this.socket.connect();
      notify(data.message, 'success');
      this.navigate('home');
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error processed');
        throw new Error(error.message || 'Request failed');
      }
    }
  };
}

export const store = new RootStore();

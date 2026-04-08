import { Position, SquareData, GameStatus } from './types';

export interface ICreateGame {
  boardState: SquareData[];
  whitePlayerUsername: string;
  initialTime: number;
}

export interface IRemoveGame {
  gameId: number;
}

export interface IJoinRoom {
  gameId: number;
}

export interface ILeaveRoom {
  gameId: number;
}

export interface IJoinGame {
  id: number;
  username: string;
}

export interface IJoinGameByCode {
  username: string;
  code: string;
}

export interface IGetGame {
  id: number;
}

export interface ITimeout {
  winner: string;
  gameStatus: GameStatus;
}

export interface IDrawOffer {
  drawOfferedBy: number;
}

export type IMakeMove = {
  id: number;
  moveData: {
    from: Position;
    to: Position;
    highlightLastMove: { from: Position; to: Position };
  };
};

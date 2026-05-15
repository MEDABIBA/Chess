import Game from '../models/Game';
import Piece from '../models/Piece';
import { Position } from '../types/types';

const tryMove = (
  square: HTMLElement | null,
  game: Game,
  piece: Piece,
  handleMoveToSquare: (
    game: Game,
    piece: Piece,
    position: Position,
    animation: boolean,
  ) => void,
) => {
  if (!square) return;
  const toRow = Number(square.dataset.row);
  const toCol = Number(square.dataset.col);
  handleMoveToSquare(game, piece, { row: toRow, col: toCol }, true);
};
export default tryMove;

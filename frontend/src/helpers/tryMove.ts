import { Position } from "../types/types";

const tryMove = (
  square: HTMLElement | null,
  position: Position,
  makeMove: (from: Position, to: Position, animation?: boolean) => void
) => {
  if (!square) return;
  const toRow = Number(square.dataset.row);
  const toCol = Number(square.dataset.col);
  makeMove(position, { row: toRow, col: toCol }, true);
};
export default tryMove;

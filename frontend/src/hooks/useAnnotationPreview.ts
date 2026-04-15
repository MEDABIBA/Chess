import { useRef, useState } from 'react';
import getTargetSquare from '../helpers/getTargetSquare';
import Game from '../models/Game';
import { Position } from '../types/types';

export const userAnnotationPreview = () => {
  const [previewCircle, setPreviewCircle] = useState<Position | null>(null);
  const previewCircleRef = useRef<Position | null>(null);
  const [previewArrow, setPreviewArrow] = useState<{
    from: Position;
    to: Position;
  } | null>(null);
  const previewArrowRef = useRef<{
    from: Position;
    to: Position;
  } | null>(null);
  const start = (row: number, col: number, game: Game) => {
    setPreviewCircle({ row, col });
    previewCircleRef.current = { row, col };
    const handleMouseMove = (event: MouseEvent) => {
      const dropTarget = getTargetSquare(event);
      if (dropTarget) {
        const toRow = Number(dropTarget.dataset.row);
        const toCol = Number(dropTarget.dataset.col);
        if (col !== toCol || row !== toRow) {
          setPreviewCircle(null);
          previewCircleRef.current = null;
          setPreviewArrow({
            from: { col, row },
            to: { col: toCol, row: toRow },
          });
          previewArrowRef.current = {
            from: { col, row },
            to: { col: toCol, row: toRow },
          };
        }
      }
    };
    const handleMouseUp = () => {
      console.log(previewCircleRef.current);
      const previewCircle = previewCircleRef.current;
      const previewArrow = previewArrowRef.current;
      if (previewArrow) {
        if (
          game.annotations.arrows.find(
            (el) =>
              el.from.col === previewArrow.from.col &&
              el.from.row === previewArrow.from.row &&
              el.to.row === previewArrow.to.row &&
              el.to.col === previewArrow.to.col,
          )
        ) {
          game.annotations.arrows = game.annotations.arrows.filter(
            (el) =>
              el.from.col !== previewArrow.from.col ||
              el.from.row !== previewArrow.from.row ||
              el.to.row !== previewArrow.to.row ||
              el.to.col !== previewArrow.to.col,
          );
        } else {
          game.annotations.arrows.push(previewArrow);
        }
      } else if (previewCircle) {
        if (
          game.annotations.circles.find(
            (el) =>
              el.col === previewCircle.col && el.row === previewCircle.row,
          )
        ) {
          game.annotations.circles = game.annotations.circles.filter(
            (el) =>
              el.col !== previewCircle.col || el.row !== previewCircle.row,
          );
        } else {
          game.annotations.circles.push(previewCircle);
        }
      }
      setPreviewCircle(null);
      previewCircleRef.current = null;
      setPreviewArrow(null);
      previewArrowRef.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  return { previewCircle, previewArrow, start };
};

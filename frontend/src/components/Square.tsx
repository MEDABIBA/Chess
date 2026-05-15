import React, { memo, useEffect, useRef } from 'react';
import { useStore } from '../provider/context';
import Piece from '../models/Piece';
import { PieceType, Position } from '../types/types';
import getTargetSquare from '../helpers/getTargetSquare';
import tryMove from '../helpers/tryMove';
import Game from '../models/Game';
import MateAnimationIcon from './MateAnimationIcon';
import { observer } from 'mobx-react-lite';

interface SquareProps {
  color: string;
  position: Position;
  isActiveField?: '' | 'square-active' | 'square-attack';
  activePiece?: Piece | null;
  piece?: Piece | null;
  isLastMove?: 'last-move' | '';
  premove?: 'square-premove-from' | 'square-premove-to' | '';
  hightlightKingAttacked?: boolean;
  grabbed?: boolean;
  animationTarget?: { from: Position; to: Position } | null;
  onRightClick: (row: number, col: number, game: Game) => void;
  annotatedCircle: 'annotated-circle' | '';
}
const SquareComponent: React.FC<SquareProps> = ({
  color,
  position,
  piece,
  isLastMove = '',
  isActiveField = '',
  activePiece = null,
  premove = '',
  hightlightKingAttacked = false,
  grabbed = false,
  animationTarget = null,
  onRightClick,
  annotatedCircle = false,
}) => {
  const { row, col } = position;
  const imgRef = useRef<HTMLImageElement | null>(null);
  const touchSetPremoveRef = useRef(false);
  const store = useStore();
  const { games } = store;
  const { currentGame: game } = games;
  if (game === null) return;
  const {
    makeMove,
    setActivePiece,
    setAvailableMoves,
    setAvailablePremoves,
    setGrab,
  } = game;
  const isActivePieceSquare =
    position.col === activePiece?.position.col &&
    position.row === activePiece?.position.row
      ? 'active-piece'
      : '';
  useEffect(() => {
    if (animationTarget) {
      const movingFrom = animationTarget.from;
      const movingTo = animationTarget.to;
      const isMovingPiece =
        movingFrom?.row === position.row && movingFrom?.col === position.col;
      if (!isMovingPiece) return;
      const fromSquare = document.querySelector(
        `.square[data-row="${movingFrom.row}"][data-col="${movingFrom.col}"]`,
      );
      const toSquare = document.querySelector(
        `.square[data-row="${movingTo.row}"][data-col="${movingTo.col}"]`,
      );
      if (!fromSquare || !toSquare || !imgRef.current) return;
      const fromRect = fromSquare.getBoundingClientRect();
      const toRect = toSquare.getBoundingClientRect();
      const deltaX = toRect.left - fromRect.left;
      const deltaY = toRect.top - fromRect.top;
      imgRef.current.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
      imgRef.current.style.transition = 'transform 0.2s ease-out';
    }
  }, [animationTarget, position]);

  const handleMoveToSquare = (
    game: Game,
    piece: Piece,
    to: Position,
    animation = false,
  ) => {
    if (game.isPromotion(piece, to)) {
      game.setPendingPremove(null);
      game.setPendingPromotionPiece({
        piece: null,
        from: piece.position,
        to: to,
        color: piece.color,
      });
    } else {
      if (!game.blackPlayerNickname || game.currentPlayer !== game.yourColor)
        return;
      makeMove(piece.position, to, animation);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // console.log('row', row, ', col', col);
    if (touchSetPremoveRef.current) {
      touchSetPremoveRef.current = false;
      return;
    }
    game.setPendingPremove(null);

    if (e.button === 0) {
      game.annotations.clearAnnoations();
    }
    if (e.button === 2) {
      onRightClick(row, col, game);
      return;
    }

    if (
      game.pendingPromotionPiece &&
      (!piece || piece.color === game.pendingPromotionPiece.color)
    ) {
      games?.currentGame?.setPendingPromotionPiece(null);
    }
    if (activePiece?.position) {
      const square = getTargetSquare(e.nativeEvent);
      if (!square) return;
      tryMove(square, game, activePiece, handleMoveToSquare);
      setActivePiece(null);

      if (game.pendingPromotionPiece) return;

      if (
        !game.moveAvailableForPiece(activePiece) &&
        !game.isPromotion(activePiece, position) &&
        (activePiece.position.col !== position.col ||
          activePiece.position.row !== position.row)
      ) {
        game.setPendingPremove({ from: activePiece.position, to: position });
        setAvailableMoves(null);
      } else {
        setAvailableMoves(null);
        setAvailablePremoves(null);
      }
    }
    if (!piece || !imgRef.current) return;
    if (piece && piece?.color !== game.yourColor) {
      return;
    }

    e.preventDefault();
    if (game.moveAvailableForPiece(piece)) {
      setAvailableMoves([piece, position]);
    } else if (!premove && !isActiveField) {
      game.setAvailablePremoves([piece, position]);
    }
    setActivePiece(piece);

    const img = imgRef.current;
    const rect = img.getBoundingClientRect();
    const shiftX = e.clientX - rect.left;
    const shiftY = e.clientY - rect.top;

    img.style.opacity = '0.3';
    document.body.classList.add('dragging');
    const clone = document.createElement('img');
    clone.src = img.src;
    clone.style.width = `${rect.width}px`;
    clone.style.height = `${rect.height}px`;
    clone.style.position = 'fixed';
    clone.style.left = '0';
    clone.style.top = '0';
    clone.style.zIndex = '9999';
    clone.style.pointerEvents = 'none';
    clone.style.transform = `translate3d(${e.clientX - shiftX}px, ${e.clientY - shiftY}px, 0)`;

    document.body.appendChild(clone);

    const handleMouseMove = (event: MouseEvent) => {
      const dropTarget = getTargetSquare(event);
      if (dropTarget) {
        const toRow = Number(dropTarget.dataset.row);
        const toCol = Number(dropTarget.dataset.col);
        setGrab({ row: toRow, col: toCol });
        clone.style.transform = `translate3d(${event.clientX - shiftX}px, ${
          event.clientY - shiftY
        }px, 0)`;
      }
    };
    const handleMouseUp = (event: MouseEvent) => {
      setGrab(null);
      document.body.classList.remove('dragging');
      img.style.opacity = '1';
      clone.remove();
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      const square = getTargetSquare(event);
      if (!square) return;
      const toRow = Number(square.dataset.row);
      const toCol = Number(square.dataset.col);
      if (
        !game.moveAvailableForPiece(piece) &&
        !game.isPromotion(piece, { row: toRow, col: toCol }) &&
        (piece.position.col !== toCol || piece.position.row !== toRow)
      ) {
        game.setPendingPremove({
          from: piece.position,
          to: { row: toRow, col: toCol },
        });
        setActivePiece(null);
        setAvailableMoves(null);
      }
      handleMoveToSquare(game, piece, { row: toRow, col: toCol });
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    // console.log('row', row, ', col', col);
    game.setPendingPremove(null);

    if (
      game.pendingPromotionPiece &&
      (!piece || piece.color === game.pendingPromotionPiece.color)
    ) {
      games?.currentGame?.setPendingPromotionPiece(null);
    }
    if (activePiece?.position) {
      if (!e.changedTouches[0]?.clientX || !e.changedTouches[0]?.clientY)
        return null;
      const dropTarget = document.elementFromPoint(
        e.changedTouches[0]?.clientX,
        e.changedTouches[0]?.clientY,
      ) as HTMLElement | null;
      const square = dropTarget?.closest('.square') as HTMLElement | null;
      if (!square) return;
      tryMove(square, game, activePiece, handleMoveToSquare);
      setActivePiece(null);

      if (game.pendingPromotionPiece) return;

      if (
        !game.moveAvailableForPiece(activePiece) &&
        !game.isPromotion(activePiece, position) &&
        (activePiece.position.col !== position.col ||
          activePiece.position.row !== position.row)
      ) {
        game.setPendingPremove({ from: activePiece.position, to: position });
        setAvailableMoves(null);
        touchSetPremoveRef.current = true;
      } else {
        setAvailableMoves(null);
        setAvailablePremoves(null);
      }
    }
    if (!piece || !imgRef.current) return;
    if (piece && piece?.color !== game.yourColor) {
      return;
    }

    e.preventDefault();
    if (game.moveAvailableForPiece(piece)) {
      setAvailableMoves([piece, position]);
    } else if (!premove) {
      game.setAvailablePremoves([piece, position]);
    }
    setActivePiece(piece);

    const img = imgRef.current;
    const rect = img.getBoundingClientRect();
    const touch = e.touches[0];
    if (!touch) {
      return;
    }
    const shiftX = touch.clientX - rect.left;
    const shiftY = touch.clientY - rect.top;

    img.style.opacity = '0.3';
    document.body.classList.add('dragging');
    const clone = document.createElement('img');
    clone.src = img.src;
    clone.style.width = `${rect.width}px`;
    clone.style.height = `${rect.height}px`;
    clone.style.position = 'fixed';
    clone.style.left = '0';
    clone.style.top = '0';
    clone.style.zIndex = '9999';
    clone.style.pointerEvents = 'none';
    clone.style.transform = `translate3d(${touch.clientX - shiftX}px, ${touch.clientY - shiftY}px, 0)`;

    document.body.appendChild(clone);

    const handleTouchMove = (event: TouchEvent) => {
      event.preventDefault();
      const t = event.touches[0];
      if (!t) {
        return;
      }
      if (!t.clientX || !t.clientY) return null;
      const target = document.elementFromPoint(
        t.clientX,
        t.clientY,
      ) as HTMLElement | null;
      const dropTarget = target?.closest('.square') as HTMLElement | null;
      if (dropTarget) {
        const toRow = Number(dropTarget.dataset.row);
        const toCol = Number(dropTarget.dataset.col);
        setGrab({ row: toRow, col: toCol });
        clone.style.transform = `translate3d(${t.clientX - shiftX}px, ${t.clientY - shiftY}px, 0)`;
      }
    };
    const handleTouchEnd = (e: TouchEvent) => {
      setGrab(null);
      document.body.classList.remove('dragging');
      img.style.opacity = '1';
      clone.remove();
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      if (!e.changedTouches[0]?.clientX || !e.changedTouches[0]?.clientY)
        return null;

      const dropTarget = document.elementFromPoint(
        e.changedTouches[0]?.clientX,
        e.changedTouches[0]?.clientY,
      ) as HTMLElement | null;
      const square = dropTarget?.closest('.square') as HTMLElement | null;
      if (!square) return;
      const toRow = Number(square.dataset.row);
      const toCol = Number(square.dataset.col);
      if (
        !game.moveAvailableForPiece(piece) &&
        !game.isPromotion(piece, { row: toRow, col: toCol }) &&
        (piece.position.col !== toCol || piece.position.row !== toRow)
      ) {
        game.setPendingPremove({
          from: piece.position,
          to: { row: toRow, col: toCol },
        });
        setActivePiece(null);
        setAvailableMoves(null);
      }
      handleMoveToSquare(game, piece, { row: toRow, col: toCol });
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });
  };

  return (
    <div
      className={`square ${color} ${annotatedCircle} ${isLastMove} ${isActiveField} ${premove} ${grabbed ? 'grabbed' : ''} ${isActivePieceSquare}`}
      data-row={row}
      data-col={col}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      style={{ position: 'relative' }}
    >
      {piece?.pieceType === PieceType.KING &&
        (game.gameStatus === 'checkmate' ||
          game.gameStatus === 'draw' ||
          game.gameStatus === 'stalemate') && (
          <MateAnimationIcon
            kingColor={piece.color}
            winner={
              game.winner
                ? game.winner === game.whitePlayerNickname
                  ? 'white'
                  : 'black'
                : null
            }
          />
        )}
      {piece && (
        <img
          ref={imgRef}
          height={40}
          width={40}
          className={`piece-img  ${hightlightKingAttacked ? 'king-hightlight' : ''}`}
          src={piece.getPiece()}
          alt="#"
          draggable={false}
          style={{ userSelect: 'none' }}
        />
      )}
    </div>
  );
};

const Square = memo(observer(SquareComponent), (prev, next) => {
  return (
    prev.piece === next.piece &&
    prev.color === next.color &&
    prev.position.row === next.position.row &&
    prev.position.col === next.position.col &&
    prev.isLastMove === next.isLastMove &&
    prev.isActiveField === next.isActiveField &&
    prev.activePiece === next.activePiece &&
    prev.premove === next.premove &&
    prev.hightlightKingAttacked === next.hightlightKingAttacked &&
    prev.grabbed === next.grabbed &&
    prev.animationTarget === next.animationTarget &&
    prev.annotatedCircle === next.annotatedCircle
  );
});
export default Square;

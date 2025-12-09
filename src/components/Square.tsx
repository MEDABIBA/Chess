import React, { memo, useEffect, useRef } from "react";
import { useStore } from "../provider/context";
import Piece from "../models/Piece";
import { Position } from "../types/types";
import getTargetSquare from "../helpers/getTargetSquare";
import tryMove from "../helpers/tryMove";

interface SquareProps {
  color: string;
  position: Position;
  isActiveField?: "" | "square-active" | "square-attack";
  piece?: Piece | null;
  isLastMove?: "last-move" | "";
  hightlightKingAttacked?: boolean;
  grabbed?: boolean;
  animationTarget?: { from: Position; to: Position } | null;
}
const SquareComponent: React.FC<SquareProps> = ({
  color,
  position,
  piece,
  isLastMove = "",
  isActiveField = "",
  hightlightKingAttacked = false,
  grabbed = false,
  animationTarget = null,
}) => {
  const { row, col } = position;
  const imgRef = useRef<HTMLImageElement | null>(null);
  const { board } = useStore();
  const {
    makeMove,
    getActivePiece,
    setActivePiece,
    setAvailableMoves,
    setGrab,
    setPendingPromotion,
  } = board;

  useEffect(() => {
    if (animationTarget) {
      const movingFrom = animationTarget?.from;
      const movingTo = animationTarget?.to;
      const isMovingPiece = movingFrom?.row === position.row && movingFrom?.col === position.col;
      if (!isMovingPiece) return;
      const fromSquare = document.querySelector(
        `.square[data-row="${movingFrom.row}"][data-col="${movingFrom.col}"]`
      );
      const toSquare = document.querySelector(
        `.square[data-row="${movingTo.row}"][data-col="${movingTo.col}"]`
      );
      if (!fromSquare || !toSquare || !imgRef.current) return;
      const fromRect = fromSquare.getBoundingClientRect();
      const toRect = toSquare.getBoundingClientRect();
      const deltaX = toRect.left - fromRect.left;
      const deltaY = toRect.top - fromRect.top;
      imgRef.current.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
      imgRef.current.style.transition = "transform 0.2s ease-out";
    }
  }, [animationTarget, position]);
  const handleMouseDown = (e: React.MouseEvent<HTMLImageElement>) => {
    console.log("row", row, ", col", col);
    const active = getActivePiece();
    if (
      board.pendingPromotionValue &&
      (!piece || piece.color === board.pendingPromotionValue.piece.color)
    ) {
      setPendingPromotion(null);
    }
    if (active?.position) {
      const square = getTargetSquare(e);
      if (!square) return;
      tryMove(square, active.position, makeMove);
      setActivePiece(null);
      setAvailableMoves(null);
      if (!piece) return;
    }
    if (!piece || !imgRef.current) return;

    if (piece.color !== board.currentPlayer) return;

    e.preventDefault();
    setAvailableMoves([piece, position]);
    setActivePiece(piece);

    const img = imgRef.current;
    const rect = img.getBoundingClientRect();
    const shiftX = e.clientX - rect.left;
    const shiftY = e.clientY - rect.top;

    img.style.opacity = "0.3";
    document.body.style.cursor = "grabbing";

    const clone = document.createElement("img");
    clone.src = img.src;
    clone.style.width = `${rect.width}px`;
    clone.style.height = `${rect.height}px`;
    clone.style.position = "fixed";
    clone.style.left = "0";
    clone.style.top = "0";
    clone.style.zIndex = "9999";
    clone.style.pointerEvents = "none";
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
      document.body.style.cursor = "default";
      img.style.opacity = "1";
      clone.remove();
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      const square = getTargetSquare(event);
      if (!square) return;
      const toRow = Number(square.dataset.row);
      const toCol = Number(square.dataset.col);
      makeMove(position, { row: toRow, col: toCol });
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLImageElement>) => {
    const active = getActivePiece();
    if (
      board.pendingPromotionValue &&
      (!piece || piece.color === board.pendingPromotionValue.piece.color)
    ) {
      setPendingPromotion(null);
    }
    if (active?.position) {
      if (!e.changedTouches[0]?.clientX || !e.changedTouches[0]?.clientY) return null;
      const dropTarget = document.elementFromPoint(
        e.changedTouches[0]?.clientX,
        e.changedTouches[0]?.clientY
      ) as HTMLElement | null;
      const square = dropTarget?.closest(".square") as HTMLElement | null;
      if (!square) return;
      tryMove(square, active.position, makeMove);
      setActivePiece(null);
      setAvailableMoves(null);
      if (!piece) return;
    }
    if (!piece || !imgRef.current) return;
    if (piece.color !== board.currentPlayer) return;

    setAvailableMoves([piece, position]);
    setActivePiece(piece);

    const img = imgRef.current;
    const rect = img.getBoundingClientRect();
    const touch = e.touches[0];
    if (!touch) {
      return;
    }
    const shiftX = touch.clientX - rect.left;
    const shiftY = touch.clientY - rect.top;

    img.style.opacity = "0.3";

    const clone = document.createElement("img");
    clone.src = img.src;
    clone.style.width = `${rect.width}px`;
    clone.style.height = `${rect.height}px`;
    clone.style.position = "fixed";
    clone.style.left = "0";
    clone.style.top = "0";
    clone.style.zIndex = "9999";
    clone.style.pointerEvents = "none";
    clone.style.transform = `translate3d(${touch.clientX - shiftX}px, ${
      touch.clientY - shiftY
    }px, 0)`;
    document.body.appendChild(clone);

    const handleTouchMove = (event: TouchEvent) => {
      event.preventDefault();
      const t = event.touches[0];
      if (!t) {
        return;
      }
      clone.style.transform = `translate3d(${t.clientX - shiftX}px, ${t.clientY - shiftY}px, 0)`;
    };

    const handleTouchEnd = (event: TouchEvent) => {
      img.style.opacity = "1";
      const t = event.changedTouches[0];
      if (!t) {
        return;
      }
      const dropTarget = document.elementFromPoint(t.clientX, t.clientY) as HTMLElement | null;
      const square = dropTarget?.closest(".square") as HTMLElement | null;
      if (square) {
        const toRow = Number(square.dataset.row);
        const toCol = Number(square.dataset.col);
        makeMove(position, { row: toRow, col: toCol });
      }

      clone.remove();
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd, { passive: false });
  };

  return (
    <div
      className={`square ${color} ${isLastMove} ${isActiveField} ${grabbed ? "grabbed" : ""}`}
      data-row={row}
      data-col={col}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      style={{ position: "relative" }}>
      {piece && (
        <img
          ref={imgRef}
          className={`piece-img  ${hightlightKingAttacked ? "king-hightlight" : ""}`}
          src={piece.getPiece()}
          alt="#"
          draggable={false}
          style={{ cursor: "grab", userSelect: "none" }}
        />
      )}
    </div>
  );
};

const Square = memo(SquareComponent, (prev, next) => {
  return (
    prev.piece === next.piece &&
    prev.color === next.color &&
    prev.position.row === next.position.row &&
    prev.position.col === next.position.col &&
    prev.isLastMove === next.isLastMove &&
    prev.isActiveField === next.isActiveField &&
    prev.hightlightKingAttacked === next.hightlightKingAttacked &&
    prev.grabbed === next.grabbed &&
    prev.animationTarget === next.animationTarget
  );
});
export default Square;

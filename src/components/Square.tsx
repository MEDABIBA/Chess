import React, { memo, useRef } from "react";
import { useStore } from "../provider/context";
import Piece from "../models/Piece";

interface SquareProps {
  color: string;
  position: { row: number; col: number };
  isActiveField: boolean;
  piece?: Piece | null;
}

const SquareComponent: React.FC<SquareProps> = ({ color, position, piece, isActiveField }) => {
  const { row, col } = position;
  const imgRef = useRef<HTMLImageElement | null>(null);
  const { boardStore } = useStore();
  const { makeMove, getActivePiece, setActivePiece, setAvailableMoves } = boardStore;

  console.log("redraw");
  const handleMouseDown = (e: React.MouseEvent<HTMLImageElement>) => {
    const active = getActivePiece();
    if (!piece || !imgRef.current) {
      if (active) {
        boardStore.availableMoves = [];
        setActivePiece(null);
      }
      if (active !== null && active.position !== undefined) {
        const position = active.position;
        const dropTarget = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
        const square = dropTarget?.closest(".square") as HTMLElement | null;
        if (!square) return;
        if (dropTarget?.closest(".square")) {
          const toRow = Number(square.dataset.row);
          const toCol = Number(square.dataset.col);
          makeMove(position, { row: toRow, col: toCol });
        }
      }
      return;
    } else if (piece && active !== null) {
      const position = active.position;
      const dropTarget = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
      const square = dropTarget?.closest(".square") as HTMLElement | null;
      if (!square) return;
      if (dropTarget?.closest(".square")) {
        const toRow = Number(square.dataset.row);
        const toCol = Number(square.dataset.col);
        makeMove(position, { row: toRow, col: toCol });
      }
      if (boardStore?.activePiece?.color !== boardStore.currentPlayer) {
        boardStore.availableMoves = [];
        setActivePiece(null);
        return;
      }
    }

    if (piece.color === boardStore.currentPlayer) {
      setAvailableMoves(piece, position);
      setActivePiece(piece);
    }
    e.preventDefault();

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
      clone.style.transform = `translate3d(${event.clientX - shiftX}px, ${
        event.clientY - shiftY
      }px, 0)`;
    };

    const handleMouseUp = (event: MouseEvent) => {
      document.body.style.cursor = "default";
      img.style.opacity = "1";

      const dropTarget = document.elementFromPoint(
        event.clientX,
        event.clientY
      ) as HTMLElement | null;
      const square = dropTarget?.closest(".square") as HTMLElement | null;
      if (!square) return;
      if (dropTarget?.closest(".square")) {
        const toRow = Number(square.dataset.row);
        const toCol = Number(square.dataset.col);
        makeMove(position, { row: toRow, col: toCol });
      }

      clone.remove();
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLImageElement>) => {
    if (!piece || !imgRef.current) return;
    e.preventDefault();

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
      if (dropTarget?.classList.contains("square")) {
        const toRow = Number(dropTarget.dataset.row);
        const toCol = Number(dropTarget.dataset.col);
        makeMove(position, { row: toRow, col: toCol });
      }

      clone.remove();
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };

    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);
  };

  return (
    <div
      className={`square ${color} ${isActiveField ? "square-active" : ""}`}
      data-row={row}
      data-col={col}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      style={{ position: "relative" }}>
      {piece && (
        <img
          ref={imgRef}
          className="piece-img"
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
    prev.isActiveField === next.isActiveField
  );
});
export default Square;
